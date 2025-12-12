# 🌿 HIGH SCORE PRO - ESP32-C3 Compact Version

Optimierte Firmware für **ESP32-C3 Development Board** mit integriertem **0.42" OLED Display (72x40)** und **DS18B20 Temperatursensor**.

## 📋 Über diese Version

Diese Firmware ist speziell für kompakte ESP32-C3 Boards optimiert, die bereits ein kleines OLED-Display integriert haben. Perfekt für mobile, batteriebetriebene Anwendungen!

### ✨ Features

- ✅ **Kompaktes 72x40 OLED Display** (0.42")
- ✅ **Präziser DS18B20 Temperatursensor** (±0.5°C)
- ✅ **ESP32-C3** (klein, stromsparend, USB-C)
- ✅ **3 Display-Screens** (Live, Stats, WiFi)
- ✅ **WiFi Access Point** für App-Kommunikation
- ✅ **Lokale Statistiken** persistent gespeichert
- ✅ **HTTP REST API**
- ✅ **Automatische Session-Erkennung**

---

## 🛠️ Hardware

### Hauptkomponenten

| Teil | Beschreibung | Preis |
|------|--------------|-------|
| **ESP32-C3 Board** | Mit integriertem 0.42" OLED Display (72x40) | 8-12€ |
| **DS18B20** | Digitaler Temperatursensor (TO-92) | 2-3€ |
| **4.7kΩ Widerstand** | Pull-up für DS18B20 | 0.10€ |
| **Breadboard** | Zum Testen (optional) | 2€ |
| **Jumperkabel** | Female-Male | 2€ |

**Gesamt: ~12-15€** 🎉

### ESP32-C3 Board Beispiele

Suche auf AliExpress/Amazon nach:
- "ESP32-C3 0.42 OLED"
- "ESP32-C3 Development Board Display"
- "ESP32-C3 72x40 OLED"

Typische Merkmale:
- USB-C Anschluss
- Onboard OLED Display (0.42" / 72x40 Pixel)
- Klein & kompakt (~50x25mm)
- WiFi/BLE
- 22 GPIO Pins

---

## 🔌 Pinbelegung

### ESP32-C3 Standard Pins

```
ESP32-C3 DevKit
┌──────────────────┐
│   USB-C          │
│                  │
│  GPIO 5  ──► SDA │ (OLED bereits verbunden)
│  GPIO 6  ──► SCL │ (OLED bereits verbunden)
│                  │
│  GPIO 1  ──► DS18B20 Data (+ 4.7kΩ Pull-up)
│  GPIO 9  ──► Button (optional)
│  GPIO 10 ──► Buzzer (optional)
│  GPIO 8  ──► Onboard LED
│                  │
│  3.3V    ──► DS18B20 VCC
│  GND     ──► DS18B20 GND
└──────────────────┘
```

### DS18B20 Anschluss

```
DS18B20 (TO-92 Package)
Flat side facing you:

 ┌─────┐
 │  1  │ GND    ──► ESP32-C3 GND
 │  2  │ DATA   ──► GPIO 1 (+ 4.7kΩ zu 3.3V)
 │  3  │ VCC    ──► ESP32-C3 3.3V
 └─────┘

Wichtig: 4.7kΩ Pull-up Widerstand zwischen DATA und VCC!
```

### Schaltplan (Minimal)

```
                   4.7kΩ
                     │
    3.3V ────────────┼─────────► DS18B20 Pin 3 (VCC)
                     │
    GPIO 1 ──────────┼─────────► DS18B20 Pin 2 (DATA)

    GND ─────────────────────► DS18B20 Pin 1 (GND)
```

---

## 📦 Software Installation

### Option 1: Arduino IDE (Empfohlen für Anfänger)

#### 1. ESP32-C3 Board Support

1. Arduino IDE öffnen
2. **Datei** → **Voreinstellungen**
3. Bei "Zusätzliche Boardverwalter-URLs" einfügen:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. **Werkzeuge** → **Board** → **Boardverwalter**
5. Suche "ESP32" → Installiere "esp32 by Espressif" (Version 2.0.5+)

#### 2. Bibliotheken installieren

**Sketch** → **Bibliothek einbinden** → **Bibliotheken verwalten**, installiere:

| Bibliothek | Version | Zweck |
|------------|---------|-------|
| **Adafruit GFX** | >= 1.11.0 | Grafik |
| **Adafruit SSD1306** | >= 2.5.0 | OLED Display |
| **OneWire** | >= 2.3.7 | Dallas OneWire Protokoll |
| **DallasTemperature** | >= 3.9.0 | DS18B20 Sensor |
| **ArduinoJson** | >= 6.21.0 | JSON API |
| **Preferences** | Built-in | Datenspeicherung |

#### 3. Firmware hochladen

1. Öffne `highscore-sensor-c3.ino`
2. **Werkzeuge** → **Board** → **ESP32C3 Dev Module**
3. **Werkzeuge** → **Port** → (dein Port, z.B. COM3 oder /dev/ttyUSB0)
4. **Werkzeuge** → **Upload Speed** → 115200
5. **Werkzeuge** → **Flash Mode** → QIO
6. **Sketch** → **Hochladen**

#### 4. Serieller Monitor

- **Werkzeuge** → **Serieller Monitor**
- Baudrate: **115200**
- Sieh dir Boot-Logs und IP-Adresse an!

### Option 2: PlatformIO (Für Fortgeschrittene)

```ini
[env:esp32-c3-devkitm-1]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino

upload_speed = 115200
monitor_speed = 115200

lib_deps =
    adafruit/Adafruit GFX Library@^1.11.9
    adafruit/Adafruit SSD1306@^2.5.9
    paulstoffregen/OneWire@^2.3.7
    milesburton/DallasTemperature@^3.9.0
    bblanchon/ArduinoJson@^6.21.4
```

Hochladen:
```bash
pio run -t upload
pio device monitor
```

---

## ⚙️ Konfiguration

### WiFi anpassen

In `highscore-sensor-c3.ino` (Zeile 44-45):

```cpp
const char* ssid = "HighScore";       // Dein WiFi Name
const char* password = "weed2024";    // Min. 8 Zeichen
```

### Temperatur-Schwellwerte

```cpp
#define TEMP_THRESHOLD 50.0     // Session-Start (°C)
#define COOLDOWN_TEMP 35.0      // Session-Ende (°C)
```

**Tipp für DS18B20**:
- Starte mit 50°C
- Teste mit Feuerzeug (mit Abstand!)
- Passe Schwellwert nach Bedarf an (40-60°C)

### Display I2C Pins (falls abweichend)

```cpp
#define I2C_SDA 5    // Standard für die meisten ESP32-C3 Boards
#define I2C_SCL 6
```

---

## 🚀 Erste Schritte

### 1. Hardware aufbauen
- DS18B20 wie oben beschrieben anschließen
- **Nicht den 4.7kΩ Pull-up vergessen!**

### 2. Firmware hochladen
- Arduino IDE oder PlatformIO nutzen
- ESP32-C3 via USB-C verbinden
- Code hochladen

### 3. Testen
- Serieller Monitor öffnen (115200 baud)
- Boot-Screen sollte erscheinen
- WiFi AP startet automatisch

### 4. WiFi verbinden
- Suche nach WiFi "HighScore"
- Verbinde (Passwort: `weed2024`)
- Notiere IP-Adresse aus Serial Monitor (z.B. `192.168.4.1`)

### 5. App verbinden
- Öffne High Score Pro App
- **Settings** → **Verbindung**
- Trage IP-Adresse ein
- Schalte **Demo-Modus** aus

### 6. Session testen!
- Erwärme DS18B20 vorsichtig (Fön, warmes Wasser, etc.)
- Display zeigt Temperatur
- Bei >50°C wird Session erkannt
- App empfängt Live-Daten

---

## 📺 Display-Screens

Das 72x40 Display ist kompakt! Es gibt 3 Screens:

### Screen 1: LIVE
```
╔══════════════╗
║ 23C      ●   ║  ← Temp + Status
║──────────────║
║ T: 5         ║  ← Heute
║ #: 127       ║  ← Total
║ ▓▓▓▓░░░░     ║  ← Progress
╚══════════════╝
```

### Screen 2: STATS
```
╔══════════════╗
║ STATS        ║
║──────────────║
║ Today:     5 ║
║ Total:   127 ║
║ Streak:  3/7 ║
╚══════════════╝
```

### Screen 3: WIFI
```
╔══════════════╗
║ WiFi         ║
║──────────────║
║ SSID:        ║
║ HighScore    ║
║ 192.168.4.1  ║
╚══════════════╝
```

**Screen-Wechsel**:
- Automatisch alle 3 Sekunden
- Manuell mit Button (GPIO 9)

---

## 🔍 API Dokumentation

### GET `/api/data`

Live-Daten für die App.

```json
{
  "temp": 23.5,
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

```json
{
  "totalHits": 127,
  "todayHits": 5,
  "currentStreak": 3,
  "longestStreak": 7,
  "lastSessionDuration": 3500,
  "lastSessionTemp": 87.3,
  "lastSessionTime": "14:32",
  "uptime": 3600,
  "ip": "192.168.4.1"
}
```

### POST `/api/reset-today`

Setzt Heute-Counter zurück.

---

## 🐛 Troubleshooting

### Display bleibt schwarz

✅ **Lösung**:
- I2C-Adresse prüfen (meist 0x3C)
- Pins SDA/SCL korrekt?
- Display bereits onboard verbunden?

Teste I2C-Scanner:
```cpp
Wire.begin(5, 6);
for (byte i = 1; i < 127; i++) {
  Wire.beginTransmission(i);
  if (Wire.endTransmission() == 0) {
    Serial.print("I2C device at 0x");
    Serial.println(i, HEX);
  }
}
```

### DS18B20 liefert -127°C

✅ **Lösung**:
- **4.7kΩ Pull-up Widerstand fehlt!** (DATA zu VCC)
- Sensor falsch angeschlossen (Pin-Reihenfolge)
- Sensor defekt

Teste OneWire:
```cpp
OneWire ow(1);
byte addr[8];
Serial.print("Devices: ");
Serial.println(sensors.getDeviceCount());
```

### WiFi verbindet nicht

✅ **Lösung**:
- Passwort min. 8 Zeichen
- ESP32 neugestartet?
- 2.4 GHz WiFi (nicht 5 GHz)

### App zeigt "Offline"

✅ **Lösung**:
- Handy im gleichen WiFi ("HighScore")?
- IP-Adresse korrekt in App?
- Firewall blockiert nicht?
- Serial Monitor zeigt HTTP-Requests?

### Temperatur ungenau

DS18B20 ist präzise (±0.5°C), aber:
- Wärme braucht Zeit zum Transfer
- Sensor muss gut Kontakt haben
- Evtl. in Wärmeleitpaste einbetten

---

## 🔋 Batterie-Betrieb

ESP32-C3 ist stromsparend! Perfekt für Akku-Betrieb.

### Stromverbrauch

| Modus | Verbrauch |
|-------|-----------|
| WiFi AN, Display AN | ~80-120 mA |
| WiFi AN, Display AUS | ~60-80 mA |
| Deep Sleep | ~10 µA |

### Empfohlene Akkus

**Option 1: 18650 Li-Ion**
- Kapazität: 2600-3500 mAh
- Laufzeit: ~20-40 Stunden
- Mit TP4056 Lademodul + Step-Up

**Option 2: LiPo Akku**
- 1000-2000 mAh 3.7V
- Laufzeit: ~10-20 Stunden
- Direkt an 3.3V Pin (mit Schutzschaltung!)

**Option 3: Powerbank**
- USB-C direkt
- Unbegrenzte Laufzeit
- Einfachste Lösung

### Deep Sleep (Advanced)

Für tagelangen Betrieb:

```cpp
// Alle 10 Minuten aufwachen & messen
esp_sleep_enable_timer_wakeup(10 * 60 * 1000000); // µs
esp_deep_sleep_start();
```

---

## 📊 Vergleich: ESP32 DevKit vs ESP32-C3

| Feature | ESP32 DevKit V1 | ESP32-C3 |
|---------|----------------|----------|
| **Größe** | ~50x28mm | ~50x25mm |
| **Display** | Extern (128x64) | Onboard (72x40) |
| **USB** | Micro-USB | **USB-C** ✓ |
| **Stromverbrauch** | ~160-260 mA | ~80-120 mA ✓ |
| **Preis** | ~8€ + 4€ Display | ~10€ (inkl. Display) ✓ |
| **GPIO Pins** | 30+ | 22 |
| **BLE 5.0** | Ja | **Ja** ✓ |
| **RISC-V** | Nein | **Ja** ✓ |

**Fazit**: ESP32-C3 ist perfekt für kompakte, mobile Projekte!

---

## 🎨 Display-Anpassungen

### Eigene Icons (72x40)

Nutze [Image2cpp](http://javl.github.io/image2cpp/):
1. Erstelle 8x8 Bitmap
2. Konvertiere zu C-Array
3. Zeichne mit `display.drawBitmap(x, y, icon, 8, 8, WHITE);`

### Custom Screens

```cpp
void drawCustomScreen() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("CUSTOM");
  // ...dein Code
}
```

Füge in `updateDisplay()` hinzu:
```cpp
case SCREEN_CUSTOM:
  drawCustomScreen();
  break;
```

---

## 🔒 Sicherheit

### Produktiv-Setup

```cpp
// Starkes Passwort!
const char* password = "Super$icher2024!";
```

### API-Authentifizierung (Optional)

```cpp
server.on("/api/data", HTTP_GET, []() {
  if (!server.authenticate("admin", "geheim123")) {
    return server.requestAuthentication();
  }
  // ... rest of code
});
```

---

## 📝 Changelog

### v6.3 (ESP32-C3 Optimiert)
- ✨ ESP32-C3 Support
- ✨ Kompaktes 72x40 Display Layout
- ✨ DS18B20 OneWire Sensor
- ✨ 3 optimierte Screens
- ✨ Reduzierter Stromverbrauch
- 🐛 I2C Custom Pins Support

---

## 💡 Tipps & Tricks

### DS18B20 wasserdicht machen

Für direkte Montage am Heater:
1. Sensor in Schrumpfschlauch
2. Mit Silikon versiegeln
3. Oder fertige wasserdichte Version kaufen

### Mehrere Sensoren

DS18B20 unterstützt mehrere Sensoren an einem Pin!

```cpp
// Sensor 0 = Heater, Sensor 1 = Ambient
float heaterTemp = tempSensor.getTempCByIndex(0);
float ambientTemp = tempSensor.getTempCByIndex(1);
```

### OLED Burn-in vermeiden

Für Langzeitbetrieb:
```cpp
// Display nach 5 Min ausschalten
if (millis() - lastHitTime > 300000) {
  display.clearDisplay();
  display.display();
}
```

---

## 🤝 Support & Community

Probleme? Ideen?

- GitHub Issues: [github.com/Grown2206/highscore-app/issues](https://github.com/Grown2206/highscore-app/issues)
- Discord: Coming soon
- Reddit: r/esp32

---

## 📄 Lizenz

MIT License - Open Source & Free

---

**Happy Tracking mit ESP32-C3! 🌿💨**

Kleineres Board, größere Möglichkeiten! 🚀
