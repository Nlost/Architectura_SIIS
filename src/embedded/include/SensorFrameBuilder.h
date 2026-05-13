#ifndef SENSOR_FRAME_BUILDER_H
#define SENSOR_FRAME_BUILDER_H

#include <Arduino.h>
#include "PulseSensor.h"
#include "EnvSensor.h"
#include "ECGSensor.h"

// ===== Value Objects =====

struct SensorFrame {
    uint32_t seqNumber;
    uint32_t timestampMs;

    PulseReading pulseOx;
    EcgSample ecg;
    EnvReading env;
};

// ===== Builder =====

class SensorFrameBuilder {
public:
    void init(PulseSensor* p, EnvSensor* e, ECGSensor* ecg);

    SensorFrame assembleTenSecondFrame(uint32_t seq);

private:
    PulseSensor* pulseOx;
    EnvSensor* env;
    ECGSensor* ecg;
};

#endif