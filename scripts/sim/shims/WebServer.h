// Web server stub. The calibration/gamepad HTTP handlers are not part of the
// simulation; the browser calls the gait functions directly.
#pragma once
#include <Arduino.h>

struct SimString
{
    const char *s = "";
    int toInt() const { return atoi(s); }
    operator const char *() const { return s; }
};

class WebServer
{
public:
    explicit WebServer(int = 80) {}
    void begin() {}
    void handleClient() {}
    void on(const char *, void (*)()) {}
    void onNotFound(void (*)()) {}
    void send(int, const char *, const char *) {}
    bool hasArg(const char *) { return false; }
    SimString arg(const char *) { return SimString(); }
};
