#pragma once
#include "SensorFrameBuilder.h"

class SensorAggregator {
public:
    void start();
    void addSample(const SensorFrame& frame);
    bool isReady();
    SensorFrame computeAverageFrame(uint32_t seq);
    void reset();
    
private:
    static const int MAX_SAMPLES = 10;

    float hr[10];
    float temp[10];
    float hum[10];

    static const int ECG_MAX = 500;

    uint16_t ecgBuffer[ECG_MAX];
    int ecgIndex = 0;

    int index = 0;
    unsigned long startTime = 0;
};