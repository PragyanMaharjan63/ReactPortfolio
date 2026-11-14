/**
 * YetiBot tap interaction, executed by the firmware itself.
 *
 * `yeti.wasm` is the firmware's `app.h` — the real state machine, the real
 * pomodoro and flappy-bird apps, and all 772 face frames — compiled unmodified.
 * Tap counting, the 400 ms multi-tap window, the 200 ms hold threshold and the
 * 10 s sleep timeout are the firmware's own; this module only feeds it a clock
 * and a touch level, then draws what it asks for.
 */
import { fn, loadWasm, type EmscriptenModule } from "./wasm";

export const YETI_STATES = [
  "DEFAULT",
  "SLEEP_INTRO",
  "SLEEP_LOOP",
  "SLEEP_POP",
  "LOVE",
  "POMODORO",
  "MENU",
  "FLAPPY",
] as const;
export type YetiState = (typeof YETI_STATES)[number];

/** Draw ops emitted by the display shim; mirrors SimDrawOp in Adafruit_GFX.h. */
const OP_CLEAR = 0;
const OP_BITMAP = 1;
const OP_FILLRECT = 2;
const OP_LINE = 3;
const OP_TEXT = 4;
const OP_PRESENT = 5;
const OP_PIXEL = 6;
const OP_RECT = 7;
const OP_CIRCLE = 8;

/** Ints per recorded command; see `struct SimDrawCmd`. */
const CMD_WORDS = 8;

export interface YetiSim {
  readonly width: number;
  readonly height: number;
  readonly tapWindowMs: number;
  readonly holdThresholdMs: number;
  readonly sleepTimeoutMs: number;
  readonly menuItems: string[];

  /** Advance the firmware to `nowMs` and redraw if it produced output. */
  tick(nowMs: number): void;
  /**
   * Press or release the touch pad. Queued rather than applied immediately —
   * see the sub-stepping note on the implementation.
   */
  touch(pressed: boolean): void;

  readonly state: YetiState;
  readonly frame: number;
  readonly menuIndex: number;

  /** 128x64 OLED, rendered at 4x so text stays legible. */
  readonly canvas: HTMLCanvasElement;
  /** Bumped whenever the canvas content changed, so textures update lazily. */
  readonly revision: number;
}

/** Upscale factor. Bitmaps stay pixel-exact via nearest-neighbour blitting. */
const SCALE = 4;
/** Adafruit's classic font advances 6 px per character, 8 px per line. */
const CHAR_W = 6;
const CHAR_H = 8;

/** getContext with the null case handled once, so callers get a live type. */
function context2d(
  canvas: HTMLCanvasElement,
  opts?: CanvasRenderingContext2DSettings,
): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", opts);
  if (!ctx) throw new Error("2d canvas context unavailable");
  return ctx;
}

