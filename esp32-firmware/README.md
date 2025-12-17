# 🌿 HIGH SCORE PRO - ESP32 Sensor Firmware v6.2

**Kompatibel mit HIGH SCORE PRO App v7.0**

Erweiterte ESP32-Firmware mit OLED-Display, Multi-Screen-Unterstützung und erweiterten Statistiken. Perfekte Integration mit dem neuen Badge-System und Auto-Backup der App.

## 📋 Features

### 🖥️ Multi-Screen OLED Display
- **Screen 1: Live Status**
  - Echtzeit-Temperaturanzeige (groß)
  - Visuelle Inhalations-Animation
  - WiFi-Status-Indikator
  - Heute & Gesamt Hits
  - Idle-Animation mit pulsierenden Kreisen

- **Screen 2: Statistiken**
  - Heutige Hits
  - Gesamt-Hits
  - Luftfeuchtigkeit
  - Uptime in Minuten

- **Screen 3: Streaks**
  - Aktuelle Streak (aufeinanderfolgende Tage)
  - Rekord-Streak
  - Animierte Flammen-Icons

- **Screen 4: Letzte Session**
  - Zeitpunkt der letzten Session
  - Session-Dauer in Sekunden
  - Max. Temperatur
  - Zeit seit letztem Hit

### 🔄 Automatische Features
- **Auto-Screen-Rotation**: Wechselt alle 5 Sekunden automatisch
- **Manuelle Steuerung**: Button zum manuellen Screen-Wechsel
- **Session Detection**: Automatische Erkennung durch Temperatur-Schwellwert
- **Persistente Speicherung**: Alle Statistiken bleiben nach Neustart erhalten

### 🌐 WiFi & API
- **Access Point Mode**: Eigenes WiFi-Netzwerk
- **HTTP REST API**:
  - `/api/data` - Live-Daten (Temp, Hits, Streaks)
  - `/api/stats` - Erweiterte Statistiken
  - `/api/reset-today` - Heute-Counter zurücksetzen

### 🔊 Akustisches Feedback
- Startup-Töne
- Hit-Bestätigung (2-Ton-Sequenz)
- Button-Feedback

---

## 🛠️ Hardware-Anforderungen

### Mindestanforderungen

| Komponente | Modell | Preis (ca.) | Link |
|------------|--------|-------------|------|
| **Mikrocontroller** | ESP32 DevKit V1 | 6-8€ | AliExpress/Amazon |
| **Display** | SSD1306 128x64 OLED (I2C) | 3-5€ | AliExpress/Amazon |
| **Temperatursensor** | DHT22 (AM2302) | 3-4€ | AliExpress/Amazon |
| **Button** | Taster 6x6mm | 0.50€ | Baumarkt |
| **Breadboard** | 400 Kontakte | 2-3€ | AliExpress/Amazon |
| **Jumperkabel** | Male-Male/Female | 2-3€ | Set |

**Gesamt: ~17-25€**

### Optional

| Komponente | Zweck | Preis |
|------------|-------|-------|
| Buzzer (Passiv) | Akustisches Feedback | 1-2€ |
| LED (Grün) | Status-Anzeige | 0.20€ |
| Widerstand 220Ω | LED-Vorwiderstand | 0.10€ |
| Gehäuse | Schutz & Ästhetik | 5-10€ |

---

## 🔌 Pinbelegung

### ESP32 DevKit V1

```
┌─────────────────────────────────┐
│         ESP32 DevKit V1         │
│                                 │
│  GPIO 21 (SDA)  ───────────► OLED SDA
│  GPIO 22 (SCL)  ───────────► OLED SCL
│  GPIO 4         ───────────► DHT22 DATA
│  GPIO 5         ───────────► Button (Pull-up)
│  GPIO 18        ───────────► Buzzer (optional)
│  3.3V           ───────────► OLED VCC, DHT22 VCC
│  GND            ───────────► OLED GND, DHT22 GND, Button GND
│                                 │
└─────────────────────────────────┘
```

### Schaltplan Details

#### OLED Display (I2C)
```
SSD1306 128x64
┌────────┐
│  VCC   │──────► ESP32 3.3V
│  GND   │──────► ESP32 GND
│  SCL   │──────► GPIO 22
│  SDA   │──────► GPIO 21
└────────┘
```

#### DHT22 Sensor
```
DHT22
┌────────┐
│  VCC   │──────► ESP32 3.3V (oder 5V)
│  DATA  │──────► GPIO 4 (+ 10kΩ Pull-up zu VCC)
│  NC    │──────  (nicht verbunden)
│  GND   │──────► ESP32 GND
└────────┘
```

