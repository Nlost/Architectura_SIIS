#ifndef ECG_SENSOR_H
#define ECG_SENSOR_H

#include <Arduino.h>

struct EcgSample {
    uint32_t timestampMs;
    uint16_t rawAdcValues[50];
    uint8_t sampleCount;
    bool leadOff;
};

class ECGSensor {
public:
    bool init(uint8_t outputPin,
              uint8_t loPlusPin,
              uint8_t loMinusPin);

    EcgSample readSample();

private:
    uint8_t ecgPin;
    uint8_t loPlus;
    uint8_t loMinus;

    bool initialized = false;
};

#endif