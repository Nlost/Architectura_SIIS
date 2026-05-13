#pragma once
#include "SensorFrameBuilder.h"

class SensorAggregator {
public:
    void start();
    void addSample(const SensorFrame& frame);
    bool isReady();
    void computeAndSend();
    
private:
    static const int MAX_SAMPLES = 10;

    float hr[10];
    float spo2[10];
    float temp[10];
    float hum[10];

    int index = 0;
    unsigned long startTime = 0;
};