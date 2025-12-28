# 🌿 HIGH SCORE PRO

**Die smarte Cannabis-Tracking App mit Hardware-Integration**

Verfolge deinen Konsum, analysiere Muster, erreiche Erfolge und behalte die volle Kontrolle – mit optionaler ESP32-Sensor-Hardware für automatisches Tracking.

[![Version](https://img.shields.io/badge/version-8.0-brightgreen.svg)](https://github.com/Grown2206/highscore-app)
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

### 🏆 **Achievements-System v3.0** (MASSIV ERWEITERT in v8.0!)
- **12 Kategorien** mit über **70+ Medaillen** und lustigen Namen:
  - **Sitzungen** (6 Stufen) - Neuling → Meister des Universums
  - **Streaks** (6 Stufen) - Auf Kurs → Zeitlos
  - **Tagesrekord** (11 Stufen!) - Guter Tag → Absolut Legendär
  - **Ausgaben** (5 Stufen) - Sparschwein → Geldbaum
  - **Sorten** (6 Stufen) - Neugierig → Botaniker
  - **Frühaufsteher** (8 Stufen) - Morgenmuffel → Meister der Morgendämmerung
  - **Nachteule** (8 Stufen) - Nachtaktiv → Herrscher der Dunkelheit
  - **Effizienz** (5 Stufen) - Effizient → Perfektion Personifiziert
  - **Weekend Warrior** (6 Stufen) - Weekend Vibes → Ewiges Wochenende 🆕
  - **Werktags-Profi** (6 Stufen) - Schichtarbeiter → Business Tycoon 🆕
  - **Speed Runner** (5 Stufen) - Blitzschnell → Überschallgeschwindigkeit 🆕
  - **Genießer** (5 Stufen) - Chill → Ewigkeit 🆕
- **Massive Erweiterungen**: Frühaufsteher & Nachteule mit jeweils 8 Stufen, Tagesrekord mit 11 Stufen!
- **4 neue Kategorien**: Weekend Warrior, Werktags-Profi, Speed Runner, Genießer
- **Echtzeit-Fortschritt**: Visualisierte Progress-Bars mit Circular Indicators
- **Explizite Konfiguration**: Validierte Kopplung zwischen Medals & Progress Badges
- **Dynamische Berechnung**: Keine localStorage-Bugs, komplett robust!

### 💾 **Auto-Backup-System** (NEU in v7.0)
- **Multi-Layer Backup**:
  - 3 rotierende localStorage Slots
  - Filesystem Backup (Android/iOS via Capacitor)
  - Emergency Backup beim App-Schließen
  - Background Backup wenn App in Hintergrund wechselt
- **Automatische Wiederherstellung**: Recovery-Modal mit Backup-Auswahl
- **Datenschutz**: Alle Daten bleiben lokal auf deinem Gerät

### 📈 **Advanced Analytics mit ML** (MASSIV ERWEITERT in v8.0!)
- **Predictive Analytics**:
  - Linear Regression Trendanalyse
  - 7-Tage und 30-Tage Vorhersagen
  - R² Konfidenz-Score
- **Anomalie-Erkennung**:
  - Spike-Detektion (Z-Score Analyse)
  - Nachtaktivitäts-Muster
  - Rapid-Fire Sessions
  - T-Break Erkennung
- **Erweiterte Metriken** 🆕:
  - **Toleranz-Index** (0-100): Multi-Faktor Score aus Frequenz, Volumen & Pausen
  - **Habit Score** (14-Tage Konsistenz): Emoji-Rating von "Chaotisch" bis "Roboterhaft"
  - **Wochenvergleich**: Diese Woche vs. letzte Woche mit Trend-Indikator
  - **Session Duration Analytics**: Durchschnitt, Median, Schnellste/Langsamste
  - **Peak vs Off-Peak**: Tageszeit-Analyse mit Verteilung
- **KI-Empfehlungen**: 5 Kategorien (Timing, Strain, Pattern, Cost, Health)

### 🎯 **Ziele & Motivation**
- **Personalisierte Ziele**: Setze Tages- oder Wochenziele
- **Fortschritts-Tracking**: Visualisierung der Zielerreichung
- **Flexibel anpassbar**: Ziele jederzeit ändern oder pausieren

### 📱 **Hardware-Integration** (Optional)
- **ESP32-Sensor-Support**:
  - Automatische Session-Erkennung via Temperatur
  - OLED-Display mit Live-Statistiken
  - WiFi-Synchronisation in Echtzeit
  - **Deutsche Zeitzone mit automatischer Sommer/Winterzeit** 🆕
  - **Batterie-Monitoring** mit präziser LiPo-Kalkulation 🆕
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
│   ├── components/          # React Components (15 Dateien)
│   │   ├── App.jsx         # Haupt-App mit Routing & ESP32-Integration
│   │   ├── DashboardView.jsx   # Hauptübersicht mit Hold Button
│   │   ├── AchievementsView.jsx  # Achievements v3.0 (12 Kategorien, 70+ Medals)
│   │   ├── AnalyticsView.jsx # ML-basierte Analytics mit Predictions
│   │   ├── ChartsView.jsx  # Statistische Visualisierungen
│   │   ├── BadgesView.jsx  # Badge-System (13 Kategorien, 4 Levels)
│   │   ├── CalendarView.jsx # Kalender mit Session-Details
│   │   ├── DataRecovery.jsx # Backup-Wiederherstellung
│   │   ├── SettingsView.jsx # App-Konfiguration
│   │   ├── StrainManagementView.jsx # Sorten-CRUD
│   │   ├── ESP32DebugView.jsx # Hardware-Debugging
│   │   ├── SwipeableHitRow.jsx # Swipe-to-Delete Row
│   │   ├── SessionDetailsModal.jsx # Session-Detail-Ansicht
│   │   ├── StreaksWidget.jsx # Streak-Statistiken
│   │   ├── HoldButton.jsx  # Hold-Button Component
│   │   └── UIComponents.jsx # Reusable UI Elements
│   ├── utils/              # Helper Functions
│   │   ├── achievementsConfig.js # Achievement Medals Config (v3.0)
│   │   ├── badges.js       # Badge-System Logic
│   │   ├── autoBackup.js   # Multi-Layer Backup-System
│   │   ├── constants.js    # Shared Constants & Storage Keys
│   │   └── testDataGenerator.js # Testdaten-Generator
│   ├── hooks/              # Custom React Hooks
│   │   ├── useAutoBackup.js # Auto-Backup Hook
│   │   └── useLocalStorage.js # Persistent State Hook
│   ├── main.jsx           # Entry Point
│   └── index.css          # Global Styles (Tailwind)
├── esp32-firmware/         # Hardware-Firmware
│   ├── highscore-sensor.ino     # ESP32 Standard (DHT22)
│   ├── highscore-sensor-c3.ino  # ESP32-C3 Compact (DS18B20) mit deutscher Zeit
│   ├── README.md
│   └── README-ESP32-C3.md
├── android/               # Android-Spezifische Dateien (Capacitor)
├── public/                # Statische Assets (Icons, Manifest)
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

## 🏆 Achievements-System v3.0 Details

### Kategorien & Medaillen-Stufen (MASSIV ERWEITERT!)

#### 📊 Basis-Achievements (6-11 Stufen!)

| Kategorie | Stufe 1 | Stufe 2 | Stufe 3 | Stufe 4 | Stufe 5 | Stufe 6 |
|-----------|---------|---------|---------|---------|---------|---------|
| **Sitzungen** | 🌱 Neuling (1) | 🥉 Gewohnheitstier (10) | 🥈 Stammgast (50) | 🥇 Veteran (100) | 💎 Legende (250) | 👑 Meister des Universums (500) |
| **Streaks** | 📈 Auf Kurs (3) | 🔥 Wochenkönig (7) | ⚡ Unaufhaltsam (14) | 🏃 Marathon-Läufer (30) | 🛡️ Eiserne Disziplin (60) | ♾️ Zeitlos (100) |
| **Ausgaben** | 🐷 Sparschwein (50€) | 💼 Investor (200€) | 🎰 High Roller (500€) | 💎 Tycoon (1000€) | 🌳💰 Geldbaum (2000€) | - |
| **Sorten** | 🔍 Neugierig (3) | 🌿 Entdecker (5) | 🍃 Kenner (10) | 🎩 Sommelier (15) | 🏆 Meister-Sammler (20) | 🔬🌱 Botaniker (30) |

**Tagesrekord (11 Stufen!)**: Guter Tag (5) → Party Mode (10) → Hardcore (15) → Absolut Wild (20) → Übermenschlich (25) → Götterstatus (30) → Dimension X (35) → Zeitreisender (40) → Unsterblich (50) → Transzendent (75) → **Absolut Legendär (100)** 💫👑✨

#### ⏰ Zeit-basierte Achievements (8 Stufen!)

| Kategorie | Stufe 1-4 | Stufe 5-8 |
|-----------|-----------|-----------|
| **Frühaufsteher** (5-10 Uhr) | Morgenmuffel (5) → Frühaufsteher (15) → Morgenröte (30) → Sonnenanbeter (50) | Erster Vogel (75) → Sonnenaufgangs-Enthusiast (100) → Morgendämmerung (150) → **Meister der Morgendämmerung (200)** ☀️ |
| **Nachteule** (22-5 Uhr) | Nachtaktiv (5) → Nachteule (15) → Mitternachtskrieger (30) → Vampir (50) | Mondkind (75) → Nachtschatten (100) → Dunkelheit (150) → **Herrscher der Dunkelheit (200)** 🌙 |

#### 🆕 Neue Lifestyle-Achievements (5-6 Stufen!)

| Kategorie | Beschreibung | Höchste Stufe |
|-----------|--------------|---------------|
| **Weekend Warrior** | Wochenend-Sessions (Sa/So) | Ewiges Wochenende (150) ♾️🎉 |
| **Werktags-Profi** | Werktags-Sessions (Mo-Fr) | Business Tycoon (150) 👔💼 |
| **Speed Runner** | Sessions < 30 Sekunden | Überschallgeschwindigkeit (100) ⚡ |
| **Genießer** | Sessions > 60 Sekunden | Ewigkeit (100) ♾️🌌 |
| **Effizienz** | Ø Hits pro Session | Perfektion Personifiziert (6 Ø) 💯 |

### Berechnung

Achievements werden dynamisch berechnet aus:
- `sessionHits` - Array aller Sessions (mit timestamp, duration)
- `historyData` - Tägliche Zusammenfassungen (für Streaks & Tagesrekord)
- Keine Settings mehr nötig!

**Session-Klassifizierung**:
- **Frühaufsteher**: 5:00-9:59 Uhr
- **Nachteule**: 22:00-4:59 Uhr
- **Weekend**: Samstag & Sonntag
- **Werktag**: Montag-Freitag
- **Speed Runner**: Duration < 30 Sekunden
- **Genießer**: Duration > 60 Sekunden

**Vorteile v3.0**:
- ✅ **70+ Medaillen** statt 30+ (133% mehr!)
- ✅ **4 neue Kategorien** (Weekend, Werktag, Speed, Genießer)
- ✅ **Massive Erweiterungen**: Tagesrekord 11 Stufen, Frühaufsteher/Nachteule je 8 Stufen
- ✅ **Explizite Konfiguration** mit Validierung
- ✅ **Lustige Namen** motivieren mehr
- ✅ **Keine localStorage-Bugs** - alles dynamisch berechnet
- ✅ **Komplett robust** gegen Fehler

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

### v8.0 (AKTUELL) ✅
- [x] Achievements-System v3.0 mit 12 Kategorien & 70+ Medaillen
- [x] Massive Erweiterung: Tagesrekord 11 Stufen, Frühaufsteher/Nachteule je 8 Stufen
- [x] 4 neue Achievement-Kategorien (Weekend Warrior, Werktags-Profi, Speed Runner, Genießer)
- [x] Advanced Analytics mit ML (Tolerance Index, Habit Score)
- [x] Wochenvergleich, Session Duration Analytics, Peak/Off-Peak Analyse
- [x] Deutsche Zeitzone mit automatischer Sommer/Winterzeit für ESP32
- [x] Präzise LiPo-Batterie-Kalkulation
- [x] Strain-Persistierung (bleibt bei App-Neustart erhalten)
- [x] Explizite Achievement-Konfiguration mit Validierung
- [x] Zentralisierte Duration-Konstanten

### v8.1 (Q1 2025)
- [ ] Component-Refactoring (Split große Components)
- [ ] Extract ESP32 logic zu custom hook
- [ ] Webinterface für ESP32-Konfiguration
- [ ] Bluetooth-Support für direkte Verbindung
- [ ] Export als PDF/CSV
- [ ] Unit Tests für Calculations

### v8.2 (Q2 2025)
- [ ] TypeScript Migration (Start mit Utils)
- [ ] Social Features (optional teilen)
- [ ] Cloud-Sync (opt-in)
- [ ] Multi-Device Support
- [ ] Desktop App (Electron)

### v9.0 (Q3 2025)
- [ ] Strain-Empfehlungen basierend auf Analytics
- [ ] Erweiterte ML-Vorhersagen
- [ ] Community-Features
- [ ] Accessibility Verbesserungen

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
