/*
 * HIGH SCORE PRO - ESP32-C3 SENSOR FIRMWARE v7.0
 * ================================================
 *
 * Optimiert für ESP32-C3 mit 0.42" OLED & B05 FLAME SENSOR
 * **NEU in v7.0**: Offline Hit-Zwischenspeicherung & Sync
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
 * Offline-Sync (NEU):
 * - Hits werden lokal gespeichert wenn App offline ist
 * - Bis zu 50 pending hits im Flash-Speicher
 * - Automatische Sync beim App-Verbindung
 * - Persistenz über ESP32-Neustarts
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
#include <time.h> // FIX: NTP Time Sync

// ===== HARDWARE PINS (ESP32-C3) =====
#define I2C_SDA 5
#define I2C_SCL 6
#define FLAME_SENSOR_PIN 1
#define BUTTON_PIN 9
#define BUZZER_PIN 10
#define LED_PIN 8
#define BATTERY_ADC_PIN 0  // NEU v7.1: Akku-Spannung messen (GPIO0/ADC1_CH0)

// Battery Monitoring (NEU v7.1)
// HINWEIS: Für LiPo (3.7V-4.2V) wird Spannungsteiler benötigt!
// Spannungsteiler: R1=100kΩ (zu Akku+), R2=100kΩ (zu GND)
// → Akku 4.2V → ADC liest 2.1V (max. 3.3V!)
// Formel: Batterie_Volt = ADC_Volt * 2.0
#define BATTERY_VOLTAGE_DIVIDER 2.0  // Teiler-Verhältnis (R1+R2)/R2

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

// FIX v7.1: Fehlauslösungen verhindern
#define MIN_SESSION_DURATION 800   // Mindestens 0.8s für gültigen Hit (verhindert Fehlauslösungen)
#define MAX_SESSION_DURATION 4500  // Maximal 4.5s für gültigen Hit (verhindert Sensor-Stuck)

// HINWEIS: B05 Flame Sensor Empfindlichkeit am Potentiometer einstellen!
// - Im Uhrzeigersinn drehen = weniger empfindlich (weniger Fehlauslösungen)
// - Gegen Uhrzeigersinn = empfindlicher (bessere Erkennung)
// - Optimal: LED leuchtet NUR bei Flamme in 5-10cm Entfernung

// Offline Sync Einstellungen
#define MAX_PENDING_HITS 50    // Maximale Anzahl gespeicherter unsynced hits

// Hit ID Persistence (NEU v8.0)
// Counter wird alle N Hits gespeichert um Flash-Wear zu reduzieren
// Bei ungeplanten Reboots können bis zu N-1 Hits "verloren" gehen (Counter zurückgesetzt)
// Boot Counter verhindert dabei ID-Duplikate über Reboots hinweg
#define HITCOUNTER_PERSIST_INTERVAL 10

// WICHTIG: BOOT_COUNTER_MODULO ist gekoppelt mit dem Format-String in generateHitID()
// Modulo 100 → Format %02lu (2 Stellen: 00-99)
// Modulo 1000 → Format %03lu (3 Stellen: 000-999)
// Bei Änderung des Modulo MUSS auch der Format-String angepasst werden!
#define BOOT_COUNTER_MODULO 100  // Boot Counter Wrap-Around bei 100 (hält Format auf 2 Stellen)

// WiFi Manager
#define WIFI_TIMEOUT 15000
#define AP_SSID "HighScore-Setup"
#define AP_PASSWORD "" // Kein Passwort für Setup
const byte DNS_PORT = 53;

// NTP Time Sync (NEU v7.1) - Deutsche Zeitzone mit automatischer Sommer/Winterzeit
const char* ntpServer = "pool.ntp.org";
const char* timezone = "CET-1CEST,M3.5.0,M10.5.0/3";  // Europe/Berlin mit DST

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
bool timeSync = false; // FIX: NTP Time Sync Status

// Offline Sync - Pending Hits Speicherung
struct PendingHit {
  char id[32];              // **NEU v8.0**: Unique Hit ID (ESP_MAC_COUNTER)
  unsigned long timestamp;  // FIX: Unix Timestamp in Millisekunden (seit 1970)
  unsigned long duration;   // Session-Dauer in ms
};

PendingHit pendingHits[MAX_PENDING_HITS];
int pendingHitsCount = 0;

// **NEU v8.0**: Persistent Hit Counter & Boot Counter für Unique IDs
unsigned long hitCounter = 0;
unsigned long bootCounter = 0;  // Inkrement bei jedem Boot (verhindert ID-Duplikate nach Crash)
String espMacShort = ""; // Kurze MAC (letzten 6 Hex-Zeichen)

IPAddress localIP;
String savedSSID = "";
String savedPassword = "";

// Animation
int animFrame = 0;
unsigned long lastAnimUpdate = 0;

// Battery (NEU v7.1)
float batteryVoltage = 0.0;
int batteryPercent = 0;
unsigned long lastBatteryRead = 0;
#define BATTERY_READ_INTERVAL 30000  // Alle 30 Sekunden

// **NEU v8.1**: Configurable False Trigger Prevention
int minSessionDuration = MIN_SESSION_DURATION;  // Default 800ms
int maxSessionDuration = MAX_SESSION_DURATION;  // Default 4500ms

// ===== HIT ID GENERATOR (NEU v8.0) =====
/**
 * Generiert eine eindeutige Hit ID
 * Format: MAC_BOOT_COUNTER (z.B. "0A1B2C_05_0001")
 *
 * Diese ID ist eindeutig über:
 * - Verschiedene ESP32 Devices (MAC)
 * - ESP32 Neustarts (Boot Counter - inkrementiert bei jedem Boot)
 * - Zeit (Hit Counter)
 *
 * Der Boot Counter verhindert ID-Duplikate nach ungeplanten Reboots,
 * wenn der Hit Counter auf einen alten Wert zurückfällt.
 */
