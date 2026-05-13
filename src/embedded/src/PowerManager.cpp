#include "PowerManager.h"
#include <Arduino.h>

void PowerManager::enterLightSleepMs(uint32_t durationMs)
{
    Serial.println("[Power] Sleep mode...");
    delay(durationMs);
    Serial.println("[Power] Wake up...");
}

void PowerManager::wakeUp()
{
    Serial.println("[Power] WakeUp called");
}

uint8_t PowerManager::getBatteryLevelPercent()
{
    static int battery = 100;
    static int counter = 0;

    counter++;

    // scade o dată la 4 apeluri (SEQ-uri)
    if (counter >= 4) {
        if (battery > 10) {
            battery--;
        }
        counter = 0;
    }

    return battery;
}