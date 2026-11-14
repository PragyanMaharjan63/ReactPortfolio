# Robot simulation build

The two robots on the site are driven by their **own firmware**, compiled to
WebAssembly. Nothing about the gait or the tap behaviour is re-implemented in
TypeScript, so the simulation cannot drift away from what the hardware does —
change the firmware, rebuild, and the site changes with it.

```bash
npm run build:sim
```

That builds the container in `Dockerfile` and runs `build.sh` inside it with the
repo mounted at `/work`. Outputs, all committed:

| Output | From |
|---|---|
| `client/public/sim/gait.{mjs,wasm}` | `scripts/robotCode/quadrapod3d/lib/Walk/walk.cpp` + `ServoConfig.cpp` |
| `client/public/sim/yeti.{mjs,wasm}` | `scripts/robotCode/yetibot/includes/app.h` (whole state machine + 772 frames) |
| `client/public/draco/*` | the decoder shipped inside `three`, so no CDN is needed |
| `client/public/models/*.glb` | compressed in place (3.0 MB → 207 KB) |

The toolchain stays in this container. `npm run build` and the production
`Dockerfile` never need Emscripten, Blender or `gltf-transform`.

---

## Why the firmware compiles at all

`shims/` provides just enough of the ESP32 environment for the firmware's own
source to compile unmodified — `Arduino.h`, `Wire.h`, `WiFi.h`, `WebServer.h`,
`ESP32Servo.h`, `Adafruit_GFX.h`, `Adafruit_SSD1306.h`. None of it emulates
hardware. Two ideas do the real work:

**Time is virtual.** `millis()` reads a counter and `delay()` advances it
instead of blocking, because a blocking delay in a browser freezes the tab.

**Blocking code is recorded, not run in real time.** `walk.cpp` writes eight
servos and then calls `delay(25)`, fourteen times per gait cycle. The gait build
runs that to completion in microseconds, snapshotting the commanded angles on
every delay, and hands the browser a timestamped recording to play back on its
own clock. Identical numbers, no blocking.

The YetiBot build works the other way round: the host owns the clock and calls
`yeti_tick(now)`, so the firmware's tap window, hold threshold and sleep timeout
all run against real elapsed time.

## The display

`Adafruit_GFX.h` records draw calls into a command buffer rather than
rasterising. The browser replays them onto a canvas. Full-screen bitmaps — the
face animation — are read straight out of WASM memory and blitted
nearest-neighbour, so they are bit-exact; text is drawn by the canvas at the
firmware's own 6x8 cell metrics rather than shipping a pixel copy of Adafruit's
GLCD font.

## Verifying a change

`gait_run()` is deterministic, so the recording can be compared against the gait
tables directly:

```bash
node -e '
  const f = await import("./client/public/sim/gait.mjs");
  const M = await f.default({ wasmBinary: require("fs").readFileSync("client/public/sim/gait.wasm") });
  M._gait_init(); M._gait_run(0);
  const n = M._gait_count(), s = M._gait_stride();
  const d = new Int32Array(M.HEAP32.buffer, M._gait_data(), n * s);
  console.log(n, "poses,", M._gait_duration_ms(), "ms");
'
```

Forward and backward are 14 phases (2800 ms); the turns are 9 (1800 ms). The
first recorded pose must equal `ForwardPhase[0]` in `walk.cpp`.
