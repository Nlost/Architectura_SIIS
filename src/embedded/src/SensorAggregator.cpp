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
    spo2[index] = frame.pulseOx.spO2Percent;
    temp[index] = frame.env.tempCelsius;
    hum[index] = frame.env.humidityPct;

    index++;
}

bool SensorAggregator::isReady()
{
    return (millis() - startTime >= 10000);
}

void SensorAggregator::computeAndSend()
{
    float hrSum = 0, spo2Sum = 0, tempSum = 0, humSum = 0;
    int hrCount = 0, spo2Count = 0, tempCount = 0, humCount = 0;

    // ✔ calcul medii fără valori 0
    for (int i = 0; i < index; i++)
    {
        if (hr[i] != 0) { hrSum += hr[i]; hrCount++; }
        if (spo2[i] != 0) { spo2Sum += spo2[i]; spo2Count++; }
        if (temp[i] != 0) { tempSum += temp[i]; tempCount++; }
        if (hum[i] != 0) { humSum += hum[i]; humCount++; }
    }

    float hrAvg = hrCount ? hrSum / hrCount : 0;
    float spo2Avg = spo2Count ? spo2Sum / spo2Count : 0;
    float tempAvg = tempCount ? tempSum / tempCount : 0;
    float humAvg = humCount ? humSum / humCount : 0;

    // =========================
    // 🟢 SERIAL MONITOR OUTPUT
    // =========================
    Serial.println("\n========== 10s AGGREGATED FRAME ==========");

    Serial.print("HR avg: ");
    Serial.println(hrAvg);

    Serial.print("SpO2 avg: ");
    Serial.println(spo2Avg);

    Serial.print("Temp avg: ");
    Serial.println(tempAvg);

    Serial.print("Humidity avg: ");
    Serial.println(humAvg);

    Serial.println("ECG samples in this window:");

    // dacă ai ECG buffer separat îl afișezi aici
    // (dacă nu, doar mesaj)
    Serial.println("(ECG raw values handled separately)");

    Serial.println("=========================================\n");

    // ✔ reset buffer
    index = 0;
    startTime = millis();
}