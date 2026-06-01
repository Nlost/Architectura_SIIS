#include "SensorAggregator.h"
#include <Arduino.h>

void SensorAggregator::start()
{
    index = 0;
    startTime = millis();
}

void SensorAggregator::addSample(const SensorFrame& frame)
{
    if (index >= MAX_SAMPLES) return;

    hr[index] = frame.pulseOx.heartRateBpm;

    if (frame.env.validReading)
    {
        temp[index] = frame.env.tempCelsius;
        hum[index] = frame.env.humidityPct;
    }
    else
    {
        temp[index] = 0;
        hum[index] = 0;
    }

    

    index++;
}

bool SensorAggregator::isReady()
{
    return (millis() - startTime >= 10000);
}

SensorFrame SensorAggregator::computeAverageFrame(uint32_t seq)
{
    SensorFrame frame;

    float hrSum=0, tempSum=0, humSum=0;
    int hrCount=0, tempCount=0, humCount=0;

    for (int i=0;i<index;i++)
    {
        if (hr[i] > 30 && hr[i] < 220)
        {
            hrSum += hr[i];
            hrCount++;
        }

        if (temp[i] > 0 && temp[i] < 60)
        {
            tempSum += temp[i];
            tempCount++;
        }

        if (hum[i] >= 0 && hum[i] <= 100)
        {
            humSum += hum[i];
            humCount++;
        }
    }

    frame.pulseOx.heartRateBpm =
        hrCount ? hrSum / hrCount : 0;

    frame.env.tempCelsius =
        tempCount ? tempSum / tempCount : 0;

    frame.env.humidityPct =
        humCount ? humSum / humCount : 0;

    frame.env.validReading =
        (tempCount > 0 && humCount > 0);

    // 🔥 ECG OUTPUT
    for (int i = 0; i < ecgIndex; i++)
    {
        frame.ecg.rawAdcValues[i] = ecgBuffer[i];
    }

    frame.ecg.sampleCount = ecgIndex;

    

    return frame;
}

void SensorAggregator::reset()
{
    index = 0;
    ecgIndex = 0;
    startTime = millis();
}