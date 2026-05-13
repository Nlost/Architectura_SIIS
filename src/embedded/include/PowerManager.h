#pragma once
#include <Arduino.h>

class PowerManager {
public:
    void enterLightSleepMs(uint32_t durationMs);
    void wakeUp();
    uint8_t getBatteryLevelPercent();
};