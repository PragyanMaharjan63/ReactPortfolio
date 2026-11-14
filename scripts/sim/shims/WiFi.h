// Wi-Fi is not simulated: the gait build links the firmware's control code, not
// its web UI. These stubs exist only so declaration.h compiles.
#pragma once
#include <Arduino.h>

struct IPAddress
{
    const char *toString() const { return "0.0.0.0"; }
};

struct SimWiFi
{
    bool softAP(const char *, const char *) { return true; }
    IPAddress softAPIP() { return IPAddress(); }
    void mode(int) {}
    void disconnect() {}
};
extern SimWiFi WiFi;
