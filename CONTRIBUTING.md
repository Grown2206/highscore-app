# Contributing to HIGH SCORE PRO

Danke, dass du dich für die Mitarbeit an HIGH SCORE PRO interessierst! 🌿

Dieses Dokument enthält Richtlinien für Contributions. Bitte lies es aufmerksam durch, bevor du deinen ersten Pull Request erstellst.

---

## 📋 Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Wie kann ich beitragen?](#wie-kann-ich-beitragen)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Format](#commit-message-format)
- [Testing](#testing)
- [Dokumentation](#dokumentation)

---

## Code of Conduct

### Unsere Standards

- **Respektvoll**: Behandle alle Contributors mit Respekt
- **Konstruktiv**: Gib konstruktives Feedback
- **Inklusiv**: Schaffe eine einladende Umgebung für alle
- **Verantwortungsvoll**: Cannabis-Konsum ist nur dort legal, wo es erlaubt ist

### Unerwünschtes Verhalten

- Belästigung oder diskriminierendes Verhalten
- Trolling, beleidigende Kommentare
- Veröffentlichung privater Informationen
- Förderung illegaler Aktivitäten

---

## Wie kann ich beitragen?

### 🐛 Bug Reports

Gefunden einen Bug? Erstelle ein Issue mit:

1. **Aussagekräftiger Titel**: Kurze Beschreibung des Problems
2. **Umgebung**: Browser/OS/App-Version
3. **Schritte zur Reproduktion**: Detaillierte Anleitung
4. **Erwartetes Verhalten**: Was sollte passieren?
5. **Tatsächliches Verhalten**: Was passiert wirklich?
6. **Screenshots**: Falls möglich
7. **Logs**: Console-Ausgaben, wenn vorhanden

**Template:**
```markdown
## Bug Description
Kurze Beschreibung

## Environment
- App Version: 7.0.0
- Platform: Android 13 / Chrome 120
- Device: Pixel 6

## Steps to Reproduce
1. Öffne Settings
2. Klicke auf Export
3. ...

## Expected Behavior
App sollte Daten exportieren

## Actual Behavior
App stürzt ab

## Screenshots
[Anhang]

## Console Logs
```
Error: ...
```
```

### ✨ Feature Requests

Neue Idee? Erstelle ein Issue mit:

1. **Feature-Beschreibung**: Was soll implementiert werden?
2. **Use Case**: Warum ist das nützlich?
3. **Mockups**: Visuelle Darstellung (optional)
4. **Alternativen**: Andere Lösungsansätze

**Template:**
```markdown
## Feature Request
Kurze Beschreibung

## Use Case
Warum brauchen wir das?

## Proposed Solution
Wie könnte es aussehen/funktionieren?

## Alternatives
Andere mögliche Lösungen

## Additional Context
Mockups, Screenshots, etc.
```

### 🔧 Pull Requests

Code beitragen? Super! Lies den [Pull Request Process](#pull-request-process) unten.

---

## Development Setup

### Voraussetzungen

- **Node.js** >= 16.0
- **npm** >= 8.0
- **Git** >= 2.30
- Für Mobile: **Android Studio** oder **Xcode**

### Repository Setup

```bash
# Fork das Repo auf GitHub
# Dann clone deinen Fork:
git clone https://github.com/DEIN_USERNAME/highscore-app.git
cd highscore-app

# Upstream hinzufügen
git remote add upstream https://github.com/Grown2206/highscore-app.git

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

### Branch-Strategie

- **`main`**: Stable Release Branch
- **`develop`**: Development Branch (nicht immer vorhanden)
- **Feature Branches**: `feature/badge-system`, `fix/backup-bug`, etc.

**Workflow:**

```bash
# Aktualisiere deinen Fork
git checkout main
git pull upstream main

# Erstelle Feature Branch
git checkout -b feature/your-feature-name

# Entwickle & committe
git add .
git commit -m "Add: Your feature description"

# Push zu deinem Fork
git push origin feature/your-feature-name

# Erstelle Pull Request auf GitHub
```

---

## Pull Request Process

### 1. Vorbereitung

- ✅ Fork das Repository
- ✅ Erstelle einen Feature Branch (nicht auf `main`!)
- ✅ Halte deinen Branch aktuell mit `main`
- ✅ Teste deine Änderungen lokal

### 2. Code schreiben

- ✅ Folge den [Code Style Guidelines](#code-style-guidelines)
- ✅ Schreibe klaren, lesbaren Code
- ✅ Kommentiere komplexe Logik
- ✅ Aktualisiere Dokumentation falls nötig

### 3. Commits

- ✅ Verwende das [Commit Message Format](#commit-message-format)
- ✅ Mache atomare Commits (ein Feature/Fix pro Commit)
- ✅ Squashe mehrere kleine Commits falls sinnvoll

### 4. Pull Request erstellen

**Titel-Format:**
```
Add: Badge progress indicators
Fix: Auto-backup not triggering on iOS
Refactor: Settings state management
Docs: Update ESP32 setup guide
```

**Beschreibung sollte enthalten:**

```markdown
## What does this PR do?
Kurze Beschreibung der Änderungen

## Why?
Warum sind diese Änderungen notwendig?

## Changes
- Added badge progress bars
- Updated BadgesView component
- Added tests for badge calculation

## Screenshots
[Falls UI-Änderungen]

## Testing
- [ ] Tested on Web (Chrome/Firefox/Safari)
- [ ] Tested on Android
- [ ] Tested on iOS
- [ ] All tests pass

## Related Issues
Fixes #123
Related to #456

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review done
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors
- [ ] Build succeeds
```

### 5. Review Process

- Maintainer reviewen deinen PR
- Ändere ggf. den Code nach Feedback
- Halte deinen Branch aktuell (`git rebase main`)
- Sobald approved → Merge!

### 6. Nach dem Merge

- Lösche deinen Feature Branch
- Sync deinen Fork mit upstream
- Feiere! 🎉

---

## Code Style Guidelines

### JavaScript/React

#### General

- **ES6+ Syntax**: Arrow functions, destructuring, async/await
- **Functional Components**: Nur Function Components (keine Class Components)
- **Hooks**: useState, useEffect, useCallback, useMemo
- **Named Exports**: Bevorzugt über default exports (außer für Components)

#### Naming Conventions

```javascript
// Components: PascalCase
function BadgesView() { }

// Functions: camelCase
function calculateBadges() { }

// Constants: UPPER_SNAKE_CASE
const DEFAULT_SETTINGS = { };

// Variables: camelCase
const userBadges = [];

// Event Handlers: handle[Action]
function handleButtonClick() { }
```

#### Component Structure

```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from 'lucide-react';

// 1. Imports (gruppiert: React, Libraries, Components, Utils)

function ComponentName({ prop1, prop2 }) {
  // 2. State
  const [state, setState] = useState(initialValue);

  // 3. Refs
  const ref = useRef(null);

  // 4. Memos/Callbacks
  const memoValue = useMemo(() => compute(), [deps]);
  const callback = useCallback(() => {}, [deps]);

  // 5. Effects
  useEffect(() => {
    // side effects
    return () => cleanup();
  }, [deps]);

  // 6. Event Handlers
  function handleClick() { }

  // 7. Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}

export default ComponentName;
```

#### Best Practices

```javascript
// ✅ DO: Destructure props
function Component({ name, age }) { }

// ❌ DON'T: Use props object
function Component(props) { }

// ✅ DO: Early returns
if (!data) return null;

// ❌ DON'T: Deep nesting
if (data) {
  if (data.items) {
    // ...
  }
}

// ✅ DO: Optional chaining
const value = data?.items?.[0]?.name;

// ❌ DON'T: Multiple checks
const value = data && data.items && data.items[0] && data.items[0].name;

// ✅ DO: Meaningful variable names
const unlockedBadges = badges.filter(b => b.unlocked);

// ❌ DON'T: Cryptic names
const b2 = b.filter(x => x.u);
```

### CSS/Tailwind

```javascript
// ✅ DO: Consistent ordering (Layout → Spacing → Typography → Visual)
<div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl">

// ✅ DO: Group related utilities
<div className="w-full h-full flex items-center justify-center">

// ✅ DO: Responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ DON'T: Inline styles (use Tailwind)
<div style={{ backgroundColor: 'red' }}>
```

---

## Commit Message Format

Wir verwenden **Conventional Commits** Format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- **Add**: Neue Features
- **Fix**: Bugfixes
- **Refactor**: Code-Umstrukturierung (keine Funktionsänderung)
- **Docs**: Nur Dokumentations-Änderungen
- **Style**: Code-Formatierung (keine Logik-Änderung)
- **Test**: Tests hinzufügen/ändern
- **Chore**: Build-Prozess, Dependencies, etc.

### Examples

```bash
# Feature
git commit -m "Add: Badge progress indicators to BadgesView"

# Bugfix
git commit -m "Fix: Auto-backup not triggering on iOS devices"

# Refactor
git commit -m "Refactor: Extract badge calculation to utility function"

# Documentation
git commit -m "Docs: Update ESP32 setup guide with v7.0 changes"

# Multiple lines
git commit -m "Add: Auto-backup recovery UI

- Created DataRecovery component
- Added backup validation
- Integrated with SettingsView
- Added useAutoBackup hook"
```

### Rules

- ✅ Verwende Imperativ ("Add" nicht "Added")
- ✅ Erste Zeile max. 72 Zeichen
- ✅ Trenne Type und Description mit `: `
- ✅ Beschreibe das "Was" und "Warum", nicht das "Wie"
- ❌ Keine "Fixed typo" Commits (squash diese)

---

## Testing

### Manual Testing

**Minimum Testing Checklist:**

#### Web
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)

#### Mobile
- [ ] Android (min. API 24)
- [ ] iOS (min. iOS 13)

#### Features
- [ ] Demo Mode funktioniert
- [ ] Hardware-Verbindung funktioniert (falls relevant)
- [ ] Export/Import funktioniert
- [ ] Auto-Backup wird erstellt
- [ ] Badges werden korrekt berechnet
- [ ] Keine Console Errors
- [ ] Build erfolgreich (`npm run build`)

### Automated Testing (Coming Soon)

```bash
# Unit Tests (geplant)
npm run test

# E2E Tests (geplant)
npm run test:e2e
```

---

## Dokumentation

### Was sollte dokumentiert werden?

- **Neue Features**: README.md & CHANGELOG.md aktualisieren
- **API-Änderungen**: API.md aktualisieren
- **Breaking Changes**: Klar in CHANGELOG markieren
- **Setup-Änderungen**: Installation Guide aktualisieren
- **Hardware-Änderungen**: ESP32 READMEs aktualisieren

### Dokumentations-Stil

```markdown
# ✅ DO: Klare Überschriften
## Installation
### Prerequisites

# ✅ DO: Code-Beispiele
```javascript
const example = "code";
```

# ✅ DO: Screenshots für UI-Changes
![Badge Progress](./docs/images/badge-progress.png)

# ✅ DO: Schritt-für-Schritt Anleitungen
1. Öffne Settings
2. Klicke auf Export
3. Wähle Speicherort

# ❌ DON'T: Vage Beschreibungen
"Mache irgendwas mit den Settings"
```

---

## Questions?

Hast du Fragen? Öffne ein **Discussion** auf GitHub!

- **Generelle Fragen**: [GitHub Discussions](https://github.com/Grown2206/highscore-app/discussions)
- **Bugs**: [GitHub Issues](https://github.com/Grown2206/highscore-app/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/Grown2206/highscore-app/issues)

---

## Lizenz

Mit deiner Contribution stimmst du zu, dass deine Beiträge unter der **MIT License** lizenziert werden.

---

**Danke für deine Unterstützung! 🌿💚**

Happy Coding! 🚀