String generateHitID() {
  hitCounter++;

  // Periodisch persistieren um Flash-Schreibzugriffe zu reduzieren
  if ((hitCounter % HITCOUNTER_PERSIST_INTERVAL) == 0) {
    prefs.putULong("hitCounter", hitCounter);
    #ifdef DEBUG_SERIAL
    Serial.print("Hit Counter persisted: ");
    Serial.println(hitCounter);
    #endif
  }

  // Format: MAC_BOOT_COUNTER (z.B. "0A1B2C_05_0001")
  // Boot Counter auf 2 Stellen begrenzt (0-99), dann Wrap-Around
  // WICHTIG: %02lu muss zu BOOT_COUNTER_MODULO passen (aktuell 100 → 2 Stellen)
  char id[32];
  snprintf(id, sizeof(id), "%s_%02lu_%04lu", espMacShort.c_str(), bootCounter % BOOT_COUNTER_MODULO, hitCounter);

  return String(id);
}

// ===== BATTERY FUNCTIONS =====
void readBatteryVoltage() {
  // ADC lesen (0-4095 entspricht 0-3.3V)
  int rawADC = analogRead(BATTERY_ADC_PIN);
  float adcVoltage = (rawADC / 4095.0) * 3.3;

  // Mit Spannungsteiler zurückrechnen
  batteryVoltage = adcVoltage * BATTERY_VOLTAGE_DIVIDER;

  // Prozent berechnen (LiPo: 4.7V = 100%, 3.0V = 0%)
  // Linear interpolieren und auf 0-100% begrenzen
  float percent = ((batteryVoltage - 3.0) / 1.7) * 100.0;
  batteryPercent = (int)constrain(percent, 0, 100);

  Serial.print("🔋 Battery: ");
  Serial.print(batteryVoltage, 2);
  Serial.print("V (");
  Serial.print(batteryPercent);
  Serial.println("%)");
}

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

  // WICHTIG: 72x40 Display braucht Column Offset!
  // SSD1306 ist für 128x64 ausgelegt, aber wir haben nur 72x40
  // Offset = (128 - 72) / 2 = 28
  display.ssd1306_command(0x21); // Set column address
  display.ssd1306_command(28);   // Column start (offset)
  display.ssd1306_command(99);   // Column end (28 + 72 - 1)

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

  // **NEU v8.0: MAC-Adresse für Unique Hit IDs**
  uint8_t baseMac[6];
  WiFi.macAddress(baseMac);  // Arduino Core 3.x kompatibel

  // Zero-padded MAC formatting für konsistente IDs (z.B. "0A1B2C" statt "A1B2C")
  char macBuffer[7];
  snprintf(macBuffer, sizeof(macBuffer), "%02X%02X%02X", baseMac[3], baseMac[4], baseMac[5]);
  espMacShort = String(macBuffer);

  Serial.print("ESP MAC (short): ");
  Serial.println(espMacShort);

  // **NEU v8.0: Boot Counter & Hit Counter laden**
  bootCounter = prefs.getULong("bootCounter", 0);
  bootCounter++;  // Inkrementiere bei jedem Boot
  prefs.putULong("bootCounter", bootCounter);

  hitCounter = prefs.getULong("hitCounter", 0);

  // **NEU v8.1**: False Trigger Settings laden
  minSessionDuration = prefs.getInt("minSession", MIN_SESSION_DURATION);
  maxSessionDuration = prefs.getInt("maxSession", MAX_SESSION_DURATION);

  #ifdef DEBUG_SERIAL
  Serial.print("Boot Counter: ");
  Serial.println(bootCounter);
  Serial.print("Hit Counter: ");
  Serial.println(hitCounter);
  Serial.print("False Trigger: ");
  Serial.print(minSessionDuration);
  Serial.print("ms - ");
  Serial.print(maxSessionDuration);
  Serial.println("ms");
  #endif

  // **NEU v7.0: Pending Hits aus Preferences laden**
  pendingHitsCount = prefs.getInt("pendingCount", 0);
  Serial.print("Lade ");
  Serial.print(pendingHitsCount);
  Serial.println(" pending hits aus Speicher...");

  for (int i = 0; i < pendingHitsCount && i < MAX_PENDING_HITS; i++) {
    String key = "pHit_" + String(i);
    String idStr = prefs.getString((key + "_id").c_str(), "");
    strncpy(pendingHits[i].id, idStr.c_str(), sizeof(pendingHits[i].id) - 1);
    pendingHits[i].id[sizeof(pendingHits[i].id) - 1] = '\0'; // Null-terminate
    pendingHits[i].timestamp = prefs.getULong((key + "_ts").c_str(), 0);
    pendingHits[i].duration = prefs.getULong((key + "_dur").c_str(), 0);
  }

  // WiFi AP
  setupWiFi();

  // HTTP Server
  setupServer();

  // NEU v7.1: Initiale Akku-Messung
  analogSetAttenuation(ADC_11db);  // 0-3.3V Bereich
  readBatteryVoltage();

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

  // NEU v7.1: Periodische Akku-Messung (alle 30s)
  if (millis() - lastBatteryRead >= BATTERY_READ_INTERVAL) {
    readBatteryVoltage();
    lastBatteryRead = millis();
  }

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

