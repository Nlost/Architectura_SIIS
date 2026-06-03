#include "ECGSensor.h"

bool ECGSensor::init(uint8_t outputPin,
                     uint8_t loPlusPin,
                     uint8_t loMinusPin)
{
    ecgPin = outputPin;
    loPlus = loPlusPin;
    loMinus = loMinusPin;

    pinMode(loPlus, INPUT);
    pinMode(loMinus, INPUT);

    analogReadResolution(12);
    analogSetPinAttenuation(ecgPin, ADC_11db);

    Serial.println("[ECGSensor] Init OK");

    initialized = true;
    return true;
}

EcgSample ECGSensor::readSample()
{
    EcgSample s;

    s.timestampMs = millis();
    s.sampleCount = 0;

    bool leadOff =
        digitalRead(loPlus) == LOW ||
        digitalRead(loMinus) == LOW;

    s.leadOff = leadOff;

    if (leadOff || !initialized)
        return s;

    uint32_t t0 = micros();

    for (int i = 0; i < 50; i++)
{
    int raw = analogRead(ecgPin);

    // =========================
    // 1. OFFSET NORMALIZATION
    // =========================
    raw = raw - 2048;   // center around 0
    raw = raw + 2048;   // bring back to ADC range

    // =========================
    // 2. CLAMP (anti saturation spikes)
    // =========================
    if (raw > 3900) raw = 3900;
    if (raw < 100) raw = 100;

    // =========================
    // 3. SMOOTH FILTER (low-pass)
    // =========================
    static float filtered = 0;
    filtered = 0.9f * filtered + 0.1f * raw;

    raw = (int)filtered;

    // =========================
    // STORE VALUE
    // =========================
    s.rawAdcValues[i] = raw;

    Serial.println(raw);

    delayMicroseconds(1000);

    s.sampleCount++;
}

    return s;
}

bool ECGSensor::isLeadOff()
{
    return digitalRead(loPlus) == LOW ||
           digitalRead(loMinus) == LOW;
}

uint16_t ECGSensor::readRaw()
{
    if (!initialized)
        return 0;

    int raw = analogRead(ecgPin);

    // Clamp to suppress saturation spikes
    if (raw > 3900) raw = 3900;
    if (raw < 100)  raw = 100;

    // Low-pass smoothing (state retained across calls)
    filtered = 0.9f * filtered + 0.1f * raw;

    return (uint16_t)filtered;
}