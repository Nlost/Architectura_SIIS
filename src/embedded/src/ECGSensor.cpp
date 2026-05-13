#include "ECGSensor.h"

bool ECGSensor::init(uint8_t outputPin,
                     uint8_t loPlusPin,
                     uint8_t loMinusPin)
{
    ecgPin = outputPin;
    loPlus = loPlusPin;
    loMinus = loMinusPin;

    pinMode(ecgPin, INPUT);
    pinMode(loPlus, INPUT);
    pinMode(loMinus, INPUT);

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
        digitalRead(loPlus) == HIGH ||
        digitalRead(loMinus) == HIGH;

    s.leadOff = leadOff;

    if (leadOff || !initialized) {
        return s;
    }

    // colectăm 50 de eșantioane rapide
    for (int i = 0; i < 50; i++) {
        s.rawAdcValues[i] = analogRead(ecgPin);
        delayMicroseconds(1000); // ~1ms sampling
        s.sampleCount++;
    }

    return s;
}