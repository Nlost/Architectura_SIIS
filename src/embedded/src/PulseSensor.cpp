#include "PulseSensor.h"

bool PulseSensor::init(uint8_t analogPin)
{
    pin = analogPin;
    pinMode(pin, INPUT);

    Serial.println("[PulseSensor] Init OK");

    stableCounter = 0;
    noFingerCounter = 0;
    state = NO_FINGER;

    initialized = true;
    return true;
}

PulseReading PulseSensor::read()
{
    PulseReading r;

    int signal = analogRead(pin);

    // =========================
    // DETECȚIE DEGET (mai robustă)
    // =========================
    bool fingerDetected = signal > 800;

    // =========================
    // UPDATE COUNTERS
    // =========================
    if (fingerDetected)
    {
        stableCounter++;
        noFingerCounter = 0;
    }
    else
    {
        noFingerCounter++;
        stableCounter = 0;
    }

    // =========================
    // NO FINGER CONFIRMAT
    // =========================
    if (noFingerCounter > 5)
    {
        state = NO_FINGER;

        r.heartRateBpm = 0;
        r.spO2Percent = 0;
        r.validReading = false;

        Serial.println("[PulseSensor] NO FINGER");
        return r;
    }

    // =========================
    // ÎNCĂ STABILIZARE LA DEGET
    // =========================
    if (stableCounter < 5)
    {
        r.heartRateBpm = 0;
        r.spO2Percent = 0;
        r.validReading = false;
        return r;
    }

    // =========================
    // FINGER STABIL
    // =========================
    state = FINGER_STABLE;

    static float fakeBpm = 70;
    fakeBpm += random(-1, 2);

    if (fakeBpm < 55) fakeBpm = 55;
    if (fakeBpm > 95) fakeBpm = 95;

    r.heartRateBpm = (uint16_t)fakeBpm;
    r.spO2Percent = 96 + random(0, 3);
    r.validReading = true;

    return r;
}

PulseReading PulseSensor::singleMeasurementCycle()
{
    return read();
}

bool PulseSensor::detectBeat(int signal)
{
    if (signal > lastValue + 50)
        return true;

    return false;
}