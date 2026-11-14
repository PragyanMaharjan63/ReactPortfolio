// ESP32Servo stand-in. Channels are assigned in attach() order, which matches
// the firmware's own loop `for (i..7) servos[i].attach(SERVO_PINS[i])`, so
// channel N here is servo index N there.
//
// Nothing is recorded at this layer. The gait recorder snapshots
// Calibration::servoAngles (the *logical* angles the gait table is written in)
// on each delay, because those are what map cleanly onto the 3D rig; the
// physical angles this class receives have per-servo inversions baked in to
// compensate for how each horn is mounted.
#pragma once

#include <Arduino.h>

extern int sim_servo_physical[16];

class Servo
{
public:
    int attach(int pin)
    {
        channel = next_channel++;
        this->pin = pin;
        return channel;
    }
    int attach(int pin, int, int) { return attach(pin); }
    void detach() {}
    void write(int angle)
    {
        last = angle;
        if (channel >= 0 && channel < 16)
            sim_servo_physical[channel] = angle;
    }
    void writeMicroseconds(int) {}
    int read() const { return last; }
    bool attached() const { return channel >= 0; }

    void setPeriodHertz(int) {}

    // Reset by gait_init() so re-initialising does not keep allocating
    // channels past the end of the array.
    static int next_channel;

private:
    int channel = -1;
    int pin = -1;
    int last = 90;
};
