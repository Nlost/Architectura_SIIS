#ifndef PULSE_SENSOR_H
#define PULSE_SENSOR_H

#include <Arduino.h>

struct PulseReading {
    uint16_t heartRateBpm;
    float spO2Percent;
    bool validReading;
};

// 🔥 ADAUGĂ ENUM-UL AICI (în afara clasei)
enum FingerState {
    NO_FINGER,
    FINGER_STABLE
};

class PulseSensor {
public:
    bool init(uint8_t analogPin);

    PulseReading read();
    PulseReading singleMeasurementCycle();

private:
    uint8_t pin;
    bool initialized = false;

    int lastValue = 0;

    // =========================
    // 🔥 STATE MACHINE AICI
    // =========================
    FingerState state = NO_FINGER;
    int stableCounter = 0;

    int noFingerCounter = 0;

    bool isFingerPresent(int signal);
    bool detectBeat(int signal);
};

#endif