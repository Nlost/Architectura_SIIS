#include <Arduino.h>
#include "FirmwareMainLoop.h"

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