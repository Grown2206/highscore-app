/*
 * HIGH SCORE PRO - ESP32-C3 SENSOR FIRMWARE v6.4
 * ================================================
 *
 * Optimiert für ESP32-C3 mit 0.42" OLED & DS18B20
 *
 * Hardware:
 * - ESP32-C3 DevKit mit integriertem 0.42" OLED (72x40)
 * - DS18B20 Temperatursensor (Dallas OneWire)
 * - Optional: Button & Buzzer
 *
 * Pinout:
 * - GPIO 5  → I2C SDA (OLED)
 * - GPIO 6  → I2C SCL (OLED)
 * - GPIO 1  → DS18B20 Data (4.7kΩ Pull-up zu 3.3V)
 * - GPIO 9  → Button (optional, interner Pull-up)
 * - GPIO 10 → Buzzer (optional)
 * - GPIO 8  → Onboard LED
 *
 * WiFi Setup:
 * - Ersteinrichtung: ESP32 startet als "HighScore-Setup" Access Point
 * - Captive Portal öffnet sich automatisch beim Verbinden
 * - WLAN-Netzwerk auswählen und Passwort eingeben
 * - Credentials werden im Flash gespeichert
 * - Bei jedem Start: Verbindung zum gespeicherten Netzwerk
 * - Reset: Button 5 Sekunden beim Booten halten
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <DNSServer.h>

// ===== HARDWARE PINS (ESP32-C3) =====
#define I2C_SDA 5
#define I2C_SCL 6
#define DS18B20_PIN 1
#define BUTTON_PIN 9
#define BUZZER_PIN 10
#define LED_PIN 8

// ===== DISPLAY CONFIG (0.42" OLED 72x40) =====
#define SCREEN_WIDTH 72
#define SCREEN_HEIGHT 40
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// ===== SETTINGS =====
#define TEMP_THRESHOLD 50.0
#define COOLDOWN_TEMP 35.0
#define SESSION_TIMEOUT 5000
#define DISPLAY_TIMEOUT 20000  // Display nach 20 Sekunden ausschalten

// WiFi Manager
#define WIFI_TIMEOUT 15000
#define AP_SSID "HighScore-Setup"
#define AP_PASSWORD "" // Kein Passwort für Setup
const byte DNS_PORT = 53;

// Display Screens
#define NUM_SCREENS 3
#define SCREEN_LIVE 0
#define SCREEN_STATS 1
#define SCREEN_WIFI 2

// ===== GLOBALS =====
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);
WebServer server(80);
DNSServer dnsServer;
Preferences prefs;

// State
int todayHits = 0;
int totalHits = 0;
int currentStreak = 0;
int longestStreak = 0;
float currentTemp = 0.0;
bool isInhaling = false;
unsigned long sessionStartTime = 0;
unsigned long lastHitTime = 0;
unsigned long lastTempRead = 0;

// Display
int currentScreen = SCREEN_LIVE;
unsigned long lastScreenChange = 0;
unsigned long lastButtonPress = 0;
bool lastButtonState = HIGH;
bool displayOn = true;
unsigned long lastActivityTime = 0;

// Session Info
unsigned long lastSessionDuration = 0;
float lastSessionTemp = 0.0;
String lastSessionTime = "";
String lastSessionDate = "";

// WiFi
bool wifiConnected = false;
bool isAPMode = false;
IPAddress localIP;
String savedSSID = "";
String savedPassword = "";

// Animation
int animFrame = 0;
unsigned long lastAnimUpdate = 0;

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n=== HIGH SCORE PRO v6.3 ===");
  Serial.println("ESP32-C3 + DS18B20");

  // I2C mit benutzerdefinierten Pins initialisieren
  Wire.begin(I2C_SDA, I2C_SCL);

  // Display init
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 init failed!"));
    while(1) { delay(100); }
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  showBootScreen();

  // Pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

  // DS18B20 starten
  tempSensor.begin();
  tempSensor.setResolution(12); // 12-bit Genauigkeit
  Serial.print("DS18B20 Devices: ");
  Serial.println(tempSensor.getDeviceCount());

  // Preferences laden
  prefs.begin("highscore", false);
  totalHits = prefs.getInt("totalHits", 0);
  currentStreak = prefs.getInt("streak", 0);
  longestStreak = prefs.getInt("longestStreak", 0);
  lastSessionDate = prefs.getString("lastDate", "");

  // WiFi AP
  setupWiFi();

  // HTTP Server
  setupServer();

  // Ready!
  playTone(1000, 100);
  delay(50);
  playTone(1500, 100);

  // Display Activity initialisieren
  lastActivityTime = millis();

  Serial.println("=== READY ===");
}

// ===== MAIN LOOP =====
void loop() {
  server.handleClient();

  // DNS Server für Captive Portal (nur im AP Mode)
  if (isAPMode) {
    dnsServer.processNextRequest();
  }

  // Temperatur lesen (DS18B20 braucht Zeit)
  if (millis() - lastTempRead > 500) {
    readTemperature();
    lastTempRead = millis();
  }

  // Session Detection
  detectSession();

  // Button
  handleButton();

  // Auto Screen Rotation
  if (millis() - lastScreenChange > 3000 && millis() - lastButtonPress > 10000) {
    currentScreen = (currentScreen + 1) % NUM_SCREENS;
    lastScreenChange = millis();
  }

  // Display Timeout Check
  if (displayOn && (millis() - lastActivityTime > DISPLAY_TIMEOUT)) {
    displayOn = false;
    display.ssd1306_command(SSD1306_DISPLAYOFF);
    Serial.println("Display OFF (timeout)");
  }

  // Display Update
  if (displayOn) {
    updateDisplay();
  }

  // Animation
  if (millis() - lastAnimUpdate > 200) {
    animFrame = (animFrame + 1) % 4;
    lastAnimUpdate = millis();
  }

  delay(50);
}

// ===== WIFI =====
void setupWiFi() {
  // Credentials aus Preferences laden
  savedSSID = prefs.getString("wifi_ssid", "");
  savedPassword = prefs.getString("wifi_pass", "");

  // Check for Config Reset (Button 5s beim Boot)
  bool resetConfig = false;
  if (digitalRead(BUTTON_PIN) == LOW) {
    Serial.println("Button pressed - checking for config reset...");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("Hold 5s");
    display.println("to reset");
    display.display();

    unsigned long pressStart = millis();
    while (digitalRead(BUTTON_PIN) == LOW && millis() - pressStart < 5000) {
      delay(100);
    }

    if (millis() - pressStart >= 5000) {
      resetConfig = true;
      prefs.putString("wifi_ssid", "");
      prefs.putString("wifi_pass", "");
      savedSSID = "";
      savedPassword = "";
      playTone(2000, 500);
      Serial.println("WiFi Config Reset!");

      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Config");
      display.println("Reset!");
      display.display();
      delay(2000);
    }
  }

  // Versuche Verbindung mit gespeicherten Credentials
  if (savedSSID.length() > 0 && !resetConfig) {
    Serial.print("Connecting to: ");
    Serial.println(savedSSID);

    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("Connect");
    display.println(savedSSID.substring(0, 10));
    display.display();

    WiFi.mode(WIFI_STA);
    WiFi.begin(savedSSID.c_str(), savedPassword.c_str());

    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      wifiConnected = true;
      isAPMode = false;
      localIP = WiFi.localIP();

      Serial.print("Connected! IP: ");
      Serial.println(localIP);

      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("WiFi OK");
      display.print(localIP[0]); display.print(".");
      display.print(localIP[1]); display.print(".");
      display.println(localIP[2]);
      display.print("."); display.println(localIP[3]);
      display.display();
      delay(3000);

      return;
    } else {
      Serial.println("Connection failed - starting AP mode");
    }
  }

  // Starte Access Point + Captive Portal
  startConfigPortal();
}

void startConfigPortal() {
  Serial.println("Starting Config Portal...");
  isAPMode = true;
  wifiConnected = false;

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  localIP = WiFi.softAPIP();

  Serial.print("AP IP: ");
  Serial.println(localIP);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println("Setup");
  display.println("WiFi:");
  display.println(AP_SSID);
  display.display();

  // DNS Server für Captive Portal
  dnsServer.start(DNS_PORT, "*", localIP);

  // Config Webserver Routes
  server.on("/", HTTP_GET, handleConfigRoot);
  server.on("/scan", HTTP_GET, handleScan);
  server.on("/save", HTTP_POST, handleSave);
  server.onNotFound(handleConfigRoot); // Captive Portal redirect

  Serial.println("Config Portal ready!");
  playTone(1000, 200);
  delay(100);
  playTone(1500, 200);
}

void handleConfigRoot() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>HighScore WiFi Setup</title>";
  html += "<style>body{font-family:Arial;max-width:400px;margin:40px auto;padding:20px;background:#0a0a0a;color:#fff;}";
  html += "h1{color:#10b981;text-align:center;font-size:24px;}";
  html += "input,select,button{width:100%;padding:12px;margin:8px 0;border:1px solid #333;background:#1a1a1a;color:#fff;border-radius:8px;font-size:16px;}";
  html += "button{background:#10b981;color:#000;font-weight:bold;cursor:pointer;}";
  html += "button:hover{background:#059669;}</style></head><body>";
  html += "<h1>🌿 HighScore</h1><h2 style='text-align:center;color:#666;'>WiFi Setup</h2>";
  html += "<form action='/save' method='POST'>";
  html += "<label>Netzwerk:</label><select id='ssid' name='ssid' onchange='document.getElementById(\"psk\").focus()'>";

  // Scan networks
  int n = WiFi.scanNetworks();
  for (int i = 0; i < n && i < 15; i++) {
    html += "<option value='" + WiFi.SSID(i) + "'>" + WiFi.SSID(i) + " (" + WiFi.RSSI(i) + "dBm)</option>";
  }

  html += "</select>";
  html += "<label>Passwort:</label><input type='password' id='psk' name='password' placeholder='WLAN Passwort' required>";
  html += "<button type='submit'>Verbinden</button></form>";
  html += "<p style='text-align:center;color:#666;font-size:12px;margin-top:30px;'>Nach erfolgreicher Verbindung zeigt das Display die IP-Adresse an.</p>";
  html += "</body></html>";

  server.send(200, "text/html", html);
}

void handleScan() {
  String json = "[";
  int n = WiFi.scanNetworks();
  for (int i = 0; i < n; i++) {
    if (i > 0) json += ",";
    json += "{\"ssid\":\"" + WiFi.SSID(i) + "\",\"rssi\":" + String(WiFi.RSSI(i)) + "}";
  }
  json += "]";
  server.send(200, "application/json", json);
}

void handleSave() {
  String ssid = server.arg("ssid");
  String password = server.arg("password");

  Serial.println("Saving WiFi config...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  prefs.putString("wifi_ssid", ssid);
  prefs.putString("wifi_pass", password);

  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<style>body{font-family:Arial;max-width:400px;margin:40px auto;padding:20px;background:#0a0a0a;color:#fff;text-align:center;}";
  html += "h1{color:#10b981;}</style></head><body>";
  html += "<h1>✅ Gespeichert!</h1><p>ESP32 startet neu und verbindet sich mit:<br><strong>" + ssid + "</strong></p>";
  html += "<p style='color:#666;margin-top:30px;'>Die IP-Adresse wird im Display angezeigt.</p></body></html>";

  server.send(200, "text/html", html);

  delay(2000);
  ESP.restart();
}

// ===== HTTP SERVER =====
void setupServer() {
  // API Routes nur im normalen Modus, nicht im Config Portal
  if (!isAPMode) {
    // Live Data
    server.on("/api/data", HTTP_GET, []() {
      JsonDocument doc;
      doc["temp"] = currentTemp;
      doc["today"] = todayHits;
      doc["total"] = totalHits;
      doc["inhaling"] = isInhaling;
      doc["streak"] = currentStreak;
      doc["longestStreak"] = longestStreak;
      doc["lastSession"] = lastSessionTime;

      String output;
      serializeJson(doc, output);
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, "application/json", output);
    });

    // Stats
    server.on("/api/stats", HTTP_GET, []() {
      JsonDocument doc;
      doc["totalHits"] = totalHits;
      doc["todayHits"] = todayHits;
      doc["currentStreak"] = currentStreak;
      doc["longestStreak"] = longestStreak;
      doc["lastSessionDuration"] = lastSessionDuration;
      doc["lastSessionTemp"] = lastSessionTemp;
      doc["lastSessionTime"] = lastSessionTime;
      doc["uptime"] = millis() / 1000;
      doc["ip"] = localIP.toString();

      String output;
      serializeJson(doc, output);
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, "application/json", output);
    });

    // Reset Today
    server.on("/api/reset-today", HTTP_POST, []() {
      todayHits = 0;
      server.send(200, "text/plain", "Today reset");
      playTone(800, 150);
    });
  }

  server.begin();
  Serial.println("HTTP Server started");
}

// ===== TEMPERATUR LESEN (DS18B20) =====
void readTemperature() {
  tempSensor.requestTemperatures();
  float temp = tempSensor.getTempCByIndex(0);

  // Gültigkeit prüfen
  if (temp != DEVICE_DISCONNECTED_C && temp > -50 && temp < 150) {
    currentTemp = temp;
  }
}

// ===== SESSION DETECTION =====
void detectSession() {
  // Start
  if (currentTemp >= TEMP_THRESHOLD && !isInhaling) {
    isInhaling = true;
    sessionStartTime = millis();
    digitalWrite(LED_PIN, HIGH);

    // Display reaktivieren bei Sensor-Trigger
    if (!displayOn) {
      displayOn = true;
      display.ssd1306_command(SSD1306_DISPLAYON);
      Serial.println("Display ON (sensor trigger)");
    }
    lastActivityTime = millis();

    Serial.println(">>> INHALE START");
  }

  // Ende
  if (currentTemp < COOLDOWN_TEMP && isInhaling) {
    isInhaling = false;
    digitalWrite(LED_PIN, LOW);
    unsigned long duration = millis() - sessionStartTime;

    if (duration > 500) {
      registerHit(duration);
    }

    lastActivityTime = millis(); // Activity bei Ende
    Serial.println("<<< INHALE END");
  }
}

// ===== HIT REGISTRIEREN =====
void registerHit(unsigned long duration) {
  todayHits++;
  totalHits++;
  lastHitTime = millis();
  lastSessionDuration = duration;
  lastSessionTemp = currentTemp;

  // Zeit
  unsigned long sec = millis() / 1000;
  int h = (sec / 3600) % 24;
  int m = (sec / 60) % 60;
  lastSessionTime = String(h) + ":" + (m < 10 ? "0" : "") + String(m);

  // Streak
  updateStreak();

  // Speichern
  prefs.putInt("totalHits", totalHits);
  prefs.putInt("streak", currentStreak);
  prefs.putInt("longestStreak", longestStreak);

  // Feedback
  playTone(1500, 50);
  delay(50);
  playTone(2000, 50);

  Serial.print("HIT #");
  Serial.print(totalHits);
  Serial.print(" (");
  Serial.print(duration / 1000.0, 1);
  Serial.println("s)");
}

// ===== STREAK UPDATE =====
void updateStreak() {
  String today = String(millis() / 86400000);

  if (today != lastSessionDate) {
    currentStreak++;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    lastSessionDate = today;
    prefs.putString("lastDate", today);
  }
}

// ===== BUTTON =====
void handleButton() {
  bool state = digitalRead(BUTTON_PIN);

  if (state == LOW && lastButtonState == HIGH && millis() - lastButtonPress > 300) {
    // Display reaktivieren wenn aus
    if (!displayOn) {
      displayOn = true;
      display.ssd1306_command(SSD1306_DISPLAYON);
      lastActivityTime = millis();
      Serial.println("Display ON (button)");
    } else {
      // Screen wechseln wenn Display an
      currentScreen = (currentScreen + 1) % NUM_SCREENS;
      lastScreenChange = millis();
      playTone(1200, 30);
    }
    lastButtonPress = millis();
    lastActivityTime = millis();
  }

  lastButtonState = state;
}

// ===== DISPLAY =====
void updateDisplay() {
  display.clearDisplay();

  switch(currentScreen) {
    case SCREEN_LIVE:
      drawLiveScreen();
      break;
    case SCREEN_STATS:
      drawStatsScreen();
      break;
    case SCREEN_WIFI:
      drawWiFiScreen();
      break;
  }

  display.display();
}

// ===== SCREEN 1: LIVE (72x40) =====
void drawLiveScreen() {
  // Temperatur (groß)
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(currentTemp, 0);
  display.setTextSize(1);
  display.print("C");

  // Status Icon rechts oben (innerhalb 72px Grenze)
  if (isInhaling) {
    // Pulsierender Punkt
    if (animFrame % 2 == 0) {
      display.fillCircle(64, 4, 2, SSD1306_WHITE);
    }
  } else {
    // WiFi Icon - simple dot
    if (wifiConnected) {
      display.fillCircle(64, 4, 2, SSD1306_WHITE);
    } else {
      display.drawCircle(64, 4, 2, SSD1306_WHITE);
    }
  }

  // Trennlinie
  display.drawLine(0, 18, 71, 18, SSD1306_WHITE);

  // Hits
  display.setTextSize(1);
  display.setCursor(0, 22);
  display.print("T:");
  display.print(todayHits);

  display.setCursor(0, 31);
  display.print("#:");
  display.print(totalHits);

  // Fortschrittsbalken wenn inhaling
  if (isInhaling) {
    int progress = min(71, (int)((millis() - sessionStartTime) / 30));
    display.fillRect(0, 38, progress, 2, SSD1306_WHITE);
  }
}

// ===== SCREEN 2: STATS (72x40) =====
void drawStatsScreen() {
  display.setTextSize(1);

  // Titel
  display.setCursor(0, 0);
  display.print("STATS");
  display.drawLine(0, 9, 72, 9, SSD1306_WHITE);

  // Today
  display.setCursor(0, 12);
  display.print("Today:");
  display.setCursor(45, 12);
  display.print(todayHits);

  // Total
  display.setCursor(0, 21);
  display.print("Total:");
  display.setCursor(45, 21);
  display.print(totalHits);

  // Streak
  display.setCursor(0, 30);
  display.print("Streak:");
  display.setCursor(45, 30);
  display.print(currentStreak);
  display.print("/");
  display.print(longestStreak);
}

// ===== SCREEN 3: WIFI INFO (72x40) =====
void drawWiFiScreen() {
  display.setTextSize(1);

  // Titel
  display.setCursor(0, 0);
  if (isAPMode) {
    display.print("Setup");
  } else {
    display.print("WiFi");
  }
  display.drawLine(0, 9, 71, 9, SSD1306_WHITE);

  if (isAPMode) {
    // AP Mode
    display.setCursor(0, 12);
    display.print(AP_SSID);
    display.setCursor(0, 21);
    display.print("192.168.4.1");
  } else {
    // Connected Mode
    display.setCursor(0, 12);
    if (savedSSID.length() > 10) {
      display.print(savedSSID.substring(0, 10));
    } else {
      display.print(savedSSID);
    }
    display.setCursor(0, 21);
    display.print(localIP.toString());
  }
}

// ===== BOOT SCREEN =====
void showBootScreen() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(6, 5);
  display.print("HIGHSCORE");
  display.setCursor(12, 18);
  display.print("PRO v6.4");
  display.setCursor(6, 30);
  display.print("ESP32-C3");
  display.display();
  delay(2000);
}

// ===== BUZZER =====
void playTone(int freq, int duration) {
  tone(BUZZER_PIN, freq, duration);
}
