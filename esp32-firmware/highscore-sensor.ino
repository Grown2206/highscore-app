/*
 * HIGH SCORE PRO - ESP32 SENSOR FIRMWARE v7.0
 * =============================================
 *
 * Advanced Cannabis Session Tracker with OLED Display
 *
 * Hardware Requirements:
 * - ESP32 DevKit V1 (oder ähnlich)
 * - SSD1306 128x64 OLED Display (I2C)
 * - DHT22 Temperatur/Luftfeuchtigkeit Sensor
 * - Button (für Display-Wechsel)
 * - Optional: Buzzer für akustisches Feedback
 * - Optional: Batterie mit Spannungsteiler (für Akkubetrieb)
 *
 * Pinbelegung:
 * - SDA -> GPIO 21
 * - SCL -> GPIO 22
 * - DHT22 -> GPIO 4
 * - Button -> GPIO 5 (Pull-up)
 * - Buzzer -> GPIO 18 (optional)
 * - Battery ADC -> GPIO 34 (optional, über Spannungsteiler)
 *
 * Features:
 * - Multi-Screen OLED Display
 * - WiFi Access Point & HTTP Server
 * - Automatische Session-Erkennung
 * - Flammen-Detektion
 * - Min/Max Session-Dauer Tracking
 * - Batterie-Monitoring (optional)
 * - Offline Hit-Zwischenspeicherung & Sync
 * - Vollständige API-Kompatibilität mit Web-App
 *
 * Changelog v7.0:
 * - API-Kompatibilität mit TypeScript Interfaces verbessert
 * - Flame detection hinzugefügt
 * - Battery monitoring hinzugefügt
 * - Min/Max session duration tracking
 * - Vereinfachte Pending Hits Struktur
 * - Time sync status
 * - Verbesserte Fehlerbehandlung
 * - Code-Qualität Verbesserungen
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <Preferences.h>
#include <ArduinoJson.h>

// ===== KONFIGURATION =====

// WiFi Einstellungen
const char* ssid = "HighScore-Sensor";
const char* password = "highscore2024";

// Hardware Pins
#define DHT_PIN 4
#define BUTTON_PIN 5
#define BUZZER_PIN 18
#define BATTERY_PIN 34  // ADC Pin für Batteriemessung (optional)

// Display Konfiguration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Sensor Einstellungen
#define DHT_TYPE DHT22
#define TEMP_THRESHOLD 50.0      // Temperatur für Flammen-Detektion
#define FLAME_THRESHOLD 45.0     // Niedrigere Schwelle für flame flag
#define SESSION_TIMEOUT 5000
#define COOLDOWN_TEMP 35.0

// Batterie Einstellungen (optional)
#define BATTERY_ENABLED false     // Auf true setzen wenn Batterie verwendet wird
#define BATTERY_MIN_VOLTAGE 3.3   // Minimale Batterie-Spannung
#define BATTERY_MAX_VOLTAGE 4.2   // Maximale Batterie-Spannung
#define VOLTAGE_DIVIDER_RATIO 2.0 // Spannungsteiler-Verhältnis (R1+R2)/R2

// Offline Sync Einstellungen
#define MAX_PENDING_HITS 100      // Maximale Anzahl gespeicherter unsynced hits

// Display Screens
#define NUM_SCREENS 4
#define SCREEN_LIVE 0
#define SCREEN_STATS 1
#define SCREEN_STREAKS 2
#define SCREEN_LAST_SESSION 3

// ===== GLOBALE OBJEKTE =====

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
DHT dht(DHT_PIN, DHT_TYPE);
WebServer server(80);
Preferences prefs;

// ===== GLOBALE VARIABLEN =====

// Session Tracking
int todayHits = 0;
int totalHits = 0;
float currentTemp = 0.0;
float currentHumidity = 0.0;
bool isInhaling = false;
bool flameDetected = false;
unsigned long sessionStartTime = 0;
unsigned long lastHitTime = 0;
unsigned long lastSessionDuration = 0;

// Session Duration Tracking
unsigned long minSessionDuration = 0;
unsigned long maxSessionDuration = 0;

// Battery Monitoring
float batteryVoltage = 0.0;
int batteryPercent = 0;

// Display Management
int currentScreen = SCREEN_LIVE;
unsigned long lastScreenChange = 0;
unsigned long lastButtonPress = 0;
bool lastButtonState = HIGH;
const unsigned long SCREEN_ROTATION_INTERVAL = 5000;

// Streak Tracking
int currentStreak = 0;
int longestStreak = 0;
String lastSessionDate = "";

// Letzte Session Info
float lastSessionTemp = 0.0;
String lastSessionTime = "";

// WiFi Status
bool wifiConnected = false;
int clientsConnected = 0;

// Animation
int animFrame = 0;
unsigned long lastAnimUpdate = 0;

// Time Sync Status
bool timeSync = false;

// Offline Sync - Vereinfachte Pending Hits Struktur
struct PendingHit {
  unsigned long timestamp;   // Zeitstempel (millis seit ESP32 Start)
  unsigned long duration;    // Session-Dauer in ms
};

PendingHit pendingHits[MAX_PENDING_HITS];
int pendingHitsCount = 0;

// ===== SETUP =====

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== HIGH SCORE PRO ESP32 v7.0 ===");

  // Pins initialisieren
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

  if (BATTERY_ENABLED) {
    pinMode(BATTERY_PIN, INPUT);
  }

  // Display initialisieren
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 Fehler!"));
    while(1);
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  showBootScreen();

  // DHT Sensor starten
  dht.begin();
  delay(2000);

  // Preferences laden
  prefs.begin("highscore", false);
  loadPreferences();

  // WiFi AP starten
  setupWiFi();

  // HTTP Server Routen
  setupServer();

  // Bereit!
  playTone(1000, 100);
  delay(100);
  playTone(1500, 100);

  Serial.println("Setup abgeschlossen!");
  Serial.print("Geladene Daten - Total Hits: ");
  Serial.print(totalHits);
  Serial.print(", Pending Hits: ");
  Serial.println(pendingHitsCount);
}

// ===== PREFERENCES LADEN =====

void loadPreferences() {
  totalHits = prefs.getInt("totalHits", 0);
  currentStreak = prefs.getInt("streak", 0);
  longestStreak = prefs.getInt("longestStreak", 0);
  lastSessionDate = prefs.getString("lastDate", "");
  minSessionDuration = prefs.getULong("minDuration", 0);
  maxSessionDuration = prefs.getULong("maxDuration", 0);

  // Pending Hits laden
  pendingHitsCount = prefs.getInt("pendingCount", 0);

  if (pendingHitsCount > MAX_PENDING_HITS) {
    Serial.println("WARNUNG: Pending count überschreitet Maximum, wird zurückgesetzt");
    pendingHitsCount = 0;
    prefs.putInt("pendingCount", 0);
  }

  Serial.print("Lade ");
  Serial.print(pendingHitsCount);
  Serial.println(" pending hits aus Speicher...");

  for (int i = 0; i < pendingHitsCount; i++) {
    String key = "pH_" + String(i);
    pendingHits[i].timestamp = prefs.getULong((key + "_t").c_str(), 0);
    pendingHits[i].duration = prefs.getULong((key + "_d").c_str(), 0);
  }
}

// ===== MAIN LOOP =====

void loop() {
  server.handleClient();

  // Sensor auslesen
  readSensor();

  // Battery monitoring (falls aktiviert)
  if (BATTERY_ENABLED) {
    readBattery();
  }

  // Session Detection
  detectSession();

  // Button handling
  handleButton();

  // Auto Screen Rotation
  if (millis() - lastScreenChange > SCREEN_ROTATION_INTERVAL &&
      millis() - lastButtonPress > 10000) {
    currentScreen = (currentScreen + 1) % NUM_SCREENS;
    lastScreenChange = millis();
  }

  // Display aktualisieren
  updateDisplay();

  // Animation Frame
  if (millis() - lastAnimUpdate > 100) {
    animFrame = (animFrame + 1) % 8;
    lastAnimUpdate = millis();
  }

  delay(50);
}

// ===== WIFI SETUP =====

void setupWiFi() {
  Serial.println("Starte WiFi Access Point...");

  WiFi.mode(WIFI_AP);
  bool apStarted = WiFi.softAP(ssid, password);

  if (apStarted) {
    IPAddress IP = WiFi.softAPIP();
    Serial.print("AP IP Adresse: ");
    Serial.println(IP);
    wifiConnected = true;
  } else {
    Serial.println("FEHLER: WiFi AP konnte nicht gestartet werden!");
    wifiConnected = false;
  }
}

// ===== HTTP SERVER SETUP =====

void setupServer() {
  // CORS Headers für alle Responses
  server.enableCORS(true);

  // API Endpoint für Live-Daten (kompatibel mit ESP32DataResponse)
  server.on("/api/data", HTTP_GET, handleApiData);

  // Statistics Endpoint (erweitert)
  server.on("/api/stats", HTTP_GET, handleApiStats);

  // Sync Endpoint - Pending Hits abrufen
  server.on("/api/sync", HTTP_GET, handleApiSync);

  // Sync Complete - Pending Hits löschen
  server.on("/api/sync-complete", HTTP_POST, handleSyncComplete);

  // Reset Endpoints
  server.on("/api/reset-today", HTTP_POST, handleResetToday);
  server.on("/api/reset-all", HTTP_POST, handleResetAll);

  // Health Check
  server.on("/api/health", HTTP_GET, []() {
    server.send(200, "text/plain", "OK");
  });

  server.begin();
  Serial.println("HTTP Server gestartet!");
}

// ===== API HANDLER: /api/data =====

void handleApiData() {
  StaticJsonDocument<512> doc;

  // Kompatibel mit ESP32DataResponse Interface
  doc["flame"] = flameDetected;
  doc["isInhaling"] = isInhaling;
  doc["today"] = todayHits;
  doc["total"] = totalHits;
  doc["lastDuration"] = lastSessionDuration;

  // Battery Daten (null wenn nicht aktiviert)
  if (BATTERY_ENABLED) {
    doc["batteryVoltage"] = batteryVoltage;
    doc["batteryPercent"] = batteryPercent;
  } else {
    doc["batteryVoltage"] = nullptr;
    doc["batteryPercent"] = nullptr;
  }

  // Session Duration Stats
  if (minSessionDuration > 0) {
    doc["minSessionDuration"] = minSessionDuration;
  } else {
    doc["minSessionDuration"] = nullptr;
  }

  if (maxSessionDuration > 0) {
    doc["maxSessionDuration"] = maxSessionDuration;
  } else {
    doc["maxSessionDuration"] = nullptr;
  }

  doc["timeSync"] = timeSync;

  String output;
  serializeJson(doc, output);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", output);
}

// ===== API HANDLER: /api/stats =====

void handleApiStats() {
  StaticJsonDocument<1024> doc;

  doc["totalHits"] = totalHits;
  doc["todayHits"] = todayHits;
  doc["currentStreak"] = currentStreak;
  doc["longestStreak"] = longestStreak;
  doc["lastSessionDuration"] = lastSessionDuration;
  doc["lastSessionTemp"] = lastSessionTemp;
  doc["lastSessionTime"] = lastSessionTime;
  doc["minSessionDuration"] = minSessionDuration;
  doc["maxSessionDuration"] = maxSessionDuration;
  doc["uptime"] = millis() / 1000;
  doc["currentTemp"] = currentTemp;
  doc["currentHumidity"] = currentHumidity;
  doc["pendingHitsCount"] = pendingHitsCount;
  doc["freeHeap"] = ESP.getFreeHeap();

  if (BATTERY_ENABLED) {
    doc["batteryVoltage"] = batteryVoltage;
    doc["batteryPercent"] = batteryPercent;
  }

  String output;
  serializeJson(doc, output);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", output);
}

// ===== API HANDLER: /api/sync =====

void handleApiSync() {
  DynamicJsonDocument doc(4096);

  doc["pendingCount"] = pendingHitsCount;
  doc["espUptime"] = millis();
  doc["timeSync"] = timeSync;

  JsonArray hitsArray = doc.createNestedArray("pendingHits");

  for (int i = 0; i < pendingHitsCount; i++) {
    JsonObject hit = hitsArray.createNestedObject();
    hit["timestamp"] = pendingHits[i].timestamp;
    hit["duration"] = pendingHits[i].duration;
  }

  String output;
  serializeJson(doc, output);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", output);

  Serial.print("Sync Request: ");
  Serial.print(pendingHitsCount);
  Serial.println(" pending hits gesendet");
}

// ===== API HANDLER: /api/sync-complete =====

void handleSyncComplete() {
  Serial.print("Sync Complete: Lösche ");
  Serial.print(pendingHitsCount);
  Serial.println(" pending hits...");

  // Aus Speicher löschen
  clearPendingHits();

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "Sync complete");

  playTone(1800, 100);
  Serial.println("Sync erfolgreich abgeschlossen!");

  // Time sync als erfolgreich markieren
  timeSync = true;
}

// ===== API HANDLER: Reset Today =====

void handleResetToday() {
  todayHits = 0;
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "Today counter reset");
  playTone(800, 200);
  Serial.println("Today counter zurückgesetzt");
}

// ===== API HANDLER: Reset All =====

void handleResetAll() {
  todayHits = 0;
  totalHits = 0;
  currentStreak = 0;
  longestStreak = 0;
  minSessionDuration = 0;
  maxSessionDuration = 0;
  lastSessionDate = "";

  prefs.putInt("totalHits", 0);
  prefs.putInt("streak", 0);
  prefs.putInt("longestStreak", 0);
  prefs.putString("lastDate", "");
  prefs.putULong("minDuration", 0);
  prefs.putULong("maxDuration", 0);

  clearPendingHits();

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "All data reset");
  playTone(400, 300);
  Serial.println("Alle Daten zurückgesetzt!");
}

// ===== PENDING HITS LÖSCHEN =====

void clearPendingHits() {
  for (int i = 0; i < pendingHitsCount; i++) {
    String key = "pH_" + String(i);
    prefs.remove((key + "_t").c_str());
    prefs.remove((key + "_d").c_str());
  }

  pendingHitsCount = 0;
  prefs.putInt("pendingCount", 0);
}

// ===== SENSOR AUSLESEN =====

void readSensor() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (!isnan(temp) && !isnan(hum)) {
    currentTemp = temp;
    currentHumidity = hum;

    // Flame detection basierend auf Temperatur
    flameDetected = (currentTemp >= FLAME_THRESHOLD);
  } else {
    Serial.println("DHT Lesefehler!");
  }
}

// ===== BATTERY AUSLESEN =====

void readBattery() {
  // ADC Wert lesen (0-4095 für 12-bit ADC)
  int adcValue = analogRead(BATTERY_PIN);

  // In Spannung umrechnen (3.3V Referenz, durch Spannungsteiler)
  batteryVoltage = (adcValue / 4095.0) * 3.3 * VOLTAGE_DIVIDER_RATIO;

  // Prozent berechnen
  batteryPercent = map(batteryVoltage * 100,
                       BATTERY_MIN_VOLTAGE * 100,
                       BATTERY_MAX_VOLTAGE * 100,
                       0, 100);
  batteryPercent = constrain(batteryPercent, 0, 100);
}

// ===== SESSION DETECTION =====

void detectSession() {
  static bool wasInhaling = false;

  // Inhalation Start
  if (currentTemp >= TEMP_THRESHOLD && !isInhaling) {
    isInhaling = true;
    sessionStartTime = millis();
    wasInhaling = true;
    Serial.println(">>> Inhalation START");
  }

  // Inhalation Ende
  if (currentTemp < COOLDOWN_TEMP && isInhaling) {
    isInhaling = false;
    unsigned long duration = millis() - sessionStartTime;

    // Nur zählen wenn länger als 500ms
    if (duration > 500) {
      registerHit(duration);
    }

    wasInhaling = false;
    Serial.println("<<< Inhalation ENDE");
  }
}

// ===== HIT REGISTRIEREN =====

void registerHit(unsigned long duration) {
  todayHits++;
  totalHits++;
  lastHitTime = millis();
  lastSessionDuration = duration;
  lastSessionTemp = currentTemp;

  // Min/Max Session Duration tracken
  if (minSessionDuration == 0 || duration < minSessionDuration) {
    minSessionDuration = duration;
    prefs.putULong("minDuration", minSessionDuration);
  }

  if (duration > maxSessionDuration) {
    maxSessionDuration = duration;
    prefs.putULong("maxDuration", maxSessionDuration);
  }

  // Zeit formatieren
  unsigned long totalSeconds = millis() / 1000;
  int hours = (totalSeconds / 3600) % 24;
  int minutes = (totalSeconds / 60) % 60;
  lastSessionTime = String(hours) + ":" + (minutes < 10 ? "0" : "") + String(minutes);

  // Streak Update
  updateStreak();

  // Speichern
  prefs.putInt("totalHits", totalHits);
  prefs.putInt("streak", currentStreak);
  prefs.putInt("longestStreak", longestStreak);

  // Pending Hit speichern
  savePendingHit(duration);

  // Feedback
  playTone(1500, 50);
  delay(50);
  playTone(2000, 50);

  Serial.print("HIT #");
  Serial.print(totalHits);
  Serial.print(" (");
  Serial.print(duration / 1000.0, 1);
  Serial.print("s, ");
  Serial.print(currentTemp, 1);
  Serial.println("°C)");
}

// ===== PENDING HIT SPEICHERN =====

void savePendingHit(unsigned long duration) {
  if (pendingHitsCount < MAX_PENDING_HITS) {
    pendingHits[pendingHitsCount].timestamp = millis();
    pendingHits[pendingHitsCount].duration = duration;

    // In Preferences speichern
    String key = "pH_" + String(pendingHitsCount);
    prefs.putULong((key + "_t").c_str(), millis());
    prefs.putULong((key + "_d").c_str(), duration);

    pendingHitsCount++;
    prefs.putInt("pendingCount", pendingHitsCount);

    Serial.print("Pending Hit gespeichert (");
    Serial.print(pendingHitsCount);
    Serial.println(" unsynced)");
  } else {
    Serial.println("WARNUNG: Pending Hits Buffer voll!");
    // Ring-Buffer: Ältesten überschreiben
    for (int i = 0; i < MAX_PENDING_HITS - 1; i++) {
      pendingHits[i] = pendingHits[i + 1];
    }
    pendingHits[MAX_PENDING_HITS - 1].timestamp = millis();
    pendingHits[MAX_PENDING_HITS - 1].duration = duration;
  }
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

// ===== BUTTON HANDLING =====

void handleButton() {
  bool buttonState = digitalRead(BUTTON_PIN);

  if (buttonState == LOW && lastButtonState == HIGH &&
      millis() - lastButtonPress > 300) {
    currentScreen = (currentScreen + 1) % NUM_SCREENS;
    lastButtonPress = millis();
    lastScreenChange = millis();
    playTone(1200, 50);
    Serial.print("Screen: ");
    Serial.println(currentScreen);
  }

  lastButtonState = buttonState;
}

// ===== DISPLAY UPDATE =====

void updateDisplay() {
  display.clearDisplay();

  switch(currentScreen) {
    case SCREEN_LIVE:
      drawLiveScreen();
      break;
    case SCREEN_STATS:
      drawStatsScreen();
      break;
    case SCREEN_STREAKS:
      drawStreaksScreen();
      break;
    case SCREEN_LAST_SESSION:
      drawLastSessionScreen();
      break;
  }

  display.display();
}

// ===== SCREEN 1: LIVE STATUS =====

void drawLiveScreen() {
  // Header
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("HIGH SCORE v7.0");

  // WiFi Icon
  if (wifiConnected) {
    display.setCursor(110, 0);
    display.print("WiFi");
  }

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Temperatur (groß)
  display.setTextSize(3);
  display.setCursor(0, 16);
  display.print(currentTemp, 1);
  display.setTextSize(1);
  display.print("C");

  // Flame Indicator
  if (flameDetected) {
    display.setCursor(90, 18);
    display.setTextSize(1);
    display.print("FLAME");
    // Flammen-Symbol
    int fx = 115;
    int fy = 25;
    for (int i = 0; i < 3; i++) {
      int offset = (animFrame + i) % 4 - 2;
      display.drawLine(fx + offset, fy + i*2, fx + offset, fy + i*2 + 1, SSD1306_WHITE);
    }
  }

  // Inhalations-Animation
  if (isInhaling) {
    int barHeight = map(currentTemp, TEMP_THRESHOLD, 100, 0, 30);
    barHeight = constrain(barHeight, 0, 30);
    display.fillRect(100, 46 - barHeight, 25, barHeight, SSD1306_WHITE);
    display.drawRect(99, 15, 27, 32, SSD1306_WHITE);

    if (animFrame % 2 == 0) {
      display.setCursor(85, 52);
      display.print("INHALE");
    }
  } else {
    // Idle-Animation
    for (int i = 0; i < 3; i++) {
      int y = 25 + i * 10 + (animFrame % 4) - 2;
      display.fillCircle(112, y, 2, SSD1306_WHITE);
    }
  }

  // Bottom Info
  display.drawLine(0, 50, 128, 50, SSD1306_WHITE);
  display.setCursor(0, 54);
  display.print("Today:");
  display.print(todayHits);
  display.print(" Tot:");
  display.print(totalHits);

  // Pending Hits Indikator
  if (pendingHitsCount > 0) {
    display.setCursor(100, 54);
    display.print("P:");
    display.print(pendingHitsCount);
  }
}

// ===== SCREEN 2: STATISTIKEN =====

void drawStatsScreen() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("STATISTIKEN");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setCursor(0, 15);
  display.print("Heute:");
  display.setTextSize(2);
  display.setCursor(70, 13);
  display.print(todayHits);

  display.setTextSize(1);
  display.setCursor(0, 32);
  display.print("Gesamt:");
  display.setTextSize(2);
  display.setCursor(70, 30);
  display.print(totalHits);

  display.setTextSize(1);
  display.setCursor(0, 49);
  display.print("Luftf:");
  display.setCursor(70, 49);
  display.print(currentHumidity, 0);
  display.print("%");

  display.setCursor(0, 57);
  display.print("Unsync:");
  display.setCursor(70, 57);
  display.print(pendingHitsCount);
}

// ===== SCREEN 3: STREAKS & DURATION =====

void drawStreaksScreen() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("STREAKS & DAUER");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Aktuelle Streak
  display.setCursor(0, 15);
  display.print("Streak:");
  display.setTextSize(2);
  display.setCursor(70, 13);
  display.print(currentStreak);

  // Rekord
  display.setTextSize(1);
  display.setCursor(0, 32);
  display.print("Best:");
  display.setTextSize(2);
  display.setCursor(70, 30);
  display.print(longestStreak);

  // Min/Max Duration
  display.setTextSize(1);
  display.setCursor(0, 49);
  display.print("Min:");
  display.setCursor(30, 49);
  if (minSessionDuration > 0) {
    display.print(minSessionDuration / 1000.0, 1);
    display.print("s");
  } else {
    display.print("--");
  }

  display.setCursor(0, 57);
  display.print("Max:");
  display.setCursor(30, 57);
  if (maxSessionDuration > 0) {
    display.print(maxSessionDuration / 1000.0, 1);
    display.print("s");
  } else {
    display.print("--");
  }

  // Battery status (falls aktiviert)
  if (BATTERY_ENABLED) {
    display.setCursor(70, 49);
    display.print("Bat:");
    display.setCursor(95, 49);
    display.print(batteryPercent);
    display.print("%");

    display.setCursor(70, 57);
    display.print(batteryVoltage, 2);
    display.print("V");
  }
}

// ===== SCREEN 4: LETZTE SESSION =====

void drawLastSessionScreen() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("LETZTE SESSION");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  if (lastSessionTime.length() > 0) {
    display.setCursor(0, 15);
    display.print("Zeit:");
    display.setTextSize(2);
    display.setCursor(50, 13);
    display.print(lastSessionTime);

    display.setTextSize(1);
    display.setCursor(0, 32);
    display.print("Dauer:");
    display.setCursor(50, 32);
    display.print(lastSessionDuration / 1000.0, 1);
    display.print("s");

    display.setCursor(0, 44);
    display.print("Temp:");
    display.setCursor(50, 44);
    display.print(lastSessionTemp, 1);
    display.print("C");

    if (lastHitTime > 0) {
      unsigned long timeSince = (millis() - lastHitTime) / 1000;
      display.setCursor(0, 56);
      display.print("Vor: ");
      if (timeSince < 60) {
        display.print(timeSince);
        display.print("s");
      } else if (timeSince < 3600) {
        display.print(timeSince / 60);
        display.print("min");
      } else {
        display.print(timeSince / 3600);
        display.print("h");
      }
    }
  } else {
    display.setTextSize(1);
    display.setCursor(10, 30);
    display.print("Noch keine");
    display.setCursor(10, 40);
    display.print("Session!");
  }
}

// ===== BOOT SCREEN =====

void showBootScreen() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(10, 10);
  display.print("HIGH");
  display.setCursor(10, 30);
  display.print("SCORE");
  display.setTextSize(1);
  display.setCursor(30, 50);
  display.print("PRO v7.0");
  display.display();
  delay(2000);
}

// ===== BUZZER TONE =====

void playTone(int frequency, int duration) {
  #ifdef BUZZER_PIN
  tone(BUZZER_PIN, frequency, duration);
  #endif
}
