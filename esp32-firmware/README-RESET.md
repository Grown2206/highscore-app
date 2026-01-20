# ESP32 Reset Tools

Wenn der ESP32 alte Daten gespeichert hat und nicht richtig startet, nutze diese Reset-Tools.

## Option 1: RESET_ESP32.ino (Empfohlen)

**Löscht**: Nur die HighScore App Daten (WiFi, Hits, Settings)
**Behält**: WiFi-Kalibrierung, System-Daten

### Anleitung:
1. Öffne `RESET_ESP32.ino` in Arduino IDE
2. Wähle Board: **ESP32C3 Dev Module**
3. Wähle Port: **COMx** (z.B. COM3)
4. Upload drücken
5. **Serial Monitor öffnen** (115200 Baud)
6. Warte auf "✅ RESET COMPLETE!"
7. Lade `highscore-sensor-c3.ino` wieder hoch

### Erwartete Ausgabe:
```
========================================
  ESP32 NVS RESET TOOL
========================================

⚠️  WARNUNG: Löscht ALLE gespeicherten Daten!

Starte in 3 Sekunden...
3...
2...
1...

🗑️  Lösche Preferences Namespace 'highscore'...
✅ Preferences gelöscht!

========================================
  ✅ RESET COMPLETE!
========================================

Jetzt kannst du den normalen Sketch
(highscore-sensor-c3.ino) hochladen.

Der ESP32 wird in 5 Sekunden neu gestartet...
```

---

## Option 2: FULL_ERASE.ino (Nur bei Problemen)

**Löscht**: ALLES (inkl. WiFi-Kalibrierung)
**Nutze nur wenn**: RESET_ESP32.ino nicht geholfen hat

### Anleitung:
1. Öffne `FULL_ERASE.ino` in Arduino IDE
2. Upload drücken
3. Serial Monitor öffnen (115200 Baud)
4. Warte auf "✅ FULL ERASE COMPLETE!"
5. Lade `highscore-sensor-c3.ino` wieder hoch

---

## Troubleshooting

### Problem: Keine Ausgabe im Serial Monitor
**Lösung:**
- Baudrate auf **115200** einstellen
- Richtigen COM-Port wählen
- USB-Kabel tauschen (manche sind nur für Power)
- Reset-Button am ESP32 drücken nach Upload

### Problem: Upload schlägt fehl
**Lösung:**
- **BOOT-Button** am ESP32 gedrückt halten
- Dann Upload drücken
- BOOT-Button gedrückt halten bis "Connecting..." erscheint
- Dann loslassen

### Problem: "Sketch too big"
**Lösung:**
- Board: **ESP32C3 Dev Module**
- Partition Scheme: **Default 4MB with spiffs**

### Problem: Nach Reset immer noch alte Daten
**Lösung:**
1. Nutze `FULL_ERASE.ino`
2. Oder in Arduino IDE:
   - Tools → **Erase All Flash Before Sketch Upload** → **Enabled**
   - Dann `highscore-sensor-c3.ino` hochladen

---

## Nach erfolgreichem Reset

Der ESP32 sollte jetzt:
1. Im **AP-Mode** starten ("HighScore-Setup")
2. Keine WiFi-Daten gespeichert haben
3. Alle Counters auf 0 sein
4. Im Serial Monitor diese Meldung zeigen:

```
=== HIGH SCORE PRO v7.0 ===
ESP32-C3 + B05 Flame Sensor
Loading 0 pending hits from storage (head=0, tail=0)...
```

Jetzt kannst du das WiFi neu einrichten! 🚀
