/*
 * HIGH SCORE PRO - ESP32-C3 SENSOR FIRMWARE v7.0
 * ================================================
 *
 * Optimiert für ESP32-C3 mit 0.42" OLED & B05 FLAME SENSOR
 *
 * Hardware:
 * - ESP32-C3 DevKit mit integriertem 0.42" OLED (72x40)
 * - B05 Flame Sensor (IR 760-1100nm, aus 40-in-1 Kit)
 * - Optional: Button & Buzzer
 *
 * Pinout:
 * - GPIO 5  → I2C SDA (OLED)
 * - GPIO 6  → I2C SCL (OLED)
 * - GPIO 1  → Flame Sensor DO (Digital Output - LOW = Flamme erkannt!)
 * - GPIO 9  → Button (optional, interner Pull-up)
 * - GPIO 10 → Buzzer (optional)
 * - GPIO 8  → Onboard LED
 *
 * Flame Sensor Anschluss:
 * - VCC → 3.3V (oder 5V je nach Sensor)
 * - GND → GND
 * - DO  → GPIO 1 (Digital Output)
 *
 * Funktionsweise:
 * - Flame Sensor erkennt Feuerzeug-Flamme beim Anzünden
 * - DO gibt LOW wenn Flamme erkannt wird
 * - DO gibt HIGH wenn keine Flamme
 * - Empfindlichkeit einstellbar über Potentiometer am Sensor
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
#include <Preferences.h>
#include <ArduinoJson.h>
#include <DNSServer.h>

// ===== HARDWARE PINS (ESP32-C3) =====
#define I2C_SDA 5
#define I2C_SCL 6
#define FLAME_SENSOR_PIN 1
#define BUTTON_PIN 9
#define BUZZER_PIN 10
#define LED_PIN 8

// ===== DISPLAY CONFIG (0.42" OLED 72x40) =====
#define SCREEN_WIDTH 72
#define SCREEN_HEIGHT 40
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// ===== SETTINGS =====
#define FLAME_DEBOUNCE 100     // Entprellzeit in ms
#define SESSION_TIMEOUT 5000   // Max Session-Dauer in ms
#define COOLDOWN_TIME 3000     // Cooldown nach Hit in ms
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
WebServer server(80);
DNSServer dnsServer;
Preferences prefs;

// State
int todayHits = 0;
int totalHits = 0;
int currentStreak = 0;
int longestStreak = 0;
bool isFlameDetected = false;
bool isInSession = false;
unsigned long sessionStartTime = 0;
unsigned long lastHitTime = 0;
unsigned long lastFlameCheck = 0;
unsigned long cooldownUntil = 0;

// Display
int currentScreen = SCREEN_LIVE;
unsigned long lastScreenChange = 0;
unsigned long lastButtonPress = 0;
bool lastButtonState = HIGH;
bool displayOn = true;
unsigned long lastActivityTime = 0;

// Session Info
unsigned long lastSessionDuration = 0;
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
  Serial.println("\n\n=== HIGH SCORE PRO v7.0 ===");
  Serial.println("ESP32-C3 + B05 Flame Sensor");

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
  pinMode(FLAME_SENSOR_PIN, INPUT);  // Flame Sensor Digital Input

  Serial.print("Flame Sensor Pin: ");
  Serial.println(FLAME_SENSOR_PIN);

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
  Serial.println("Waiting for flame detection...");
}

// ===== MAIN LOOP =====
void loop() {
  server.handleClient();

  // DNS Server für Captive Portal (nur im AP Mode)
  if (isAPMode) {
    dnsServer.processNextRequest();
  }

  // Flame Sensor prüfen (alle 50ms)
  if (millis() - lastFlameCheck > 50) {
    checkFlameSensor();
    lastFlameCheck = millis();
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
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Reset!");
      display.display();
      prefs.clear();
      delay(1000);
    }
  }

  // Versuche Verbindung mit gespeicherten Credentials
  if (!resetConfig && savedSSID.length() > 0) {
    Serial.print("Connecting to: ");
    Serial.println(savedSSID);

    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("WiFi...");
    display.println(savedSSID.substring(0, 10));
    display.display();

    WiFi.mode(WIFI_STA);
    WiFi.begin(savedSSID.c_str(), savedPassword.c_str());

    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT) {
      delay(500);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
      wifiConnected = true;
      localIP = WiFi.localIP();
      Serial.println("\nConnected!");
      Serial.print("IP: ");
      Serial.println(localIP);

      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Connected!");
      display.println(localIP.toString());
      display.display();
      delay(2000);
      return;
    }
  }

  // AP Mode
  isAPMode = true;
  Serial.println("Starting AP Mode...");

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);

  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());

  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println("Setup Mode");
  display.println(AP_SSID);
  display.println("192.168.4.1");
  display.display();
  delay(2000);
}

// ===== HTTP SERVER =====
void setupServer() {
  // Live Data Endpoint (kompatibel mit React App)
  server.on("/api/data", HTTP_GET, []() {
    JsonDocument doc;
    doc["flame"] = isFlameDetected ? 1 : 0;
    doc["isInhaling"] = isInSession ? 1 : 0;
    doc["today"] = todayHits;
    doc["total"] = totalHits;
    doc["lastDuration"] = lastHitDuration;
    doc["streak"] = currentStreak;
    doc["longestStreak"] = longestStreak;
    doc["uptime"] = millis() / 1000;

    String json;
    serializeJson(doc, json);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", json);
  });

  // WiFi Scan
  server.on("/scan", HTTP_GET, []() {
    int n = WiFi.scanNetworks();
    JsonDocument doc;
    JsonArray networks = doc["networks"].to<JsonArray>();

    for (int i = 0; i < n; i++) {
      JsonObject net = networks.add<JsonObject>();
      net["ssid"] = WiFi.SSID(i);
      net["rssi"] = WiFi.RSSI(i);
      net["secure"] = (WiFi.encryptionType(i) != WIFI_AUTH_OPEN);
    }

    String json;
    serializeJson(doc, json);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", json);
  });

  // WiFi Connect
  server.on("/connect", HTTP_POST, []() {
    if (server.hasArg("plain")) {
      JsonDocument doc;
      deserializeJson(doc, server.arg("plain"));

      String ssid = doc["ssid"];
      String pass = doc["password"];

      prefs.putString("wifi_ssid", ssid);
      prefs.putString("wifi_pass", pass);

      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, "application/json", "{\"status\":\"ok\"}");

      delay(1000);
      ESP.restart();
    } else {
      server.send(400, "application/json", "{\"error\":\"no data\"}");
    }
  });

  // CORS
  server.on("/status", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });

  server.begin();
  Serial.println("HTTP server started");
}

// ===== FLAME SENSOR DETECTION =====
void checkFlameSensor() {
  // B05 Flame Sensor: LOW = Flamme erkannt, HIGH = keine Flamme
  int sensorValue = digitalRead(FLAME_SENSOR_PIN);
  isFlameDetected = (sensorValue == LOW);
}

// ===== SESSION DETECTION =====
void detectSession() {
  unsigned long now = millis();

  // Cooldown aktiv?
  if (now < cooldownUntil) {
    return;
  }

  // Start Session wenn Flamme erkannt
  if (isFlameDetected && !isInSession) {
    isInSession = true;
    sessionStartTime = now;
    digitalWrite(LED_PIN, HIGH);

    // Display reaktivieren bei Sensor-Trigger
    if (!displayOn) {
      displayOn = true;
      display.ssd1306_command(SSD1306_DISPLAYON);
      Serial.println("Display ON (flame detected)");
    }
    lastActivityTime = now;

    Serial.println(">>> FLAME DETECTED - SESSION START");
  }

  // Ende Session wenn Flamme weg UND Session läuft
  if (!isFlameDetected && isInSession) {
    unsigned long duration = now - sessionStartTime;

    // Nur registrieren wenn Session länger als 500ms
    if (duration > 500 && duration < SESSION_TIMEOUT) {
      registerHit(duration);
      cooldownUntil = now + COOLDOWN_TIME;  // 3 Sekunden Cooldown
    }

    isInSession = false;
    digitalWrite(LED_PIN, LOW);
    lastActivityTime = now;

    Serial.println("<<< FLAME GONE - SESSION END");
  }

  // Timeout: Session zu lang (>5s)
  if (isInSession && (now - sessionStartTime > SESSION_TIMEOUT)) {
    isInSession = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("<<< SESSION TIMEOUT");
  }
}

// ===== HIT REGISTRIEREN =====
void registerHit(unsigned long duration) {
  todayHits++;
  totalHits++;
  lastHitTime = millis();
  lastSessionDuration = duration;

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
  display.setTextSize(1);

  // Status-Anzeige oben
  display.setCursor(0, 0);
  if (isInSession) {
    display.print("BURNING");
    // Blinkendes Feuer-Symbol
    if (animFrame % 2 == 0) {
      display.fillCircle(64, 4, 2, SSD1306_WHITE);
    }
  } else {
    display.print("READY");
    // Statisches Symbol
    if (isFlameDetected) {
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

  // Fortschrittsbalken wenn Session aktiv
  if (isInSession) {
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
  display.drawLine(0, 9, 71, 9, SSD1306_WHITE);

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
  display.print("PRO v7.0");
  display.setCursor(0, 30);
  display.print("Flame Sensor");
  display.display();
  delay(2000);
}

// ===== BUZZER =====
void playTone(int freq, int duration) {
  tone(BUZZER_PIN, freq, duration);
}