// Helper: Startet Access Point Mode
bool startAPMode() {
  Serial.println("Starting AP Mode...");

  // WiFi sauber zurücksetzen
  WiFi.mode(WIFI_OFF);
  delay(500);

  // AP Mode aktivieren
  WiFi.mode(WIFI_AP);
  bool apStarted = WiFi.softAP(AP_SSID, AP_PASSWORD);

  if (apStarted) {
    // DNS Server für Captive Portal starten
    dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());
    Serial.print("AP SSID: ");
    Serial.println(AP_SSID);

    // Display Update
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("Setup Mode");
    display.println(AP_SSID);
    display.println("192.168.4.1");
    display.display();
  }

  return apStarted;
}

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

      // FIX: NTP Time Sync initialisieren mit deutscher Zeitzone
      Serial.print("Syncing time with NTP (Europe/Berlin)...");
      configTzTime(timezone, ntpServer);

      // Warten auf Sync (max 5 Sekunden)
      struct tm timeinfo;
      int retries = 0;
      while (!getLocalTime(&timeinfo) && retries < 10) {
        delay(500);
        retries++;
      }

      if (retries < 10) {
        timeSync = true;
        Serial.println(" OK!");
        Serial.print("Current time (CET/CEST): ");
        Serial.println(&timeinfo, "%A, %d.%m.%Y %H:%M:%S");
      } else {
        Serial.println(" FAILED!");
        timeSync = false;
      }

      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Connected!");
      display.println(localIP.toString());
      display.display();
      delay(2000);
      return;
    } else {
      // Verbindung fehlgeschlagen - WiFi explizit trennen
      Serial.println("\nConnection failed - switching to AP mode");
      WiFi.disconnect(true);
      delay(1000);
    }
  }

  // AP Mode
  isAPMode = true;

  // Erster Versuch AP zu starten
  bool apStarted = startAPMode();

  if (!apStarted) {
    Serial.println("ERROR: AP Mode failed to start!");
    Serial.println("Retrying in 1 second...");
    delay(1000);

    // Zweiter Versuch
    apStarted = startAPMode();

    if (!apStarted) {
      // Beide Versuche fehlgeschlagen - kritischer Fehler
      Serial.println("CRITICAL: AP Mode failed after retry!");
      Serial.println("Device may not be accessible via WiFi!");

      // Fehler auf Display anzeigen
      display.clearDisplay();
      display.setCursor(0, 0);
      display.setTextSize(1);
      display.println("AP ERROR!");
      display.println("Reboot");
      display.println("needed");
      display.display();

      // Endlosschleife mit Blink-LED als Warnung
      while (true) {
        digitalWrite(LED_PIN, HIGH);
        delay(200);
        digitalWrite(LED_PIN, LOW);
        delay(200);
      }
    } else {
      Serial.println("AP Mode started successfully on retry");
    }
  }

  delay(2000);
}

