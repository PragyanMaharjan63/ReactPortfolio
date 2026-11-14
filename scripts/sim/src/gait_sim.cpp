// Quadruped gait simulation entry point.
//
// This links the firmware's own lib/Walk/walk.cpp and
// lib/servo_calibration/ServoConfig.cpp unmodified. The gait tables, the
// 8-step interpolation and the 25 ms step delay are therefore not transcribed
// into JavaScript — they are executed.
//
// walk.cpp is written to block: interpolateToPose() writes 8 servos and then
// calls delay(25). A browser cannot block, so instead of running the gait in
// real time we run it *to completion* in microseconds and record what the
// servos were commanded to do at each virtual millisecond. The host then plays
// that recording back on its own clock. Same numbers, no blocking.

#include "declaration.h"

// --- virtual machine state shared with the shims ---------------------------
unsigned long sim_clock_ms = 0;
int sim_pin_state[64] = {0};
int sim_servo_physical[16] = {0};
int Servo::next_channel = 0;
SimSerial Serial;
SimWiFi WiFi;

#define MAX_POSES 4096
#define SERVOS 8
#define STRIDE (1 + SERVOS)

// [t_ms, logical angle x8] per row.
static int32_t poses[MAX_POSES * STRIDE];
static int pose_count = 0;
static bool recording = false;

// Called by delay(). Every pose the firmware holds for a non-zero time gets one
// row, timestamped at the moment it became active.
void sim_on_delay(unsigned long ms)
{
    if (!recording || pose_count >= MAX_POSES)
        return;
    int32_t *row = &poses[pose_count * STRIDE];
    row[0] = (int32_t)sim_clock_ms;
    for (int i = 0; i < SERVOS; i++)
        row[1 + i] = (int32_t)Calibration::servoAngles[i];
    pose_count++;
    (void)ms;
}

extern "C"
{
    // Attach the servos exactly as the firmware does, so channel order and the
    // standing pose come from ServoConfig.cpp rather than from a copy of it.
    void gait_init()
    {
        Servo::next_channel = 0;
        Calibration::attachAllServos();
        Control::saveCurrentAngles();
        sim_clock_ms = 0;
    }

    // Reset to the firmware's standing pose (coxa 90, femur 135).
    void gait_reset()
    {
        Calibration::resetAllServos();
        Control::saveCurrentAngles();
    }

    // Run one full cycle of a gait and return how many poses were recorded.
    // 0 forward, 1 backward, 2 left, 3 right, 4 stop.
    int gait_run(int cmd)
    {
        pose_count = 0;
        sim_clock_ms = 0;
        recording = true;
        switch (cmd)
        {
        case 0: Control::walkForward(); break;
        case 1: Control::walkBackward(); break;
        case 2: Control::walkLeft(); break;
        case 3: Control::walkRight(); break;
        default: Control::stop(); break;
        }
        recording = false;
        return pose_count;
    }

    const int32_t *gait_data() { return poses; }
    int gait_count() { return pose_count; }
    int gait_stride() { return STRIDE; }
    int gait_servos() { return SERVOS; }

    // Total duration of the recording, so the host can loop seamlessly.
    int gait_duration_ms()
    {
        if (pose_count < 2)
            return 0;
        return poses[(pose_count - 1) * STRIDE] - poses[0] + 25;
    }

    int gait_current_angle(int i) { return (i >= 0 && i < SERVOS) ? Calibration::servoAngles[i] : 0; }
    int gait_physical_angle(int i) { return (i >= 0 && i < SERVOS) ? Calibration::getPhysicalAngle(i, Calibration::servoAngles[i]) : 0; }
    int gait_pin(int i) { return (i >= 0 && i < SERVOS) ? Calibration::SERVO_PINS[i] : -1; }
    const char *gait_name(int i) { return (i >= 0 && i < SERVOS) ? Calibration::SERVO_NAMES[i] : ""; }
    int gait_is_inverted(int i)
    {
        // Derived, not duplicated: ask the firmware what it would send.
        return (i >= 0 && i < SERVOS && Calibration::getPhysicalAngle(i, 0) != 0) ? 1 : 0;
    }
}
