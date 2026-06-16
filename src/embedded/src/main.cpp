#include <Arduino.h>
#include "FirmwareMainLoop.h"

#ifndef UNIT_TEST

FirmwareMainLoop firmware;

void setup()
{
    firmware.init();
}

void loop()
{
    firmware.loop();
    delay(2000);
}

#endif