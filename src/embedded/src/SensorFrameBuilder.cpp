#include "SensorFrameBuilder.h"

void SensorFrameBuilder::init(PulseSensor* p, EnvSensor* e, ECGSensor* ecgSensor)
{
    pulseOx = p;
    env = e;
    ecg = ecgSensor;
}

SensorFrame SensorFrameBuilder::assembleTenSecondFrame(uint32_t seq)
{
    SensorFrame frame;

    frame.seqNumber = seq;
    frame.timestampMs = millis();

    // ======================
    // PulseOx (OBIECT COMPLET)
    // ======================
    frame.pulseOx = pulseOx->singleMeasurementCycle();

    // ======================
    // ENV (OBIECT COMPLET)
    // ======================
    frame.env = env->readHumidityAndTemperature();

    // ======================
    // ECG (OBIECT COMPLET)
    // ======================
    frame.ecg = ecg->readSample();

    return frame;
}