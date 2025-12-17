# 🌿 HIGH SCORE PRO

**Die smarte Cannabis-Tracking App mit Hardware-Integration**

Verfolge deinen Konsum, analysiere Muster, erreiche Badges und behalte die volle Kontrolle – mit optionaler ESP32-Sensor-Hardware für automatisches Tracking.

[![Version](https://img.shields.io/badge/version-7.0-brightgreen.svg)](https://github.com/Grown2206/highscore-app)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-5.0-purple.svg)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

---

## ✨ Features

### 📊 **Tracking & Statistiken**
- **Detailliertes Tracking**: Aufzeichnung jeder Session mit Zeitstempel, Temperatur und Sorte
- **Tages-Statistiken**: Übersicht über heutige und historische Daten
- **Visualisierungen**: Interaktive Charts für Konsum-Muster und Trends
- **Kalender-Ansicht**: Historischer Überblick mit Farb-Kodierung

### 🏆 **Badge-System** (NEU in v7.0)
- **8 Kategorien** mit je 4 Levels (Bronze, Silber, Gold, Platin):
  - Sessions (Gesamtanzahl)
  - Streaks (Konsistenz)
  - Tagesrekord (Max Hits/Tag)
  - Ausgaben (Budget-Tracking)
  - Sorten (Vielfalt)
  - Frühaufsteher (Morgensessions)
  - Nachteule (Nachtsessions)
  - Effizienz (Ø Hits/Session)
- **Echtzeit-Fortschritt**: Visualisierte Progress-Bars für jede Kategorie
- **Dynamische Berechnung**: Keine localStorage-Bugs mehr!

### 💾 **Auto-Backup-System** (NEU in v7.0)
- **Multi-Layer Backup**:
  - 3 rotierende localStorage Slots
  - Filesystem Backup (Android/iOS via Capacitor)
  - Emergency Backup beim App-Schließen
  - Background Backup wenn App in Hintergrund wechselt
- **Automatische Wiederherstellung**: Recovery-Modal mit Backup-Auswahl
- **Datenschutz**: Alle Daten bleiben lokal auf deinem Gerät

### 🎯 **Ziele & Motivation**
- **Personalisierte Ziele**: Setze Tages- oder Wochenziele
- **Fortschritts-Tracking**: Visualisierung der Zielerreichung
- **Flexibel anpassbar**: Ziele jederzeit ändern oder pausieren

### 📱 **Hardware-Integration** (Optional)
- **ESP32-Sensor-Support**:
  - Automatische Session-Erkennung via Temperatur
  - OLED-Display mit Live-Statistiken
  - WiFi-Synchronisation in Echtzeit
  - Zwei Varianten: Standard (DHT22) & Compact (DS18B20)
- Siehe [ESP32-Firmware Dokumentation](esp32-firmware/README.md)

### ⚙️ **Erweiterte Funktionen**
- **Demo-Modus**: Teste die App ohne Hardware
- **Daten-Export/Import**: JSON-basierte Datensicherung
- **Sorten-Management**: Katalog deiner bevorzugten Strains
- **Anpassbare Settings**: Bowl-Größe, Tabak-Anteil, Temperatur-Schwellwerte
- **Dark Mode**: Modernes UI mit Tailwind CSS
- **Admin-Modus**: Erweiterte Funktionen für Power-User

---

## 🚀 Quick Start

### Voraussetzungen

- **Node.js** >= 16.0
- **npm** >= 8.0
- Für Mobile: **Android Studio** oder **Xcode**

### Installation

```bash
# Repository klonen
git clone https://github.com/Grown2206/highscore-app.git
cd highscore-app

# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Für Mobile (Android)
npm run build
npx cap sync android
npx cap open android
```

### Erste Schritte

1. **Demo-Modus aktivieren** (Settings → Demo Mode ON)
2. **Trigger-Button** drücken zum Testen
3. **Statistiken** in Dashboard ansehen
4. **Badges** in Badge-View prüfen
5. Optional: **ESP32-Hardware** einrichten (siehe unten)

---

## 📱 Plattformen

- ✅ **Web** (PWA) - funktioniert in jedem modernen Browser
- ✅ **Android** - Native App via Capacitor
- ✅ **iOS** - Native App via Capacitor
- ✅ **Desktop** - Electron (geplant)

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI Framework
- **Tailwind CSS 3.3** - Styling
- **Lucide React** - Icons
- **Vite 7.2** - Build Tool

### Mobile
- **Capacitor 5.0** - Native Bridge
- **@capacitor/filesystem** - Datei-Zugriff
- **@capacitor/android** - Android Support

### State Management
- **React Hooks** (useState, useEffect, useCallback, useMemo)
- **Custom Hooks** (useAutoBackup)
- **localStorage** - Persistente Datenspeicherung

### Hardware (Optional)
- **ESP32** - Mikrocontroller
- **WiFi Access Point** - Kommunikation
- **REST API** - Datenaustausch

---

## 📂 Projektstruktur

```
highscore-app/
├── src/
│   ├── components/          # React Components
│   │   ├── App.jsx         # Haupt-App mit Routing
│   │   ├── Dashboard.jsx   # Hauptübersicht
│   │   ├── BadgesView.jsx  # Badge-System (NEU)
│   │   ├── DataRecovery.jsx # Backup-Wiederherstellung (NEU)
│   │   ├── CalendarView.jsx
│   │   ├── GoalsView.jsx
│   │   ├── SettingsView.jsx
│   │   └── ...
│   ├── utils/              # Helper Functions
│   │   ├── autoBackup.js   # Backup-System (NEU)
│   │   ├── badges.js       # Badge-Logik (NEU)
│   │   ├── constants.js    # Shared Constants
│   │   ├── charts.js       # Chart-Konfigurationen
│   │   └── testDataGenerator.js
│   ├── hooks/              # Custom React Hooks
│   │   └── useAutoBackup.js # Auto-Backup Hook (NEU)
│   ├── main.jsx           # Entry Point
│   └── index.css          # Global Styles
├── esp32-firmware/         # Hardware-Firmware
│   ├── highscore-sensor.ino     # ESP32 Standard (DHT22)
│   ├── highscore-sensor-c3.ino  # ESP32-C3 Compact (DS18B20)
│   ├── README.md
│   └── README-ESP32-C3.md
├── android/               # Android-Spezifische Dateien
├── public/                # Statische Assets
├── package.json
├── capacitor.config.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔧 Konfiguration

### App-Einstellungen

Die App verwendet shared constants aus `src/utils/constants.js`:

```javascript
export const DEFAULT_SETTINGS = {
  bowlSize: 0.3,        // Gramm pro Bowl
  weedRatio: 80,        // Weed-Anteil in %
  triggerThreshold: 50  // Temperatur-Schwellwert
};

export const STORAGE_KEYS = {
  SETTINGS: 'hs_settings_v6',
  HISTORY: 'hs_history_v6',
  SESSION_HITS: 'hs_session_hits_v6',
  GOALS: 'hs_goals_v6'
};
```

### Hardware-Konfiguration

Für ESP32-Setup siehe:
- [ESP32 Standard (DHT22)](esp32-firmware/README.md)
- [ESP32-C3 Compact (DS18B20)](esp32-firmware/README-ESP32-C3.md)

---

## 🏗️ Build & Deployment

### Web (PWA)

```bash
npm run build
npm run preview  # Lokaler Test
```

Die Build-Artefakte befinden sich in `dist/`.

### Android

```bash
# Build erstellen
npm run build

# Capacitor sync
npx cap sync android

# Android Studio öffnen
npx cap open android

# In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### iOS

```bash
npm run build
npx cap sync ios
npx cap open ios
# In Xcode: Product → Archive
```

---

## 📊 Badge-System Details

### Kategorien & Anforderungen

| Kategorie | Bronze | Silber | Gold | Platin |
|-----------|--------|--------|------|--------|
| **Sessions** | 10 | 50 | 100 | 500 |
| **Streaks** | 3 | 7 | 14 | 30 |
| **Tagesrekord** | 5 | 10 | 20 | 50 |
| **Ausgaben** | 50€ | 200€ | 500€ | 1000€ |
| **Sorten** | 3 | 5 | 10 | 20 |
| **Frühaufsteher** | 5 | 15 | 30 | 100 |
| **Nachteule** | 5 | 15 | 30 | 100 |
| **Effizienz** | 3 Ø | 5 Ø | 8 Ø | 12 Ø |

### Berechnung

Badges werden dynamisch berechnet aus:
- `sessionHits` - Array aller Sessions
- `historyData` - Tägliche Zusammenfassungen
- `settings` - Bowl-Größe, Weed-Ratio

**Vorteil**: Keine localStorage-Bugs mehr, da keine Persistierung nötig!

---

## 💾 Auto-Backup Details

### Backup-Strategie

1. **Debounced Backups** (5 Sekunden nach letzter Änderung)
2. **Emergency Backups** (`beforeunload` Event)
3. **Background Backups** (`visibilitychange` Event)
4. **Rotating Slots** (3 localStorage Slots, alle 5 Minuten wechselnd)
5. **Filesystem** (Native Android/iOS Backups via Capacitor)

### Datenstruktur

```json
{
  "timestamp": 1702819200000,
  "version": "7.0",
  "data": {
    "settings": {...},
    "historyData": [...],
    "sessionHits": [...],
    "goals": [...]
  }
}
```

### Wiederherstellung

1. **Settings** → **Wiederherstellen** Button
2. Wähle Backup-Quelle aus Liste
3. Prüfe Daten (Sessions, Tage)
4. Bestätige Wiederherstellung

---

## 🔍 API-Dokumentation (ESP32)

### Endpoints

#### `GET /api/data`
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

#### `GET /api/stats`
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
  "uptime": 3600
}
```

#### `POST /api/reset-today`
Setzt Heute-Counter zurück.

---

## 🐛 Troubleshooting

### App startet nicht
- ✅ Node.js Version prüfen (`node -v` >= 16.0)
- ✅ Dependencies neu installieren: `rm -rf node_modules && npm install`
- ✅ Cache leeren: `npm run build -- --force`

### Daten gehen verloren
- ✅ Auto-Backup aktiviert? (sollte automatisch sein)
- ✅ **Wiederherstellen** Button in Settings nutzen
- ✅ Browser-Cache nicht automatisch löschen lassen

### Hardware verbindet nicht
- ✅ WiFi-Netzwerk "HighScore-Sensor" sichtbar?
- ✅ IP-Adresse in Settings korrekt?
- ✅ Demo-Modus deaktiviert?
- ✅ ESP32 Serial Monitor prüfen (115200 baud)

### Badge-Progress stimmt nicht
- ✅ App neu laden (F5)
- ✅ Daten exportieren & neu importieren
- ✅ Browser-Cache leeren

---

## 🛣️ Roadmap

### v7.1 (Q1 2025)
- [ ] Webinterface für ESP32-Konfiguration
- [ ] Bluetooth-Support für direkte Verbindung
- [ ] Export als PDF/CSV
- [ ] Darkmode-Verbesserungen

### v7.2
- [ ] Social Features (optional teilen)
- [ ] Cloud-Sync (opt-in)
- [ ] Multi-Device Support
- [ ] Desktop App (Electron)

### v8.0
- [ ] Machine Learning für Konsum-Vorhersagen
- [ ] Erweiterte Analytics
- [ ] Strain-Empfehlungen
- [ ] Community-Features

---

## 🤝 Contributing

Contributions sind willkommen! Bitte beachte:

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add: Amazing Feature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

### Development Guidelines

- **Code Style**: ESLint + Prettier
- **Commits**: Conventional Commits Format
- **Testing**: Teste auf Web + Android
- **Dokumentation**: Update READMEs bei Features

---

## 📄 Lizenz

Dieses Projekt ist unter der **MIT License** lizenziert.

```
MIT License

Copyright (c) 2024 Grown2206

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

## 🙏 Credits & Danksagungen

### Libraries
- **React Team** - UI Framework
- **Capacitor Team** - Native Bridge
- **Tailwind CSS** - Styling System
- **Lucide** - Icon Library

### Hardware
- **Espressif** - ESP32 Platform
- **Adafruit** - Sensor Libraries

### Community
- Alle Contributors & Tester
- Beta-User für Feedback
- Open Source Community

---

## 📞 Support & Community

- **GitHub Issues**: [github.com/Grown2206/highscore-app/issues](https://github.com/Grown2206/highscore-app/issues)
- **Discussions**: [github.com/Grown2206/highscore-app/discussions](https://github.com/Grown2206/highscore-app/discussions)
- **Email**: support@highscore-pro.dev (Coming soon)

---

## ⚠️ Haftungsausschluss

Diese App dient ausschließlich zu **persönlichen Tracking-Zwecken** in Regionen, wo der Konsum legal ist. Der Entwickler übernimmt keine Haftung für illegale Nutzung. Bitte informiere dich über die lokale Gesetzgebung.

**Hinweis**: Cannabis-Konsum kann gesundheitliche Risiken bergen. Konsumiere verantwortungsvoll und im Rahmen der Gesetze deines Landes.

---

**Happy Tracking! 🌿💨**

Made with ❤️ by [Grown2206](https://github.com/Grown2206)
