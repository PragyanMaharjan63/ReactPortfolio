// I2C stub — the OLED is rendered from recorded draw calls, not from I2C bytes.
#pragma once
#include <Arduino.h>

struct SimWire
{
    void begin() {}
    void begin(int, int) {}
    void setClock(unsigned long) {}
};
extern SimWire Wire;
