# YetiBot — model & component breakdown

Target model: **Compagnon 309 — build your expressive robot**
<https://makerworld.com/en/models/2109424-compagnon-309-build-your-expressive-robot>

> **Editable source:** `scripts/blender/yetibot.blend`.
> Fix the assembly there, then re-export:
> ```bash
> npm run build:models     # both robots
> npm run build:sim        # recompress + rebuild the firmware wasm
> ```
> See `scripts/blender/README.md`.

---

## 1. What is verified

From the project's own repository and site (`yetibot.vercel.app`,
`PragyanMaharjan63/yetibot`) and the photographs in
`client/public/media/yetibot/`:

| Aspect | Verified |
|---|---|
| Shell | 3D printed, FDM — layer lines visible. White body, blue display bezel. |
| Output | A front display showing expressions, status and menu prompts |
| Input | Touch on the shell surface |
| Loop | Sense touch → compare against programmed behaviour → play animation |
| Modes | Expressions · menu navigation · built-in play mode |
| Menu | On-screen prompts map tap counts to *open menu / skip / select* |
| Variants | Explorer (starter) · Scout (balanced) · Builder (expandable) |
| Status | Working prototype, with a user manual |

**Now known, from `scripts/robotCode/yetibot/`:** ESP32-C3 (`esp32-c3-devkitm-1`),
a 128x64 SSD1306 OLED at I2C address 0x3C on pins SDA 4 / SCL 5, a single touch
input on GPIO 7, and a buzzer on GPIO 8. Firmware is Arduino C++ under
PlatformIO. There are **no motors** — the robot's whole output is the display
and the buzzer.

## 2. Nodes in the GLB

```
yetibot_root
  body          printed shell — horns, tuft, arms and feet are modelled in
  bezel         printed display frame
  screen        display panel; the OLED quad is mounted as its child
  back_panel
  head_top      empty at the crown, anchors the "TAP HERE" marker
```

The OLED is **not** textured onto the `screen` mesh's own UVs. That mesh is a
thin box from a generic unwrap, and Blender's exporter decomposes its transform
as a 180° rotation with scale `(-1,-1,-1)` — a net reflection, which renders any
child mirrored. `YetiBotSim` instead mounts a correctly-sized quad on the panel's
outward face, sized to the OLED's true 2:1 aspect rather than the printed
pocket's 1.48:1, and cancels the reflection. Both details are load-bearing: the
first showed up as back-to-front menu text, the second as a header and hint line
hidden behind the bezel lip.

## 3. How the shipped GLB is built

From the hand-assembled `scripts/blender/yetibot.blend`, via
`scripts/blender/export_rigged_glb.py`, which parents the parts under
`yetibot_root`, drops the `head_top` anchor at the crown of the shell, decimates
copies, and exports at 1 Blender unit = 1 mm scaled to viewer size. Draco
compression in `scripts/sim/build.sh` takes it from 489 KB to 35 KB.

Hidden `unused_parts` (OLED holder, spiked disc, clips) are dropped at export.

## 4. Tap interaction — done, and driven by the firmware

`client/public/sim/yeti.wasm` is the firmware's `app.h` compiled unmodified: the
real state machine, the real pomodoro and flappy-bird apps, and all 772 face
frames. Pressing the robot in the viewer sets `TOUCH_PIN`, exactly what the
sensor does.

Everything below is read from the firmware, not configured in the viewer:

| Behaviour | Constant | Value |
|---|---|---|
| Taps inside this window are one gesture | `TAP_WINDOW` | 400 ms |
| Press longer than this is a hold | `HOLD_THRESHOLD` | 200 ms |
| Idle this long and it sleeps | `SLEEP_TIMEOUT` | 10 s |
| Animation frame interval | `FRAME_DELAY` | 42 ms |

Tap rules, from `handleTaps()`: 3+ taps open the menu from anywhere; in the menu
1 tap steps, 2 taps open, 3+ leave; in the pomodoro 1 tap switches phase and 2
return to the menu; from sleep, 1 tap wakes. A hold from idle goes to the LOVE
animation.

States and their frame ranges: default 0–269, sleep intro from 155, sleep loop
200–240, sleep pop 241–267, love 500–554 / 454–499.

The screen is rendered from recorded draw calls rather than a texture atlas —
see `scripts/sim/README.md`.

## 5. Still needed

- [x] `yetibot.glb` — from the hand-assembled `.blend`
- [x] Microcontroller, display and touch-sensor part numbers
- [x] Firmware — `scripts/robotCode/yetibot/`
- [x] Tap behaviour driven by that firmware
- [x] Live site — <https://yetibot.vercel.app>
- [x] Demo videos — `demo-motion.mp4`, `demo-touch.mp4`
- [ ] Poster frames pulled from those videos (currently reusing photographs)