#### Button
```
Taster
┌────────┐
│        │──────► GPIO 5 (interner Pull-up aktiviert)
│        │──────► GND
└────────┘
```

#### Buzzer (Optional)
```
Passiver Buzzer
┌────────┐
│   +    │──────► GPIO 18
│   -    │──────► GND
└────────┘
```

---

## 📦 Software-Installation

### 1. Arduino IDE Setup

1. **Arduino IDE herunterladen**: https://www.arduino.cc/en/software
2. **ESP32 Board Support installieren**:
   - Datei → Voreinstellungen
   - Zusätzliche Boardverwalter-URLs:
     ```
     https://dl.espressif.com/dl/package_esp32_index.json
     ```
   - Werkzeuge → Board → Boardverwalter
   - Suche "ESP32" → Installiere "esp32 by Espressif Systems"

### 2. Bibliotheken installieren

Gehe zu **Sketch → Bibliothek einbinden → Bibliotheken verwalten** und installiere:

| Bibliothek | Version | Zweck |
|------------|---------|-------|
| **Adafruit GFX Library** | >= 1.11.0 | Grafik-Grundlagen |
| **Adafruit SSD1306** | >= 2.5.0 | OLED Display |
| **DHT sensor library** (Adafruit) | >= 1.4.0 | DHT22 Sensor |
| **Adafruit Unified Sensor** | >= 1.1.0 | Sensor-Treiber |
| **ArduinoJson** | >= 6.21.0 | JSON-Serialisierung |
| **Preferences** | Built-in | ESP32 Datenspeicherung |

### 3. Firmware hochladen

1. **Datei öffnen**: `esp32-firmware/highscore-sensor.ino`
2. **Board auswählen**:
   - Werkzeuge → Board → ESP32 Dev Module (oder ESP32 DevKit V1)
3. **Port auswählen**:
   - Werkzeuge → Port → (dein COM-Port / /dev/ttyUSB0)
4. **Upload-Geschwindigkeit**:
   - Werkzeuge → Upload Speed → 115200
5. **Hochladen**:
   - Sketch → Hochladen (oder Strg+U)

### 4. Serieller Monitor

- Werkzeuge → Serieller Monitor
- Baudrate: **115200**
- Sieh dir die Debug-Ausgaben an!

---

## ⚙️ Konfiguration

### WiFi-Einstellungen anpassen

In `highscore-sensor.ino` (Zeile 44-45):

```cpp
const char* ssid = "HighScore-Sensor";      // SSID des Access Points
const char* password = "highscore2024";     // Passwort (min. 8 Zeichen)
```

### Sensor-Schwellwerte

```cpp
#define TEMP_THRESHOLD 50.0      // Inhalations-Start-Temperatur (°C)
#define COOLDOWN_TEMP 35.0       // Rückkehr zu Idle-Temperatur (°C)
#define SESSION_TIMEOUT 5000     // Timeout in ms
```

**Tipp**: Passe `TEMP_THRESHOLD` an deine Hardware an. Starte mit 50°C und passe nach oben/unten an.

### Display-Rotation

```cpp
#define SCREEN_ROTATION_INTERVAL 5000  // Auto-Rotation Zeit in ms
```

---

## 🚀 Erste Schritte

### 1. Hardware aufbauen
- Verbinde alle Komponenten wie im Schaltplan
- Doppelprüfe die Verbindungen (besonders VCC/GND!)

### 2. Firmware hochladen
- Code in Arduino IDE laden
- Board & Port auswählen
- Hochladen

### 3. WiFi verbinden
- ESP32 startet Access Point "HighScore-Sensor"
- Mit Handy/PC verbinden (Passwort: `highscore2024`)

### 4. IP-Adresse finden
- Öffne Seriellen Monitor (115200 baud)
- Notiere die IP-Adresse (z.B. `192.168.4.1`)

### 5. App verbinden
- Öffne High Score Pro App
- Gehe zu Settings → Verbindung
- Gib die IP-Adresse ein
- Schalte Demo-Modus aus

### 6. Testen!
- Drücke den Button → Screen wechselt
- Erhitze den DHT22 leicht (z.B. Fön, Feuerzeug mit Abstand)
- Display zeigt Temperatur & Animation
- App empfängt Live-Daten
- **Neue v7.0 Features**: Daten werden automatisch im Auto-Backup gespeichert und tragen zum Badge-Fortschritt bei!

---

## 🔍 API-Dokumentation

### GET `/api/data`

Live-Daten für die App.

**Response:**
```json
{
  "temp": 23.5,
  "humidity": 45.2,
  "today": 5,
  "total": 127,
  "inhaling": false,
  "streak": 3,
  "longestStreak": 7,
  "lastSession": "14:32"
}
```

