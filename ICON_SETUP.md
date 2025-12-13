# App-Icon Setup Anleitung

## Schritt 1: Logo vorbereiten

Das Logo sollte als quadratische PNG-Datei vorliegen (idealerweise 1024x1024px).

## Schritt 2: Icons in verschiedenen Größen erstellen

Du benötigst folgende Größen:

- **mipmap-mdpi**: 48x48px
- **mipmap-hdpi**: 72x72px
- **mipmap-xhdpi**: 96x96px
- **mipmap-xxhdpi**: 144x144px
- **mipmap-xxxhdpi**: 192x192px

## Schritt 3: Option A - Online Tool verwenden

1. Gehe zu https://icon.kitchen/ oder https://appicon.co/
2. Lade dein Logo hoch
3. Generiere Android Icons
4. Lade das ZIP herunter

## Schritt 4: Option B - Lokal mit ImageMagick

Wenn du ImageMagick installiert hast:

```bash
# Ausgehend von icon-1024.png im Projekt-Root:
convert icon-1024.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert icon-1024.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert icon-1024.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert icon-1024.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert icon-1024.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Für runde Icons:
convert icon-1024.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
convert icon-1024.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
convert icon-1024.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
convert icon-1024.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
convert icon-1024.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
```

## Schritt 5: Build und Sync

Nach dem Ersetzen der Icons:

```bash
npm run build
npx cap sync android
```

## Icon-Pfade

Die Icons müssen in folgende Ordner:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png (192x192)
```

## Hinweis

Das Logo sollte:
- Quadratisch sein (1:1 Verhältnis)
- Transparenten Hintergrund haben (optional)
- Gut lesbar sein auch in kleinen Größen (48x48px)
