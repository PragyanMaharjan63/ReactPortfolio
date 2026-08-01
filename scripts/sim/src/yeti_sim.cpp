// YetiBot tap-interaction simulation entry point.
//
// Includes the firmware's own app.h, which pulls in the real state machine
// (stateHandler.h), the real pomodoro and flappy-bird apps, and all 772 face
// frames. Tap counting, the 400 ms tap window, the 200 ms hold threshold and
// the 10 s sleep timeout are therefore the firmware's, not a reimplementation.
//
// The host owns the clock: it calls yeti_tick() with a real timestamp and
// yeti_touch() when the user presses or releases the top of the head. Both map
// onto exactly what the ESP32 sees — a millis() value and a level on TOUCH_PIN.

#include "app.h"

// --- virtual machine state shared with the shims ---------------------------
unsigned long sim_clock_ms = 0;
int sim_pin_state[64] = {0};
int sim_servo_physical[16] = {0};
SimSerial Serial;
SimWire Wire;

SimDrawCmd sim_cmds[SIM_MAX_CMDS];
int sim_cmd_count = 0;
char sim_strpool[SIM_STRPOOL];
int sim_strpool_len = 0;

// The host advances time itself, so a delay() inside firmware code (the buzzer
// routine, the boot animation) must not also move the clock or the two would
// race. Absorb it.
void sim_on_delay(unsigned long ms) { sim_clock_ms -= ms; }

extern "C"
{
    void yeti_setup()
    {
        sim_clock_ms = 0;
        // Mirrors the firmware's setup() minus the hardware bring-up: Serial,
        // I2C and the SSD1306 probe have no meaning here, and the boot
        // animation is a blocking 150-frame loop the host plays separately.
        pinMode(TOUCH_PIN, INPUT_PULLUP);
        sim_pin_state[TOUCH_PIN] = LOW;
        flappyBirdBegin();
        setState(STATE_DEFAULT);
    }

    // `now` is milliseconds since the simulation started.
    void yeti_tick(int now)
    {
        sim_clock_ms = (unsigned long)now;
        sim_cmd_count = 0;
        sim_strpool_len = 0;
        handleState();
    }

    // The touch pad reads HIGH while pressed (setup uses INPUT_PULLUP, and
    // handleState() treats HIGH as touched).
    void yeti_touch(int pressed) { sim_pin_state[TOUCH_PIN] = pressed ? HIGH : LOW; }

    int yeti_state() { return (int)currentState; }
    int yeti_frame() { return currentFrame; }
    int yeti_menu_index() { return selectedMenuItem; }
    int yeti_menu_count() { return appMenuCount; }
    const char *yeti_menu_item(int i) { return (i >= 0 && i < appMenuCount) ? appMenuItems[i] : ""; }
    int yeti_tap_count() { return tapCount; }

    // Timing constants, so the host's on-screen hints cannot drift from the
    // firmware's actual behaviour.
    int yeti_tap_window_ms() { return TAP_WINDOW; }
    int yeti_hold_threshold_ms() { return (int)HOLD_THRESHOLD; }
    int yeti_sleep_timeout_ms() { return (int)SLEEP_TIMEOUT; }
    int yeti_frame_delay_ms() { return FRAME_DELAY; }
    int yeti_screen_width() { return SCREEN_WIDTH; }
    int yeti_screen_height() { return SCREEN_HEIGHT; }

    // --- recorded draw calls for this tick ---
    const SimDrawCmd *yeti_cmds() { return sim_cmds; }
    int yeti_cmd_count() { return sim_cmd_count; }
    const char *yeti_strpool() { return sim_strpool; }

    // Boot animation, played once on load: frame count and the bitmap pointer.
    int yeti_boot_frames() { return BootLogo::epd_bitmap_allArray_LEN; }
    const unsigned char *yeti_boot_frame(int i)
    {
        if (i < 0 || i >= (int)BootLogo::epd_bitmap_allArray_LEN)
            return BootLogo::epd_bitmap_allArray[0];
        return BootLogo::epd_bitmap_allArray[i];
    }
}
