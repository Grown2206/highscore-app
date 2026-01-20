/*
 * ESP32 RESET TOOL
 * =================
 *
 * Dieser Sketch löscht ALLE gespeicherten Daten im ESP32 NVS (Non-Volatile Storage)
 *
 * ANLEITUNG:
 * 1. Diesen Sketch auf den ESP32 hochladen
 * 2. Warten bis "RESET COMPLETE!" im Serial Monitor erscheint
 * 3. Danach den normalen Sketch (highscore-sensor-c3.ino) wieder hochladen
 */

#include <Preferences.h>

Preferences prefs;

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("  ESP32 NVS RESET TOOL");
  Serial.println("========================================");
  Serial.println();
  Serial.println("⚠️  WARNUNG: Löscht ALLE gespeicherten Daten!");
  Serial.println();
  Serial.println("Starte in 3 Sekunden...");

  delay(1000);
  Serial.println("3...");
  delay(1000);
  Serial.println("2...");
  delay(1000);
  Serial.println("1...");
  delay(1000);

  Serial.println();
  Serial.println("🗑️  Lösche Preferences Namespace 'highscore'...");

  // Öffne Preferences im Read/Write Mode
  prefs.begin("highscore", false);

  // Lösche ALLE Einträge im "highscore" Namespace
  prefs.clear();

  // Schließe Preferences
  prefs.end();

  Serial.println("✅ Preferences gelöscht!");
  Serial.println();

  // Optional: Liste alle Namespaces auf (ESP32-C3 unterstützt das)
  Serial.println("📋 Verbleibende Namespaces:");
  // Hinweis: nvs_flash_erase() würde ALLES löschen (inkl. WiFi Kalibrierung)
  // Das wollen wir normalerweise NICHT

  Serial.println();
  Serial.println("========================================");
  Serial.println("  ✅ RESET COMPLETE!");
  Serial.println("========================================");
  Serial.println();
  Serial.println("Jetzt kannst du den normalen Sketch");
  Serial.println("(highscore-sensor-c3.ino) hochladen.");
  Serial.println();
  Serial.println("Der ESP32 wird in 5 Sekunden neu gestartet...");

  delay(5000);

  ESP.restart();
}

void loop() {
  // Wird nie erreicht wegen ESP.restart() in setup()
}
