// Arduino core, reduced to what the two firmwares actually call, for building
// them as WebAssembly. Nothing here emulates hardware: the point is that the
// *firmware* source compiles unmodified, so the browser runs the same control
// flow the ESP32 does instead of a hand-written JavaScript copy of it.
//
// Time is virtual. `millis()` reads a counter that the host advances, and
// `delay()` moves that counter forward instead of blocking — a blocking delay
// in a browser would freeze the tab. Each target installs `sim_on_delay()` to
// decide what a delay means: the gait build records a servo pose there, the
// YetiBot build ignores it because the host drives the clock directly.
#pragma once

#include <stdint.h>
#include <stdio.h>
#include <stdarg.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>

#define PROGMEM
#define pgm_read_byte(addr) (*(const unsigned char *)(addr))
#define pgm_read_word(addr) (*(const unsigned short *)(addr))
#define pgm_read_ptr(addr) (*(void *const *)(addr))
#define F(s) (s)

#define HIGH 1
#define LOW 0
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2

typedef uint8_t byte;
typedef bool boolean;

// --- virtual clock ---------------------------------------------------------
extern unsigned long sim_clock_ms;

// Installed by each target; called by delay() before the clock advances.
void sim_on_delay(unsigned long ms);

inline unsigned long millis() { return sim_clock_ms; }
inline unsigned long micros() { return sim_clock_ms * 1000UL; }

inline void delay(unsigned long ms)
{
    sim_on_delay(ms);
    sim_clock_ms += ms;
}
inline void delayMicroseconds(unsigned int us) { sim_clock_ms += us / 1000; }

// --- GPIO ------------------------------------------------------------------
// Only the touch pin is ever read, and the host sets it via sim_set_pin().
extern int sim_pin_state[64];

inline void pinMode(int, int) {}
inline int digitalRead(int pin) { return (pin >= 0 && pin < 64) ? sim_pin_state[pin] : 0; }
inline void digitalWrite(int pin, int v) { if (pin >= 0 && pin < 64) sim_pin_state[pin] = v; }
inline void analogWrite(int, int) {}
// Read as floating noise, which is all the firmware wants it for — it seeds
// the flappy-bird RNG from an unconnected pin.
inline int analogRead(int) { return (int)(sim_clock_ms * 2654435761u >> 20) & 0xFFF; }
inline void analogWriteFrequency(int) {}
inline void analogWriteFrequency(int, int) {}

// --- misc ------------------------------------------------------------------
inline long random(long hi) { return hi > 0 ? (long)(rand() % hi) : 0; }
inline long random(long lo, long hi) { return hi > lo ? lo + (long)(rand() % (hi - lo)) : lo; }
inline void randomSeed(unsigned long s) { srand((unsigned)s); }

#ifndef constrain
#define constrain(x, a, b) ((x) < (a) ? (a) : ((x) > (b) ? (b) : (x)))
#endif
#ifndef map
inline long map(long x, long a, long b, long c, long d) { return (x - a) * (d - c) / (b - a) + c; }
#endif

// --- Serial ----------------------------------------------------------------
// Templated so any argument type compiles; output is discarded.
struct SimSerial
{
    void begin(unsigned long = 115200) {}
    void end() {}
    void flush() {}
    operator bool() const { return true; }
    template <class T> void print(const T &) {}
    template <class T> void print(const T &, int) {}
    template <class T> void println(const T &) {}
    void println() {}
    void printf(const char *, ...) {}
    void write(int) {}
};
extern SimSerial Serial;
