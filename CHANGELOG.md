# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [8.0.0] - 2024-12-28

### 🎉 Major Release - Achievements v3.0 & Advanced Analytics

Diese Version bringt die massivste Erweiterung des Achievement-Systems, erweiterte ML-basierte Analytics und zahlreiche ESP32-Verbesserungen.

### ✨ Added

#### Achievements-System v3.0 (MASSIV ERWEITERT!)
- **12 Kategorien** statt 8 (50% mehr Kategorien!)
- **70+ Medaillen** statt 30+ (133% mehr Medaillen!)
- **Tagesrekord auf 11 Stufen erweitert**: Bis zu "Absolut Legendär" (100 Hits) 💫👑✨
- **Frühaufsteher auf 8 Stufen erweitert** (5-10 Uhr Sessions):
  - Neue Stufen: Erster Vogel (75), Sonnenaufgangs-Enthusiast (100), Morgendämmerung (150), Meister der Morgendämmerung (200)
- **Nachteule auf 8 Stufen erweitert** (22-5 Uhr Sessions):
  - Neue Stufen: Mondkind (75), Nachtschatten (100), Dunkelheit (150), Herrscher der Dunkelheit (200)
- **Effizienz auf 5 Stufen erweitert**: Bis zu "Perfektion Personifiziert" (6Ø)
- **4 NEUE Kategorien** 🆕:
  - **Weekend Warrior** (6 Stufen): Wochenend-Sessions (Samstag/Sonntag)
  - **Werktags-Profi** (6 Stufen): Werktags-Sessions (Montag-Freitag)
  - **Speed Runner** (5 Stufen): Sessions < 30 Sekunden
  - **Genießer** (5 Stufen): Sessions > 60 Sekunden
- **Explizite Konfiguration**: `medalCategory` Feld mit Runtime-Validierung
- **Zentralisierte Konstanten**: `FAST_SESSION_MS` und `SLOW_SESSION_MS` in achievementsConfig.js
- **Fail-Fast Validierung**: Deskriptive Fehler bei fehlenden Medal-Kategorien

#### Advanced Analytics (MASSIV ERWEITERT!)
- **Toleranz-Index** 🆕:
  - Multi-Faktor Score (0-100) aus Frequenz, Volumen & Pausen
  - 3 Level: Niedrig/Mittel/Hoch mit Farb-Kodierung
  - Aktivtage und Durchschnitt pro Woche
- **Habit Score** 🆕:
  - 14-Tage Konsistenz-Analyse
  - Emoji-Rating: Chaotisch 🎲 → Roboterhaft 🤖
  - Z-Score-basierte Bewertung
- **Wochenvergleich** 🆕:
  - Diese Woche vs. letzte Woche
  - Trend-Indikator (↑ steigend, ↓ fallend, → stabil)
  - Prozentuale Veränderung
- **Session Duration Analytics** 🆕:
  - Durchschnitt, Median, Schnellste/Langsamste
  - Progress-Bar Visualisierung
- **Peak vs Off-Peak Analyse** 🆕:
  - Tageszeit-Verteilung (Peak: 18-23 Uhr)
  - Prozentuale Aufteilung
  - Aktivste Stunde

#### ESP32 Firmware Verbesserungen
- **Deutsche Zeitzone mit DST** 🆕:
  - POSIX String: `"CET-1CEST,M3.5.0,M10.5.0/3"`
  - Automatische Sommer/Winterzeit-Umstellung
  - NTP Sync mit `pool.ntp.org`
- **Präzise Batterie-Kalkulation** 🆕:
  - LiPo-Chemie: 4.2V (100%) → 3.0V (0%)
  - Lineare Interpolation mit `constrain()`
  - Fix für "stuck at 100%" Bug
- **Strain-Persistierung** 🆕:
  - Selected Strain bleibt bei App-Neustart erhalten
  - localStorage mit lazy initialization
  - Fallback auf erste Sorte

### 🔄 Changed
- **App Version**: 7.0 → 8.0
- **Achievement Config**: Refactored mit expliziter Kopplung
- **Progress Badges**: Targets werden aus MEDAL_DEFINITIONS abgeleitet
- **Duration Thresholds**: Von AchievementsView.jsx zu achievementsConfig.js verschoben
- **Session Counting**: Klarstellende Kommentare zu hits vs. sessions
- **README.md**: Komplett aktualisiert mit allen v8.0 Features
- **Roadmap**: v8.0 als "AKTUELL" markiert

### 🐛 Fixed
- **Toleranz-Index-Logik**: Pause Score war invertiert (mehr Pausen sollten Index senken)
- **Tailwind JIT Purge**: Dynamische Classes durch feste Mapping-Objekte ersetzt
- **Typo**: "Wöchent Vergleich" → "Wochenvergleich"
- **Import Error**: `CalendarIcon` vs `Calendar` Import-Mismatch behoben
- **Threshold Duplication**: PROGRESS_BADGES.targets jetzt automatisch aus Medals abgeleitet
- **Battery Calculation**: Stuck-at-100% Bug durch korrekte LiPo-Formel behoben

### 📝 Documentation
- **README.md**:
  - Version auf 8.0 aktualisiert
  - Achievement-Tabellen komplett neu
  - Neue Analytics-Sektion
  - ESP32-Features aktualisiert
  - Projektstruktur detailliert
- **CHANGELOG.md**: Diese Datei aktualisiert
- **Code Comments**: Klarstellungen zu Session-Counting und Duration-Units

### 📊 Statistics
- **Commits**: 5 Commits für v8.0
- **Files Changed**: 4 Hauptdateien
- **Lines Added**: ~150+ neue Zeilen für Achievements
- **New Medals**: 40+ neue Medaillen
- **New Analytics**: 5 neue Metriken

### 🎯 Technical Improvements
- **Code Quality**: Explizite Kopplung über implizite
- **Maintainability**: Zentralisierte Konfiguration
- **Validation**: Runtime-Checks für Medal-Kategorien
- **Documentation**: Named Constants für Durations

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

### [8.1.0] - Q1 2025
- [ ] Component-Refactoring (Split große Components)
- [ ] Extract ESP32 logic into a custom hook
- [ ] Webinterface für ESP32-Konfiguration
- [ ] Bluetooth-Support
- [ ] PDF/CSV Export
- [ ] Unit Tests für Calculations

### [8.2.0] - Q2 2025
- [ ] TypeScript Migration (Start mit Utils)
- [ ] Social Features (optional)
- [ ] Cloud-Sync (opt-in)
- [ ] Multi-Device Support
- [ ] Desktop App (Electron)

### [9.0.0] - Q3 2025
- [ ] Strain-Empfehlungen basierend auf Analytics
- [ ] Erweiterte ML-Vorhersagen
- [ ] Community-Features
- [ ] Accessibility Verbesserungen

---

[8.0.0]: https://github.com/Grown2206/highscore-app/compare/v7.0.0...v8.0.0
[7.0.0]: https://github.com/Grown2206/highscore-app/compare/v6.1.0...v7.0.0
[6.1.0]: https://github.com/Grown2206/highscore-app/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/Grown2206/highscore-app/compare/v5.0.0...v6.0.0
[5.0.0]: https://github.com/Grown2206/highscore-app/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/Grown2206/highscore-app/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/Grown2206/highscore-app/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/Grown2206/highscore-app/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Grown2206/highscore-app/releases/tag/v1.0.0
