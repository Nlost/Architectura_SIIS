#include "EnvSensor.h"
#include <DHT.h>

#define DHTTYPE DHT11



bool EnvSensor::init(uint8_t dataPin)
{
    pin = dataPin;

    dht = new DHT(pin, DHTTYPE);
    dht->begin();

    Serial.println("[EnvSensor] Init OK");

    initialized = true;
    return true;
}

EnvReading EnvSensor::readHumidityAndTemperature()
{
    EnvReading r;

    if (!initialized) {
        r.validReading = false;
        return r;
    }

    unsigned long now = millis();

    if (now - lastReadTime < readIntervalMs)
    {
        //  NU mai returna date vechi ca "adevărate"
        r.validReading = false;
        return r;
    }

    lastReadTime = now;

    float humidity = dht->readHumidity();
    float temperature = dht->readTemperature();

    if (isnan(humidity) || isnan(temperature))
    {
        Serial.println("[EnvSensor] Read failed");
        r.validReading = false;
        return r;
    }

    lastTemp = temperature;
    lastHumidity = humidity;
    lastValid = true;

    r.tempCelsius = temperature;
    r.humidityPct = humidity;
    r.validReading = true;

    return r;
}