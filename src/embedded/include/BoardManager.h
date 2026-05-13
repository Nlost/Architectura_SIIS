#pragma once
#include <Arduino.h>

enum class InitResult {
    OK,
    SENSOR_FAIL,
    BLE_FAIL
};

class BoardManager {
public:
    InitResult initializeBoard();
    void setDebugLevel(uint8_t level);

private:
    uint8_t debugLevel = 0;

    void initSerial();
    bool initSensors();   // doar placeholder acum
};