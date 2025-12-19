/*
 * HIGH SCORE PRO - ESP32 SENSOR FIRMWARE v6.3
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
 *
 * Pinbelegung:
 * - SDA -> GPIO 21
 * - SCL -> GPIO 22
 * - DHT22 -> GPIO 4
 * - Button -> GPIO 5 (Pull-up)
 * - Buzzer -> GPIO 18 (optional)
 *
 * Features:
 * - Multi-Screen OLED Display
 * - WiFi Access Point & HTTP Server
 * - Automatische Session-Erkennung
 * - Lokale Statistiken
 * - Streak-Tracking
 * - Visuelle Inhalations-Animation
 * - **NEU in v6.3**: Offline Hit-Zwischenspeicherung & Sync
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

// Display Konfiguration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Sensor Einstellungen
#define DHT_TYPE DHT22
#define TEMP_THRESHOLD 50.0
#define SESSION_TIMEOUT 5000
#define COOLDOWN_TEMP 35.0

// Offline Sync Einstellungen
#define MAX_PENDING_HITS 50  // Maximale Anzahl gespeicherter unsynced hits

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
unsigned long sessionStartTime = 0;
unsigned long lastHitTime = 0;

// Display Management
int currentScreen = SCREEN_LIVE;
unsigned long lastScreenChange = 0;
unsigned long lastButtonPress = 0;
bool lastButtonState = HIGH;
const unsigned long SCREEN_ROTATION_INTERVAL = 5000; // Auto-rotation nach 5s

// Streak Tracking
int currentStreak = 0;
int longestStreak = 0;
String lastSessionDate = "";

// Letzte Session Info
unsigned long lastSessionDuration = 0;
float lastSessionTemp = 0.0;
String lastSessionTime = "";

// WiFi Status
bool wifiConnected = false;
int clientsConnected = 0;

// Animation
int animFrame = 0;
unsigned long lastAnimUpdate = 0;

// Offline Sync - Pending Hits Speicherung
struct PendingHit {
  unsigned long timestamp;  // Zeitstempel (millis seit ESP32 Start)
  float temperature;        // Max Temperatur
  unsigned long duration;   // Session-Dauer in ms
};

PendingHit pendingHits[MAX_PENDING_HITS];
int pendingHitsCount = 0;

// ===== SETUP =====

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== HIGH SCORE PRO ESP32 v6.2 ===");

  // Pins initialisieren
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

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
  totalHits = prefs.getInt("totalHits", 0);
  currentStreak = prefs.getInt("streak", 0);
  longestStreak = prefs.getInt("longestStreak", 0);
  lastSessionDate = prefs.getString("lastDate", "");

  // **NEU v6.3: Pending Hits aus Preferences laden**
  pendingHitsCount = prefs.getInt("pendingCount", 0);
  Serial.print("Lade ");
  Serial.print(pendingHitsCount);
  Serial.println(" pending hits aus Speicher...");

  for (int i = 0; i < pendingHitsCount && i < MAX_PENDING_HITS; i++) {
    String key = "pHit_" + String(i);
    pendingHits[i].timestamp = prefs.getULong((key + "_ts").c_str(), 0);
    pendingHits[i].temperature = prefs.getFloat((key + "_temp").c_str(), 0.0);
    pendingHits[i].duration = prefs.getULong((key + "_dur").c_str(), 0);
  }

  // WiFi AP starten
  setupWiFi();

  // HTTP Server Routen
  setupServer();

  // Bereit!
  playTone(1000, 100);
  delay(100);
  playTone(1500, 100);

  Serial.println("Setup abgeschlossen!");
}

// ===== MAIN LOOP =====

void loop() {
  server.handleClient();

  // Sensor auslesen
  readSensor();

  // Session Detection
  detectSession();

  // Button handling
  handleButton();

  // Auto Screen Rotation (wenn nicht manuell gewechselt)
  if (millis() - lastScreenChange > SCREEN_ROTATION_INTERVAL && millis() - lastButtonPress > 10000) {
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
  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP Adresse: ");
  Serial.println(IP);

  wifiConnected = true;
}

// ===== HTTP SERVER SETUP =====

void setupServer() {
  // API Endpoint für Live-Daten
  server.on("/api/data", HTTP_GET, []() {
    StaticJsonDocument<256> doc;

    doc["temp"] = currentTemp;
    doc["humidity"] = currentHumidity;
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

  // Statistics Endpoint
  server.on("/api/stats", HTTP_GET, []() {
    StaticJsonDocument<512> doc;

    doc["totalHits"] = totalHits;
    doc["todayHits"] = todayHits;
    doc["currentStreak"] = currentStreak;
    doc["longestStreak"] = longestStreak;
    doc["lastSessionDuration"] = lastSessionDuration;
    doc["lastSessionTemp"] = lastSessionTemp;
    doc["lastSessionTime"] = lastSessionTime;
    doc["uptime"] = millis() / 1000;

    String output;
    serializeJson(doc, output);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", output);
  });

  // Reset Endpoint (nur für heute)
  server.on("/api/reset-today", HTTP_POST, []() {
    todayHits = 0;
    server.send(200, "text/plain", "Today counter reset");
    playTone(800, 200);
  });

  // **NEU v6.3: Sync Endpoint - Pending Hits abrufen**
  server.on("/api/sync", HTTP_GET, []() {
    StaticJsonDocument<2048> doc;
    doc["pendingCount"] = pendingHitsCount;
    doc["espUptime"] = millis();

    JsonArray hitsArray = doc.createNestedArray("pendingHits");

    for (int i = 0; i < pendingHitsCount; i++) {
      JsonObject hit = hitsArray.createNestedObject();
      hit["timestamp"] = pendingHits[i].timestamp;
      hit["temperature"] = pendingHits[i].temperature;
      hit["duration"] = pendingHits[i].duration;
    }

    String output;
    serializeJson(doc, output);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", output);

    Serial.print("Sync Request: ");
    Serial.print(pendingHitsCount);
    Serial.println(" pending hits gesendet");
  });

  // **NEU v6.3: Sync Complete - Pending Hits löschen**
  server.on("/api/sync-complete", HTTP_POST, []() {
    // Pending Hits löschen
    Serial.print("Sync Complete: Lösche ");
    Serial.print(pendingHitsCount);
    Serial.println(" pending hits...");

    // Aus Speicher löschen
    for (int i = 0; i < pendingHitsCount; i++) {
      String key = "pHit_" + String(i);
      prefs.remove((key + "_ts").c_str());
      prefs.remove((key + "_temp").c_str());
      prefs.remove((key + "_dur").c_str());
    }

    pendingHitsCount = 0;
    prefs.putInt("pendingCount", 0);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "Sync complete - pending hits cleared");

    playTone(1800, 100);
    Serial.println("Sync erfolgreich abgeschlossen!");
  });

  server.begin();
  Serial.println("HTTP Server gestartet!");
}

// ===== SENSOR AUSLESEN =====

void readSensor() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (!isnan(temp) && !isnan(hum)) {
    currentTemp = temp;
    currentHumidity = hum;
  }
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

  // **NEU v6.3: Pending Hit für Offline-Sync speichern**
  if (pendingHitsCount < MAX_PENDING_HITS) {
    pendingHits[pendingHitsCount].timestamp = millis();
    pendingHits[pendingHitsCount].temperature = lastSessionTemp;
    pendingHits[pendingHitsCount].duration = duration;
    pendingHitsCount++;

    // Pending Hits Count in Preferences speichern
    prefs.putInt("pendingCount", pendingHitsCount);

    // Jeden Hit einzeln speichern (für Persistenz nach Neustart)
    String key = "pHit_" + String(pendingHitsCount - 1);
    prefs.putULong((key + "_ts").c_str(), millis());
    prefs.putFloat((key + "_temp").c_str(), lastSessionTemp);
    prefs.putULong((key + "_dur").c_str(), duration);

    Serial.print("Pending Hit gespeichert (");
    Serial.print(pendingHitsCount);
    Serial.println(" unsynced)");
  } else {
    Serial.println("WARNUNG: Pending Hits Buffer voll! Ältester Hit wird überschrieben.");
    // Ring-Buffer: Ältesten überschreiben
    for (int i = 0; i < MAX_PENDING_HITS - 1; i++) {
      pendingHits[i] = pendingHits[i + 1];
    }
    pendingHits[MAX_PENDING_HITS - 1].timestamp = millis();
    pendingHits[MAX_PENDING_HITS - 1].temperature = lastSessionTemp;
    pendingHits[MAX_PENDING_HITS - 1].duration = duration;
  }

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
  // Einfache Streak-Logik (kann erweitert werden)
  String today = String(millis() / 86400000); // Tage seit Start

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

  // Button gedrückt (LOW wegen Pull-up)
  if (buttonState == LOW && lastButtonState == HIGH && millis() - lastButtonPress > 300) {
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
  display.print("HIGH SCORE PRO");

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

  // Inhalations-Animation
  if (isInhaling) {
    int barHeight = map(currentTemp, TEMP_THRESHOLD, 100, 0, 30);
    barHeight = constrain(barHeight, 0, 30);
    display.fillRect(100, 46 - barHeight, 25, barHeight, SSD1306_WHITE);
    display.drawRect(99, 15, 27, 32, SSD1306_WHITE);

    // Pulsierender Text
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
  display.print("Today: ");
  display.print(todayHits);
  display.print(" | Total: ");
  display.print(totalHits);
}

// ===== SCREEN 2: STATISTIKEN =====

void drawStatsScreen() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("STATISTIKEN");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Heute
  display.setCursor(0, 15);
  display.print("Heute:");
  display.setTextSize(2);
  display.setCursor(70, 13);
  display.print(todayHits);

  // Gesamt
  display.setTextSize(1);
  display.setCursor(0, 32);
  display.print("Gesamt:");
  display.setTextSize(2);
  display.setCursor(70, 30);
  display.print(totalHits);

  // Humidity
  display.setTextSize(1);
  display.setCursor(0, 49);
  display.print("Luftf:");
  display.setCursor(70, 49);
  display.print(currentHumidity, 0);
  display.print("%");

  // Uptime
  display.setCursor(0, 57);
  display.print("Up: ");
  unsigned long upMinutes = millis() / 60000;
  display.print(upMinutes);
  display.print("min");
}

// ===== SCREEN 3: STREAKS =====

void drawStreaksScreen() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("STREAKS");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Aktuelle Streak
  display.setCursor(0, 15);
  display.print("Aktuell:");
  display.setTextSize(3);
  display.setCursor(15, 25);
  display.print(currentStreak);
  display.setTextSize(1);
  display.setCursor(60, 35);
  display.print("Tage");

  // Rekord
  display.setCursor(0, 50);
  display.print("Rekord: ");
  display.setTextSize(2);
  display.setCursor(70, 48);
  display.print(longestStreak);

  // Fire Icon
  if (currentStreak > 0) {
    // Flamme zeichnen
    int flameX = 100;
    int flameY = 25;
    for (int i = 0; i < 3; i++) {
      int offset = (animFrame + i) % 4 - 2;
      display.drawLine(flameX + offset, flameY + i*3, flameX + offset, flameY + i*3 + 2, SSD1306_WHITE);
    }
  }
}

// ===== SCREEN 4: LETZTE SESSION =====

void drawLastSessionScreen() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("LETZTE SESSION");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  if (lastSessionTime.length() > 0) {
    // Zeit
    display.setCursor(0, 15);
    display.print("Zeit:");
    display.setTextSize(2);
    display.setCursor(50, 13);
    display.print(lastSessionTime);

    // Dauer
    display.setTextSize(1);
    display.setCursor(0, 32);
    display.print("Dauer:");
    display.setCursor(50, 32);
    display.print(lastSessionDuration / 1000.0, 1);
    display.print("s");

    // Temperatur
    display.setCursor(0, 44);
    display.print("Temp:");
    display.setCursor(50, 44);
    display.print(lastSessionTemp, 1);
    display.print("C");

    // Zeit seit letztem Hit
    if (lastHitTime > 0) {
      unsigned long timeSince = (millis() - lastHitTime) / 1000;
      display.setCursor(0, 56);
      display.print("Vor: ");
      if (timeSince < 60) {
        display.print(timeSince);
        display.print("s");
      } else {
        display.print(timeSince / 60);
        display.print("min");
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
  display.print("PRO v6.2");
  display.display();
  delay(2000);
}

// ===== BUZZER TONE =====

void playTone(int frequency, int duration) {
  #ifdef BUZZER_PIN
  tone(BUZZER_PIN, frequency, duration);
  #endif
}
