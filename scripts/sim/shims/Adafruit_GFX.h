// Adafruit_GFX stand-in that records draw calls instead of pushing pixels.
//
// The firmware's screen output is a mix of two things: full-screen 128x64
// bitmaps (the face animation, ~772 of them) and vector-ish UI (menu, pomodoro
// clock, flappy bird). Rather than rasterise here — which would mean shipping a
// pixel-exact copy of Adafruit's GLCD font — each call is appended to a command
// buffer that the host replays onto a canvas. Bitmaps stay pixel-exact because
// the host reads their bytes straight out of WASM memory; text is drawn by the
// canvas in a pixel font at the same cursor and metrics.
#pragma once

#include <Arduino.h>

enum SimDrawOp
{
    SIM_OP_CLEAR = 0,
    SIM_OP_BITMAP = 1,
    SIM_OP_FILLRECT = 2,
    SIM_OP_LINE = 3,
    SIM_OP_TEXT = 4,
    SIM_OP_PRESENT = 5,
    SIM_OP_PIXEL = 6,
    SIM_OP_RECT = 7,
    SIM_OP_CIRCLE = 8,
};

#define SIM_MAX_CMDS 1024
#define SIM_STRPOOL 4096

struct SimDrawCmd
{
    int32_t op, a, b, c, d, e, f, g;
};

extern SimDrawCmd sim_cmds[SIM_MAX_CMDS];
extern int sim_cmd_count;
extern char sim_strpool[SIM_STRPOOL];
extern int sim_strpool_len;

inline void sim_emit(int32_t op, int32_t a = 0, int32_t b = 0, int32_t c = 0,
                     int32_t d = 0, int32_t e = 0, int32_t f = 0, int32_t g = 0)
{
    if (sim_cmd_count >= SIM_MAX_CMDS)
        return;
    SimDrawCmd &k = sim_cmds[sim_cmd_count++];
    k.op = op; k.a = a; k.b = b; k.c = c; k.d = d; k.e = e; k.f = f; k.g = g;
}

class Adafruit_GFX
{
public:
    Adafruit_GFX(int w, int h) : _w(w), _h(h) {}

    int16_t width() const { return _w; }
    int16_t height() const { return _h; }

    void setTextSize(int s) { _size = s < 1 ? 1 : s; }
    void setTextColor(int c) { _color = c; }
    void setTextColor(int c, int) { _color = c; }
    void setCursor(int x, int y) { _cx = x; _cy = y; }
    void setTextWrap(bool) {}
    int getCursorX() const { return _cx; }
    int getCursorY() const { return _cy; }

    void drawPixel(int x, int y, int c) { sim_emit(SIM_OP_PIXEL, x, y, c); }
    void drawLine(int x0, int y0, int x1, int y1, int c) { sim_emit(SIM_OP_LINE, x0, y0, x1, y1, c); }
    void drawFastHLine(int x, int y, int w, int c) { sim_emit(SIM_OP_LINE, x, y, x + w - 1, y, c); }
    void drawFastVLine(int x, int y, int h, int c) { sim_emit(SIM_OP_LINE, x, y, x, y + h - 1, c); }
    void fillRect(int x, int y, int w, int h, int c) { sim_emit(SIM_OP_FILLRECT, x, y, w, h, c); }
    void drawRect(int x, int y, int w, int h, int c) { sim_emit(SIM_OP_RECT, x, y, w, h, c); }
    void fillScreen(int c) { sim_emit(SIM_OP_FILLRECT, 0, 0, _w, _h, c); }
    void drawCircle(int x, int y, int r, int c) { sim_emit(SIM_OP_CIRCLE, x, y, r, 0, c); }
    void fillCircle(int x, int y, int r, int c) { sim_emit(SIM_OP_CIRCLE, x, y, r, 1, c); }

    void drawBitmap(int x, int y, const unsigned char *bmp, int w, int h, int c)
    {
        // The pointer is a byte offset into WASM linear memory, which the host
        // reads directly — no copy, and the bitmap stays bit-exact.
        sim_emit(SIM_OP_BITMAP, x, y, w, h, c, (int32_t)(intptr_t)bmp);
    }

    // --- text ---------------------------------------------------------------
    // Adafruit's classic font is 6x8 per character per size step; the host
    // reproduces those metrics so cursor maths stays identical.
    void print(const char *s) { emit_text(s); }
    void println(const char *s) { emit_text(s); newline(); }
    void println() { newline(); }

    void print(int v) { char b[24]; snprintf(b, sizeof b, "%d", v); emit_text(b); }
    void print(unsigned int v) { char b[24]; snprintf(b, sizeof b, "%u", v); emit_text(b); }
    void print(long v) { char b[32]; snprintf(b, sizeof b, "%ld", v); emit_text(b); }
    void print(unsigned long v) { char b[32]; snprintf(b, sizeof b, "%lu", v); emit_text(b); }
    void print(char ch) { char b[2] = {ch, 0}; emit_text(b); }
    void print(double v) { char b[32]; snprintf(b, sizeof b, "%.2f", v); emit_text(b); }
    void println(int v) { print(v); newline(); }
    void println(long v) { print(v); newline(); }

    void printf(const char *fmt, ...)
    {
        char b[256];
        va_list ap;
        va_start(ap, fmt);
        vsnprintf(b, sizeof b, fmt, ap);
        va_end(ap);
        emit_text(b);
    }

protected:
    int _w, _h;
    int _cx = 0, _cy = 0, _size = 1, _color = 1;

    void newline()
    {
        _cx = 0;
        _cy += 8 * _size;
    }

    void emit_text(const char *s)
    {
        int n = (int)strlen(s);
        if (n <= 0)
            return;
        if (sim_strpool_len + n + 1 > SIM_STRPOOL)
            return;
        int off = sim_strpool_len;
        memcpy(sim_strpool + off, s, n);
        sim_strpool[off + n] = 0;
        sim_strpool_len += n + 1;
        sim_emit(SIM_OP_TEXT, _cx, _cy, _size, _color, off, n);
        _cx += n * 6 * _size;
    }
};
