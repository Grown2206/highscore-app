# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [7.0.0] - 2024-12-17

### 🎉 Major Release - Badge-System & Auto-Backup

Diese Version bringt zwei wichtige neue Features und ersetzt das fehleranfällige Achievement-System komplett.

### ✨ Added

#### Badge-System (Komplett neu)
- **8 Badge-Kategorien** mit je 4 Levels (Bronze, Silber, Gold, Platin):
  - Sessions: Gesamtanzahl an Sessions
  - Streaks: Konsistenz über aufeinanderfolgende Tage
  - Tagesrekord: Maximale Hits an einem Tag
  - Ausgaben: Budget-Tracking basierend auf Konsum
  - Sorten: Vielfalt der probierten Strains
  - Frühaufsteher: Sessions vor 12:00 Uhr
  - Nachteule: Sessions nach 22:00 Uhr
  - Effizienz: Durchschnittliche Hits pro Session
- **Echtzeit-Fortschritt**: Progress-Bars zeigen Fortschritt zum nächsten Level
- **Dynamische Berechnung**: On-the-fly aus sessionHits und historyData
- **Neue Component**: `BadgesView.jsx` mit modernem UI
- **Utility Module**: `src/utils/badges.js` mit allen Badge-Definitionen

#### Auto-Backup-System
- **Multi-Layer Backup-Strategie**:
  - 3 rotierende localStorage Slots (alle 5 Minuten wechselnd)
  - Filesystem Backup via Capacitor (Android/iOS)
  - Emergency Backup bei `beforeunload` Event
  - Background Backup bei `visibilitychange` Event
- **Custom Hook**: `useAutoBackup.js` für automatische Backups
- **Recovery UI**: `DataRecovery.jsx` Modal zur Backup-Auswahl
- **Automatische Bereinigung**: Alte Backups (>7 Tage) werden entfernt
- **Backup-Validierung**: Prüfung von Datenintegrität vor Restore
- **Wiederherstellungs-Button**: In SettingsView integriert

#### Shared Constants Module
- **`src/utils/constants.js`**: Zentralisierte Konfiguration
- `DEFAULT_SETTINGS`: Standard-Werte für App-Einstellungen
- `STORAGE_KEYS`: Konsistente localStorage-Keys
- `APP_VERSION`: Versionsverwaltung

### 🔄 Changed
- **Navigation**: "Erfolge" → "Badges"
- **Bundle Size**: Reduziert um ~3KB durch effizienteres Badge-System
- **Dependencies**: `@capacitor/filesystem@^5.2.2` hinzugefügt
- **Export Format**: Version 7.0 in Export-Daten
- **Context**: showRecovery State zu App-Context hinzugefügt

### 🗑️ Removed
- **Achievement-System komplett entfernt**:
  - `achievements` State
  - `unlockAchievement()` Function
  - `checkAchievements()` Function (~140 Zeilen)
  - Alle 50 individuellen Achievement-Definitionen
  - Achievement-bezogene localStorage-Logik
- **AchievementsView Component** (ersetzt durch BadgesView)

### 🐛 Fixed
- **Achievement-Bugs**: Keine localStorage-Bugs mehr durch dynamische Badge-Berechnung
- **Redundanter Code**: adminMode-Assignment in setSettings vereinfacht
- **Data Loss**: Auto-Backup verhindert Datenverlust bei App-Crashes

### 📝 Documentation
- **README.md**: Komplett neu erstellt mit allen Features
- **CHANGELOG.md**: Diese Datei erstellt
- **ESP32 READMEs**: Aktualisiert mit v7.0 Kompatibilität

### ⚠️ Breaking Changes
- **Achievement-Daten**: Alte Achievements werden nicht mehr geladen
- **Export/Import**: Alte Exports mit Achievements funktionieren noch, Achievements werden aber ignoriert
- **localStorage**: `hs_achievements_v6` wird nicht mehr verwendet

---

## [6.1.0] - 2024-12-13