// ===== HTTP SERVER =====

// Captive Portal: WiFi Setup HTML Seite
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

// WiFi Credentials speichern und neu starten
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

void setupServer() {
  // Captive Portal Routes (nur im AP-Modus aktiv)
  if (isAPMode) {
    server.on("/", HTTP_GET, handleConfigRoot);
    server.on("/save", HTTP_POST, handleSave);
    server.onNotFound(handleConfigRoot); // Captive Portal: alle unbekannten URLs auf Root umleiten
  }

  // Live Data Endpoint (kompatibel mit React App)
  server.on("/api/data", HTTP_GET, []() {
    JsonDocument doc;
    doc["flame"] = isFlameDetected ? 1 : 0;
    doc["isInhaling"] = isInSession ? 1 : 0;
    doc["today"] = todayHits;
    doc["total"] = totalHits;
    doc["lastDuration"] = lastSessionDuration;
    doc["streak"] = currentStreak;
    doc["longestStreak"] = longestStreak;
    doc["uptime"] = millis() / 1000;
    // NEU v7.1: Battery Monitoring
    doc["batteryVoltage"] = batteryVoltage;
    doc["batteryPercent"] = batteryPercent;
    // **NEU v8.1**: False Trigger Prevention Settings
    doc["minSessionDuration"] = minSessionDuration;
    doc["maxSessionDuration"] = maxSessionDuration;

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

  // **NEU v7.0: Sync Endpoint - Pending Hits abrufen**
  server.on("/api/sync", HTTP_GET, []() {
    JsonDocument doc;
    doc["pendingCount"] = pendingHitsCount;
    doc["espUptime"] = millis();

    JsonArray hitsArray = doc["pendingHits"].to<JsonArray>();

    for (int i = 0; i < pendingHitsCount; i++) {
      JsonObject hit = hitsArray.add<JsonObject>();
      hit["id"] = pendingHits[i].id;  // **NEU v8.0**: Unique Hit ID
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
  });

  // **NEU v7.0: Sync Complete - Pending Hits löschen**
  server.on("/api/sync-complete", HTTP_POST, []() {
    // Pending Hits löschen
    Serial.print("Sync Complete: Lösche ");
    Serial.print(pendingHitsCount);
    Serial.println(" pending hits...");

    // Aus Speicher löschen
    for (int i = 0; i < pendingHitsCount; i++) {
      String key = "pHit_" + String(i);
      prefs.remove((key + "_ts").c_str());
      prefs.remove((key + "_dur").c_str());
    }

    pendingHitsCount = 0;
    prefs.putInt("pendingCount", 0);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "Sync complete - pending hits cleared");

    playTone(1800, 100);
    Serial.println("Sync erfolgreich abgeschlossen!");
  });

  // **FIX v8.3**: Zentralisierte CORS Headers Helper
  auto setCorsHeaders = []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  };

  // **NEU v8.1**: CORS Preflight für /api/settings
  server.on("/api/settings", HTTP_OPTIONS, [setCorsHeaders]() {
    setCorsHeaders();
    server.send(204);
  });

  // **NEU v8.1**: False Trigger Settings aktualisieren
  server.on("/api/settings", HTTP_POST, [setCorsHeaders]() {
    // **FIX v8.3**: Session-Dauer-Grenzen als Konstanten
    // WICHTIG: Muss mit src/config/sessionDuration.js synchron bleiben!
    const int MIN_SESSION_DURATION_MS = 100;
    const int MAX_SESSION_DURATION_MS = 10000;

    // Helper: CORS Response senden
    auto sendCorsResponse = [setCorsHeaders](int code, const char* contentType, const char* body) {
      setCorsHeaders();
      server.send(code, contentType, body);
    };

    if (server.hasArg("plain")) {
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, server.arg("plain"));

      if (!error) {
        // Werte aus JSON extrahieren
        int newMin = doc.containsKey("minSessionDuration") ? doc["minSessionDuration"] : minSessionDuration;
        int newMax = doc.containsKey("maxSessionDuration") ? doc["maxSessionDuration"] : maxSessionDuration;

        // **FIX v8.2**: Validierung der Eingabewerte
        // **FIX v8.4**: Error Messages nutzen Konstanten statt hardcoded values
        // 1. Range Check: MIN_SESSION_DURATION_MS bis MAX_SESSION_DURATION_MS
        if (newMin < MIN_SESSION_DURATION_MS || newMin > MAX_SESSION_DURATION_MS) {
          String errorJson = String("{\"error\":\"minSessionDuration muss zwischen ")
                            + String(MIN_SESSION_DURATION_MS)
                            + "-"
                            + String(MAX_SESSION_DURATION_MS)
                            + "ms liegen\"}";
          sendCorsResponse(400, "application/json", errorJson.c_str());
          return;
        }
        if (newMax < MIN_SESSION_DURATION_MS || newMax > MAX_SESSION_DURATION_MS) {
          String errorJson = String("{\"error\":\"maxSessionDuration muss zwischen ")
                            + String(MIN_SESSION_DURATION_MS)
                            + "-"
                            + String(MAX_SESSION_DURATION_MS)
                            + "ms liegen\"}";
          sendCorsResponse(400, "application/json", errorJson.c_str());
          return;
        }

        // 2. Logic Check: min < max
        if (newMin >= newMax) {
          sendCorsResponse(400, "application/json", "{\"error\":\"minSessionDuration must be less than maxSessionDuration\"}");
          return;
        }

        // Werte speichern
        if (doc.containsKey("minSessionDuration")) {
          minSessionDuration = newMin;
          prefs.putInt("minSession", minSessionDuration);
          Serial.print("Min Session Duration updated: ");
          Serial.println(minSessionDuration);
        }

        if (doc.containsKey("maxSessionDuration")) {
          maxSessionDuration = newMax;
          prefs.putInt("maxSession", maxSessionDuration);
          Serial.print("Max Session Duration updated: ");
          Serial.println(maxSessionDuration);
        }

        sendCorsResponse(200, "application/json", "{\"success\":true}");
        playTone(1600, 100);
      } else {
        sendCorsResponse(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      }
    } else {
      sendCorsResponse(400, "application/json", "{\"error\":\"No data\"}");
    }
  });

  server.begin();
  Serial.println("HTTP server started");
}

// ===== FLAME SENSOR DETECTION =====
void checkFlameSensor() {
  // B05 Flame Sensor: HIGH = Flamme erkannt, LOW = keine Flamme
  int sensorValue = digitalRead(FLAME_SENSOR_PIN);
  isFlameDetected = (sensorValue == HIGH);
}

// ===== SESSION DETECTION =====
void detectSession() {
  unsigned long now = millis();

  // Cooldown verhindert nur NEUE Sessions, nicht das Ende laufender Sessions
  bool inCooldown = (now < cooldownUntil);

  // Start Session wenn Flamme erkannt UND kein Cooldown UND keine Session läuft
  if (isFlameDetected && !isInSession && !inCooldown) {
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

  // Ende Session wenn Flamme weg UND Session läuft (IMMER prüfen, auch während Cooldown!)
  if (!isFlameDetected && isInSession) {
    unsigned long duration = now - sessionStartTime;

    // FIX v7.1: Konfigurierbare Dauer-Grenzen zur Fehlauslösungs-Vermeidung
    if (duration >= minSessionDuration && duration <= maxSessionDuration && !inCooldown) {
      Serial.print("✓ Valid Hit: ");
      Serial.print(duration / 1000.0, 2);
      Serial.println("s");
      registerHit(duration);
      cooldownUntil = now + COOLDOWN_TIME;  // 3 Sekunden Cooldown
    } else {
      // Fehlauslösung oder zu lange Session
      if (duration < minSessionDuration) {
        Serial.print("✗ REJECTED: Too short (");
        Serial.print(duration);
        Serial.println("ms) - False trigger?");
      } else if (duration > maxSessionDuration) {
        Serial.print("✗ REJECTED: Too long (");
        Serial.print(duration);
        Serial.println("ms) - Sensor stuck?");
      } else if (inCooldown) {
        Serial.println("✗ REJECTED: In cooldown");
      }
    }

    // Session IMMER beenden, auch wenn kein Hit registriert wird
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

// ===== ZEIT-HELPER: Unix Timestamp in Millisekunden =====
unsigned long getCurrentTimestamp() {
  if (!timeSync) {
    // Fallback: millis() wenn keine Zeit-Sync
    return millis();
  }

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return millis(); // Fallback bei Fehler
  }

  time_t now_sec = mktime(&timeinfo);
  return (unsigned long)now_sec * 1000; // Sekunden → Millisekunden
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

  // **NEU v7.0: Pending Hit für Offline-Sync speichern**
  // FIX v7.1: Nutze echten Unix Timestamp statt millis()
  unsigned long currentTimestamp = getCurrentTimestamp();

  if (pendingHitsCount < MAX_PENDING_HITS) {
    // **NEU v8.0**: Generiere eindeutige Hit ID
    String hitID = generateHitID();
    strncpy(pendingHits[pendingHitsCount].id, hitID.c_str(), sizeof(pendingHits[pendingHitsCount].id) - 1);
    pendingHits[pendingHitsCount].id[sizeof(pendingHits[pendingHitsCount].id) - 1] = '\0';

    pendingHits[pendingHitsCount].timestamp = currentTimestamp;
    pendingHits[pendingHitsCount].duration = duration;
    pendingHitsCount++;

    // Pending Hits Count in Preferences speichern
    prefs.putInt("pendingCount", pendingHitsCount);

    // Jeden Hit einzeln speichern (für Persistenz nach Neustart)
    String key = "pHit_" + String(pendingHitsCount - 1);
    prefs.putString((key + "_id").c_str(), hitID);  // **NEU v8.0**: ID speichern
    prefs.putULong((key + "_ts").c_str(), currentTimestamp);
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

    // **NEU v8.0**: Generiere eindeutige Hit ID für neuen Hit
    String hitID = generateHitID();
    strncpy(pendingHits[MAX_PENDING_HITS - 1].id, hitID.c_str(), sizeof(pendingHits[MAX_PENDING_HITS - 1].id) - 1);
    pendingHits[MAX_PENDING_HITS - 1].id[sizeof(pendingHits[MAX_PENDING_HITS - 1].id) - 1] = '\0';

    pendingHits[MAX_PENDING_HITS - 1].timestamp = currentTimestamp;
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
