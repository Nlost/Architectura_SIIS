#ifndef FIRMWARE_MAIN_LOOP_H
#define FIRMWARE_MAIN_LOOP_H

#include <Arduino.h>
#include "BoardManager.h"
#include "PulseSensor.h"
#include "EnvSensor.h"
#include "ECGSensor.h"
#include "SensorFrameBuilder.h"
#include "PowerManager.h"
#include "BlePeripheral.h"
#include "SensorAggregator.h"

class FirmwareMainLoop {
public:
    void init();
    SensorFrame runMeasurementCycle();
    void handleBleStatus();
    void loop();

private:
    BoardManager board;
    PulseSensor pulseOx;
    EnvSensor env;
    ECGSensor ecg;
    SensorFrameBuilder builder;
    uint32_t seq = 0;
    PowerManager power;
    BlePeripheral ble;
     // =========================
    //  TIMERE NOI 
    // =========================
    unsigned long lastFrameTime = 0;
    unsigned long lastSampleTime = 0;

    const unsigned long FRAME_INTERVAL = 10000;   // 10 sec
    const unsigned long SAMPLE_INTERVAL = 1000;   // 1 sec

    SensorAggregator aggregator;

};

#endif