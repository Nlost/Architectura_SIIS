#pragma once

#include <cstdint>
#include <cstddef>
#include <cmath>
#include <cstdio>
#include <cstdlib>

#ifndef INPUT
#define INPUT  0
#endif
#ifndef OUTPUT
#define OUTPUT 1
#endif
#ifndef LOW
#define LOW    0
#endif
#ifndef HIGH
#define HIGH   1
#endif

unsigned long millis();
void          __testSetMillis(unsigned long value);

inline void   delay(unsigned long) {}

inline void   pinMode(uint8_t, int) {}
inline int    analogRead(uint8_t) { return 0; }
inline int    digitalRead(uint8_t) { return 0; }
inline void   digitalWrite(uint8_t, int) {}

inline long   random(long minInclusive, long maxExclusive) {
    if (maxExclusive <= minInclusive) return minInclusive;
    return minInclusive + (std::rand() % (maxExclusive - minInclusive));
}

struct SerialStub {
    void begin(unsigned long) {}
    template <typename T> void print(const T&)   {}
    template <typename T> void println(const T&) {}
    void println() {}
};
extern SerialStub Serial;
