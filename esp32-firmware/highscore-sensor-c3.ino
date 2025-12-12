/*
 * HIGH SCORE PRO - ESP32-C3 SENSOR FIRMWARE v6.3
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
const char* ssid = "HighScore";
const char* password = "weed2024";

#define TEMP_THRESHOLD 50.0
#define COOLDOWN_TEMP 35.0
#define SESSION_TIMEOUT 5000

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

// Session Info
unsigned long lastSessionDuration = 0;
float lastSessionTemp = 0.0;
String lastSessionTime = "";
String lastSessionDate = "";

// WiFi
bool wifiConnected = false;
IPAddress localIP;

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

  Serial.println("=== READY ===");
}

// ===== MAIN LOOP =====
void loop() {
  server.handleClient();

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

  // Display Update
  updateDisplay();

  // Animation
  if (millis() - lastAnimUpdate > 200) {
    animFrame = (animFrame + 1) % 4;
    lastAnimUpdate = millis();
  }

  delay(50);
}

// ===== WIFI =====
void setupWiFi() {
  Serial.println("Starting WiFi AP...");
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);
  localIP = WiFi.softAPIP();

  Serial.print("AP IP: ");
  Serial.println(localIP);
  wifiConnected = true;
}

// ===== HTTP SERVER =====
void setupServer() {
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
    currentScreen = (currentScreen + 1) % NUM_SCREENS;
    lastButtonPress = millis();
    lastScreenChange = millis();
    playTone(1200, 30);
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

  // Status Icon rechts oben
  if (isInhaling) {
    // Pulsierender Punkt
    if (animFrame % 2 == 0) {
      display.fillCircle(66, 4, 3, SSD1306_WHITE);
    }
  } else {
    // WiFi Icon (3 Bögen)
    for (int i = 0; i < 3; i++) {
      display.drawCircle(66, 10, 3 + i*2, SSD1306_WHITE);
    }
  }

  // Trennlinie
  display.drawLine(0, 18, 72, 18, SSD1306_WHITE);

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
    int progress = min(72, (int)((millis() - sessionStartTime) / 30));
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
  display.print("WiFi");
  display.drawLine(0, 9, 72, 9, SSD1306_WHITE);

  // SSID
  display.setCursor(0, 12);
  display.print("SSID:");
  display.setCursor(0, 21);
  display.print(ssid);

  // IP
  display.setCursor(0, 30);
  display.print(localIP.toString());
}

// ===== BOOT SCREEN =====
void showBootScreen() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(6, 5);
  display.print("HIGHSCORE");
  display.setCursor(12, 18);
  display.print("PRO v6.3");
  display.setCursor(6, 30);
  display.print("ESP32-C3");
  display.display();
  delay(2000);
}

// ===== BUZZER =====
void playTone(int freq, int duration) {
  tone(BUZZER_PIN, freq, duration);
}