export async function loadYetiSim(): Promise<YetiSim> {
  const m: EmscriptenModule = await loadWasm("yeti");

  const setup = fn<() => void>(m, "yeti_setup");
  const tickFn = fn<(now: number) => void>(m, "yeti_tick");
  const touchFn = fn<(pressed: number) => void>(m, "yeti_touch");
  const stateFn = fn<() => number>(m, "yeti_state");
  const frameFn = fn<() => number>(m, "yeti_frame");
  const menuIndexFn = fn<() => number>(m, "yeti_menu_index");
  const menuCountFn = fn<() => number>(m, "yeti_menu_count");
  const menuItemFn = fn<(i: number) => number>(m, "yeti_menu_item");
  const cmdsFn = fn<() => number>(m, "yeti_cmds");
  const cmdCountFn = fn<() => number>(m, "yeti_cmd_count");
  const strpoolFn = fn<() => number>(m, "yeti_strpool");

  const W = fn<() => number>(m, "yeti_screen_width")();
  const H = fn<() => number>(m, "yeti_screen_height")();

  setup();

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = context2d(canvas, { alpha: false });
  ctx.imageSmoothingEnabled = false;

  // Scratch surface at native OLED resolution. Frame bitmaps are decoded here
  // then blitted up, which keeps every pixel square and unfiltered.
  const bmpCanvas = document.createElement("canvas");
  bmpCanvas.width = W;
  bmpCanvas.height = H;
  const bmpCtx = context2d(bmpCanvas, { willReadFrequently: true });
  const bmpImage = bmpCtx.createImageData(W, H);

  const ON = "#8ef4ff";
  const OFF = "#050d12";

  /** Firmware iteration granularity while catching up to the frame clock. */
  const STEP_MS = 8;
  /** Bounds the replay after the tab has been hidden for a while. */
  const MAX_CATCHUP_STEPS = 12;

  const touchQueue: boolean[] = [];
  let lastTick = 0;

  const sim = {
    width: W,
    height: H,
    tapWindowMs: fn<() => number>(m, "yeti_tap_window_ms")(),
    holdThresholdMs: fn<() => number>(m, "yeti_hold_threshold_ms")(),
    sleepTimeoutMs: fn<() => number>(m, "yeti_sleep_timeout_ms")(),
    menuItems: Array.from({ length: menuCountFn() }, (_, i) =>
      m.UTF8ToString(menuItemFn(i)),
    ),
    canvas,
    revision: 0,
    state: "DEFAULT" as YetiState,
    frame: 0,
    menuIndex: 0,

    touch(pressed: boolean) {
      touchQueue.push(pressed);
    },

    tick(nowMs: number) {
      const now = Math.round(nowMs);
      if (lastTick === 0) lastTick = now - STEP_MS;

      // Sub-step rather than running one firmware iteration per rendered frame.
      // The firmware samples the touch pin once per iteration, so at frame
      // rates a slow device or a software renderer actually hits, a 70 ms tap
      // can begin and end entirely between two frames and never be seen. This
      // also keeps the 200 ms hold threshold and the 400 ms tap window honest
      // regardless of frame rate.
      //
      // Capped, so returning to a backgrounded tab replays a bounded catch-up
      // instead of thousands of iterations.
      const steps = Math.min(MAX_CATCHUP_STEPS, Math.ceil((now - lastTick) / STEP_MS));
      for (let s = 0; s < steps; s++) {
        const t = s === steps - 1 ? now : lastTick + (s + 1) * STEP_MS;
        // At most one touch transition per sub-step, so every press and every
        // release is observed by at least one firmware iteration.
        if (touchQueue.length) touchFn(touchQueue.shift() ? 1 : 0);
        step(t);
      }
      lastTick = now;
    },
  };

  /** One firmware iteration, plus whatever it drew. */
  function step(t: number) {
    tickFn(t);
    sim.state = YETI_STATES[stateFn()] ?? "DEFAULT";
    sim.frame = frameFn();
    sim.menuIndex = menuIndexFn();

    {
      const n = cmdCountFn();
      if (n === 0) return; // firmware drew nothing this iteration

      // Re-read every tick: the heap views are replaced if WASM memory grows.
      const cmds = new Int32Array(m.HEAP32.buffer, cmdsFn(), n * CMD_WORDS);
      const pool = strpoolFn();
      let dirty = false;

      for (let i = 0; i < n; i++) {
        const o = i * CMD_WORDS;
        const op = cmds[o];
        const a = cmds[o + 1];
        const b = cmds[o + 2];
        const c = cmds[o + 3];
        const d = cmds[o + 4];
        const e = cmds[o + 5];

        switch (op) {
          case OP_CLEAR:
            ctx.fillStyle = OFF;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            dirty = true;
            break;

          case OP_BITMAP: {
            // a,b = x,y  c,d = w,h  e = colour  cmds[o+6] = pointer
            const ptr = cmds[o + 6] >>> 0;
            const stride = (c + 7) >> 3;
            const bytes = m.HEAPU8.subarray(ptr, ptr + stride * d);
            const px = bmpImage.data;
            px.fill(0);
            for (let y = 0; y < d; y++) {
              for (let x = 0; x < c; x++) {
                const bit = (bytes[y * stride + (x >> 3)] >> (7 - (x & 7))) & 1;
                if (!bit) continue;
                const k = (y * W + x) * 4;
                px[k] = 0x8e;
                px[k + 1] = 0xf4;
                px[k + 2] = 0xff;
                px[k + 3] = 255;
              }
            }
            bmpCtx.putImageData(bmpImage, 0, 0);
            ctx.drawImage(bmpCanvas, 0, 0, c, d, a * SCALE, b * SCALE, c * SCALE, d * SCALE);
            dirty = true;
            break;
          }

          case OP_FILLRECT:
            ctx.fillStyle = e ? ON : OFF;
            ctx.fillRect(a * SCALE, b * SCALE, c * SCALE, d * SCALE);
            dirty = true;
            break;

          case OP_RECT:
            ctx.strokeStyle = e ? ON : OFF;
            ctx.lineWidth = SCALE;
            ctx.strokeRect(a * SCALE, b * SCALE, c * SCALE, d * SCALE);
            dirty = true;
            break;

          case OP_LINE:
            ctx.strokeStyle = e ? ON : OFF;
            ctx.lineWidth = SCALE;
            ctx.beginPath();
            ctx.moveTo(a * SCALE, b * SCALE + SCALE / 2);
            ctx.lineTo(c * SCALE + SCALE, d * SCALE + SCALE / 2);
            ctx.stroke();
            dirty = true;
            break;

          case OP_PIXEL:
            ctx.fillStyle = c ? ON : OFF;
            ctx.fillRect(a * SCALE, b * SCALE, SCALE, SCALE);
            dirty = true;
            break;

          case OP_CIRCLE:
            ctx.strokeStyle = cmds[o + 5] ? ON : OFF;
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(a * SCALE, b * SCALE, c * SCALE, 0, Math.PI * 2);
            if (d) ctx.fill();
            else ctx.stroke();
            dirty = true;
            break;

          case OP_TEXT: {
            // a,b = cursor  c = size  d = colour  e = string offset
            const text = m.UTF8ToString(pool + e);
            ctx.fillStyle = d ? ON : OFF;
            ctx.textBaseline = "top";
            ctx.font = `${CHAR_H * c * SCALE - SCALE}px ui-monospace, "DejaVu Sans Mono", monospace`;
            // Placed per character so the advance matches the firmware's
            // 6 px cell exactly; a proportional fallback font would drift.
            for (let k = 0; k < text.length; k++) {
              ctx.fillText(text[k], (a + k * CHAR_W * c) * SCALE, b * SCALE);
            }
            dirty = true;
            break;
          }

          case OP_PRESENT:
          default:
            break;
        }
      }

      if (dirty) sim.revision++;
    }
  }

  // Paint once so the screen is never a blank rectangle before the first draw.
  ctx.fillStyle = OFF;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return sim;
}
