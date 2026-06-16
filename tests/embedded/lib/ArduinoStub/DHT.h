#pragma once

#include "Arduino.h"

#define DHT11 11
#define DHT22 22

class DHT {
public:
    DHT(uint8_t, uint8_t) {}
    void  begin() {}
    float readHumidity()    { return 50.0f; }
    float readTemperature() { return 25.0f; }
};
