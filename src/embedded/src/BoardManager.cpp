#include "BoardManager.h"

InitResult BoardManager::initializeBoard()
{
    initSerial();

    Serial.println("[BoardManager] Initializing board...");

    bool sensorsOK = initSensors();

    if (!sensorsOK) {
        Serial.println("[BoardManager] Sensor init FAILED");
        return InitResult::SENSOR_FAIL;
    }

    Serial.println("[BoardManager] Board initialized OK");
    return InitResult::OK;
}

void BoardManager::setDebugLevel(uint8_t level)
{
    debugLevel = level;
    Serial.print("[BoardManager] Debug level set to: ");
    Serial.println(level);
}

void BoardManager::initSerial()
{
    Serial.begin(115200);
    delay(500);
    Serial.println("\n--- BOOT ---");
}

bool BoardManager::initSensors()
{
    Serial.println("[BoardManager] Init sensors...");

    // aici doar stub pentru acum:
    // MAX30100, AD8232, DHT11 vor veni ulterior

    delay(500);

    Serial.println("[BoardManager] Sensors ready (stub)");
    return true;
}