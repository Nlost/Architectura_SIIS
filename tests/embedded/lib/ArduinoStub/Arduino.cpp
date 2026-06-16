#include "Arduino.h"

static unsigned long g_virtualMillis = 0;

unsigned long millis() {
    return g_virtualMillis;
}

void __testSetMillis(unsigned long value) {
    g_virtualMillis = value;
}

SerialStub Serial;
