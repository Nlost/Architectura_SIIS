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

    if (!initialized)
    {
        r.validReading = false;
        return r;
    }

    unsigned long now = millis();

    // =========================
    // DHT11 poate fi citit doar la 2 sec
    // =========================
    if (now - lastReadTime < readIntervalMs)
    {
        // returnăm ULTIMA valoare validă
        r.tempCelsius = lastTemp;
        r.humidityPct = lastHumidity;
        r.validReading = lastValid;

        return r;
    }

    lastReadTime = now;

    float humidity = dht->readHumidity();
    float temperature = dht->readTemperature();

    if (isnan(humidity) || isnan(temperature))
    {
        // păstrăm ultima valoare bună
        r.tempCelsius = lastTemp;
        r.humidityPct = lastHumidity;
        r.validReading = lastValid;

        return r;
    }

    // salvăm noua valoare bună
    lastTemp = temperature;
    lastHumidity = humidity;
    lastValid = true;

    r.tempCelsius = temperature;
    r.humidityPct = humidity;
    r.validReading = true;

    return r;
}