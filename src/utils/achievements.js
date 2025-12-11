#include <WiFi.h>
#include "settings.h"
#include "storage.h"
#include "sensor.h"
#include "api.h"

void setup() {
    Serial.begin(115200);
    
    initStorage();
    initSensor();

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
    
    initAPI();
}

void loop() {
    handleClient();
}