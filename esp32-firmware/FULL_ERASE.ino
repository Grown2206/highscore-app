/*
 * ESP32 FULL NVS ERASE
 * ====================
 *
 * Dieser Sketch löscht den KOMPLETTEN NVS Flash (alle Namespaces)
 *
 * ⚠️ WARNUNG: Löscht ALLES inkl. WiFi-Kalibrierung!
 * Nutze das nur wenn RESET_ESP32.ino nicht funktioniert hat.
 *
 * ANLEITUNG:
 * 1. Diesen Sketch auf den ESP32 hochladen
 * 2. Warten bis "FULL ERASE COMPLETE!" erscheint
 * 3. Danach den normalen Sketch (highscore-sensor-c3.ino) wieder hochladen
 */

#include <nvs_flash.h>

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("  ESP32 FULL NVS ERASE");
  Serial.println("========================================");
  Serial.println();
  Serial.println("⚠️⚠️⚠️  WARNUNG  ⚠️⚠️⚠️");
  Serial.println();
  Serial.println("Löscht den KOMPLETTEN NVS Flash!");
  Serial.println("Inkl. WiFi-Kalibrierung und alle Daten!");
  Serial.println();
  Serial.println("Starte in 5 Sekunden...");

  delay(1000);
  Serial.println("5...");
  delay(1000);
  Serial.println("4...");
  delay(1000);
  Serial.println("3...");
  delay(1000);
  Serial.println("2...");
  delay(1000);
  Serial.println("1...");
  delay(1000);

  Serial.println();
  Serial.println("🗑️  Lösche kompletten NVS Flash...");

  // Lösche ALLES im NVS
  esp_err_t err = nvs_flash_erase();

  if (err == ESP_OK) {
    Serial.println("✅ NVS Flash vollständig gelöscht!");

    // Initialisiere NVS neu
    err = nvs_flash_init();
    if (err == ESP_OK) {
      Serial.println("✅ NVS Flash neu initialisiert!");
    } else {
      Serial.println("❌ NVS Initialisierung fehlgeschlagen!");
      Serial.printf("Error Code: 0x%x\n", err);
    }
  } else {
    Serial.println("❌ NVS Erase fehlgeschlagen!");
    Serial.printf("Error Code: 0x%x\n", err);
  }

  Serial.println();
  Serial.println("========================================");
  Serial.println("  ✅ FULL ERASE COMPLETE!");
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
