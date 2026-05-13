#ifndef ENV_SENSOR_H
#define ENV_SENSOR_H

#include <Arduino.h>
#include <DHT.h>

struct EnvReading {
    float humidityPct;
    float tempCelsius;
    bool validReading;
};

class EnvSensor {
public:
    bool init(uint8_t dataPin);

    EnvReading readHumidityAndTemperature();

private:
     uint8_t pin;
    bool initialized = false;

    DHT* dht = nullptr;   

    float lastTemp = 0;
    float lastHumidity = 0;
    bool lastValid = false;

    unsigned long lastReadTime = 0;
    const unsigned long readIntervalMs = 2000;
};

#endif