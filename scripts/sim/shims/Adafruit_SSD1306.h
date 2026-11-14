#pragma once

#include <Adafruit_GFX.h>

#define SSD1306_BLACK 0
#define SSD1306_WHITE 1
#define SSD1306_INVERSE 2
#define SSD1306_SWITCHCAPVCC 0x02
#define SSD1306_EXTERNALVCC 0x01

class Adafruit_SSD1306 : public Adafruit_GFX
{
public:
    Adafruit_SSD1306(int w, int h, void *, int = -1) : Adafruit_GFX(w, h) {}

    bool begin(int = SSD1306_SWITCHCAPVCC, int = 0x3C) { return true; }
    void clearDisplay() { sim_emit(SIM_OP_CLEAR); }
    void display() { sim_emit(SIM_OP_PRESENT); }
    void invertDisplay(bool) {}
    void dim(bool) {}
    void ssd1306_command(uint8_t) {}
};