### ✨ Added
- **Code Review Fixes**: Verbesserungen aus Code Review umgesetzt
- **Shared Constants**: Erste Version von shared constants

### 🐛 Fixed
- **setSettings Logic**: Redundanter adminMode-Code entfernt
- **Achievement Comments**: Logik besser dokumentiert

---

## [6.0.0] - 2024-12-01

### 🎉 Major Refactor

### ✨ Added
- **Achievement-System**: 50 verschiedene Erfolge
- **Goals System**: Personalisierte Ziele setzen
- **Calendar View**: Historische Übersicht
- **Strain Management**: Sorten-Katalog
- **Charts**: Visualisierungen mit Recharts

### 🔄 Changed
- **Complete UI Overhaul**: Neues Design mit Tailwind CSS
- **State Management**: Optimiert mit useCallback/useMemo
- **Performance**: Verbesserte Render-Performance

---

## [5.0.0] - 2024-10-15

### ✨ Added
- **ESP32 Integration**: WiFi-Sensor-Support
- **Live Tracking**: Echtzeit-Temperaturüberwachung
- **API Endpoints**: REST API für Hardware
- **Demo Mode**: App ohne Hardware testen

### 🔄 Changed
- **Architecture**: Capacitor 5.0 Integration
- **Mobile Support**: Native Android/iOS Apps

---

## [4.0.0] - 2024-08-20

### ✨ Added
- **Streak Tracking**: Tägliche Konsistenz
- **Statistics**: Erweiterte Analysen
- **Export/Import**: JSON-basierte Datensicherung

### 🐛 Fixed
- **localStorage Bugs**: Stabilere Datenpersistierung
- **Date Handling**: Timezone-Probleme behoben

---

## [3.0.0] - 2024-06-10

### ✨ Added
- **History View**: Tägliche Übersicht
- **Session Details**: Temperatur, Zeit, Sorte
- **Settings Panel**: Anpassbare Konfiguration

---

## [2.0.0] - 2024-04-05

### ✨ Added
- **React Migration**: Von Vanilla JS zu React
- **Component Architecture**: Modularer Aufbau
- **Tailwind CSS**: Modernes Styling

---

## [1.0.0] - 2024-02-01

### 🎉 Initial Release

### ✨ Added
- **Basic Tracking**: Hit-Counter
- **Daily Reset**: Automatisches Zurücksetzen
- **localStorage**: Lokale Datenspeicherung
- **Simple UI**: Basis-Interface

---

## Legende

- `✨ Added` - Neue Features
- `🔄 Changed` - Änderungen an bestehenden Features
- `🗑️ Removed` - Entfernte Features
- `🐛 Fixed` - Bugfixes
- `📝 Documentation` - Dokumentations-Änderungen
- `⚠️ Breaking Changes` - Nicht-rückwärtskompatible Änderungen
- `🎉 Major Release` - Große Version mit vielen Änderungen

---

## Geplante Releases

### [7.1.0] - Q1 2025
- [ ] Webinterface für ESP32-Konfiguration
- [ ] Bluetooth-Support
- [ ] PDF/CSV Export
- [ ] Darkmode-Verbesserungen

### [7.2.0] - Q2 2025
- [ ] Social Features (optional)
- [ ] Cloud-Sync (opt-in)
- [ ] Multi-Device Support
- [ ] Desktop App (Electron)

### [8.0.0] - Q3 2025
- [ ] Machine Learning Integration
- [ ] Erweiterte Analytics
- [ ] Strain-Empfehlungen
- [ ] Community-Features

---

[7.0.0]: https://github.com/Grown2206/highscore-app/compare/v6.1.0...v7.0.0
[6.1.0]: https://github.com/Grown2206/highscore-app/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/Grown2206/highscore-app/compare/v5.0.0...v6.0.0
[5.0.0]: https://github.com/Grown2206/highscore-app/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/Grown2206/highscore-app/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/Grown2206/highscore-app/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/Grown2206/highscore-app/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Grown2206/highscore-app/releases/tag/v1.0.0