### GET `/api/stats`

Erweiterte Statistiken.

**Response:**
```json
{
  "totalHits": 127,
  "todayHits": 5,
  "currentStreak": 3,
  "longestStreak": 7,
  "lastSessionDuration": 3500,
  "lastSessionTemp": 87.3,
  "lastSessionTime": "14:32",
  "uptime": 3600
}
```

### POST `/api/reset-today`

Setzt den Heute-Counter auf 0.

**Response:**
```
Today counter reset
```

---

## 🐛 Troubleshooting

### Display bleibt schwarz
- ✅ VCC/GND richtig verbunden?
- ✅ I2C-Adresse korrekt? (Standard: 0x3C)
- ✅ SDA/SCL vertauscht?
- Teste I2C-Scanner Sketch

### DHT22 liefert NaN
- ✅ 10kΩ Pull-up zwischen DATA und VCC?
- ✅ Warte 2 Sekunden nach Sensor-Initialisierung
- ✅ Richtiger DHT-Typ? (DHT22 vs. DHT11)

### WiFi verbindet nicht
- ✅ Passwort mindestens 8 Zeichen?
- ✅ SSID korrekt?
- ✅ ESP32 neugestartet?

### App empfängt keine Daten
- ✅ Handy im gleichen WiFi-Netzwerk?
- ✅ IP-Adresse korrekt in App eingetragen?
- ✅ Firewall blockiert nicht?
- ✅ Serieller Monitor zeigt API-Requests?

### Temperatur zu hoch/niedrig
- Kalibriere `TEMP_THRESHOLD` in der Firmware
- DHT22 hat ±0.5°C Toleranz

---

## 🎨 Display-Anpassungen

### Icons hinzufügen

Nutze den [Image2cpp Converter](http://javl.github.io/image2cpp/):
1. Erstelle 16x16px Bitmap (schwarz/weiß)
2. Konvertiere zu C-Array
3. Füge in Code ein mit `display.drawBitmap(x, y, array, 16, 16, WHITE);`

### Eigene Screens erstellen

```cpp
void drawCustomScreen() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(10, 20);
  display.print("CUSTOM");
  // ... dein Code
}
```

Dann in `updateDisplay()` Case hinzufügen.

---

## 📈 Performance-Optimierung

### Weniger Flackern
```cpp
// In loop() reduziere Display-Updates:
if (millis() - lastDisplayUpdate > 100) {
  updateDisplay();
  lastDisplayUpdate = millis();
}
```

### Schnellere Sensor-Abfrage
```cpp
// Verwende asynchrones Lesen für DHT22
// Bibliothek: DHT sensor library for ESPx (async)
```

---

## 🔒 Sicherheit

### Produktiv-Einstellungen

```cpp
// Ändere Passwort!
const char* password = "IhrStarkesPasswort!2024";

// Optional: WPA2-Enterprise für mehr Sicherheit
```

### API-Authentifizierung (Erweitert)

```cpp
// In server.on() hinzufügen:
if (!server.authenticate("admin", "password")) {
  return server.requestAuthentication();
}
```

---

## 📊 Erweiterte Funktionen

### MQTT Integration

Sende Daten an MQTT Broker für Home Assistant:

```cpp
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void publishMQTT() {
  String payload = "{\"temp\":" + String(currentTemp) + "}";
  mqttClient.publish("highscore/data", payload.c_str());
}
```

### OTA Updates

Firmware drahtlos aktualisieren:

```cpp
#include <ArduinoOTA.h>

void setup() {
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
}
```

---

## 📝 Changelog

### v6.2 (2024)
- ✨ Multi-Screen Display (4 Screens)
- ✨ Erweiterte Statistiken
- ✨ Streak-Tracking mit Persistenz
- ✨ Visuelle Inhalations-Animation
- ✨ Button-Steuerung
- ✨ Erweiterte API-Endpoints
- ✨ Buzzer-Feedback
- 🐛 Verbesserte Session-Detection

### v6.1
- Basis-Funktionalität
- WiFi AP Mode
- Einfaches Display

---

## 🤝 Beitragen

Verbesserungsvorschläge? Öffne ein Issue oder Pull Request!

### TODO
- [ ] Batteriebetrieb mit Deep Sleep
- [ ] Webinterface zur Konfiguration
- [ ] Mehrere Temperatursensoren
- [ ] RGB-LED Feedback
- [ ] NFC-Tag Support für Sorten

---

## 📄 Lizenz

Open Source - MIT License

---

## 🙏 Credits

- **Adafruit** - Display & Sensor Libraries
- **Espressif** - ESP32 Framework
- **Arduino** - IDE & Ecosystem

---

**Happy Tracking! 🌿💨**
