/**
 * Quadruped gait, executed by the firmware itself.
 *
 * `gait.wasm` is `lib/Walk/walk.cpp` and `lib/servo_calibration/ServoConfig.cpp`
 * compiled unmodified. Asking it to walk runs the real gait tables through the
 * real 8-step / 25 ms interpolator and returns the exact sequence of angles the
 * servos would be commanded to hold. Nothing here re-implements the gait; this
 * module only plays the recording back on the browser's clock.
 */
import { fn, loadWasm, type EmscriptenModule } from "./wasm";

export const GAIT_COMMANDS = ["forward", "backward", "left", "right", "stop"] as const;
export type GaitCommand = (typeof GAIT_COMMANDS)[number];

export const SERVO_COUNT = 8;

/** Channel order is ServoConfig.cpp's: four coxa, then four femur. */
export const LEG_IDS = ["FL", "FR", "BL", "BR"] as const;
export type LegId = (typeof LEG_IDS)[number];

export interface ServoInfo {
  index: number;
  name: string;
  pin: number;
  inverted: boolean;
}

export interface Recording {
  /** Pose timestamps in ms, one per row. */
  times: Int32Array;
  /** Logical angles, SERVO_COUNT per row, row-major. */
  angles: Int32Array;
  count: number;
  durationMs: number;
}

export interface GaitSim {
  servos: ServoInfo[];
  /** Run one cycle. Continues from the pose the previous call ended on. */
  run(cmd: GaitCommand): Recording;
  /** Return to the firmware's standing pose (coxa 90, femur 135). */
  reset(): void;
}

export async function loadGaitSim(): Promise<GaitSim> {
  const m: EmscriptenModule = await loadWasm("gait");

  const init = fn<() => void>(m, "gait_init");
  const reset = fn<() => void>(m, "gait_reset");
  const run = fn<(cmd: number) => number>(m, "gait_run");
  const data = fn<() => number>(m, "gait_data");
  const stride = fn<() => number>(m, "gait_stride");
  const duration = fn<() => number>(m, "gait_duration_ms");
  const pin = fn<(i: number) => number>(m, "gait_pin");
  const name = fn<(i: number) => number>(m, "gait_name");
  const inverted = fn<(i: number) => number>(m, "gait_is_inverted");

  init();

  const servos: ServoInfo[] = Array.from({ length: SERVO_COUNT }, (_, i) => ({
    index: i,
    name: m.UTF8ToString(name(i)),
    pin: pin(i),
    inverted: inverted(i) === 1,
  }));

  return {
    servos,
    reset,
    run(cmd) {
      const count = run(GAIT_COMMANDS.indexOf(cmd));
      const s = stride();
      // Copy out: HEAP32 is detached and replaced whenever WASM memory grows,
      // so a view held across another call can silently point at freed bytes.
      const raw = new Int32Array(m.HEAP32.buffer, data(), count * s);
      const times = new Int32Array(count);
      const angles = new Int32Array(count * SERVO_COUNT);
      for (let i = 0; i < count; i++) {
        times[i] = raw[i * s];
        for (let j = 0; j < SERVO_COUNT; j++) angles[i * SERVO_COUNT + j] = raw[i * s + 1 + j];
      }
      return { times, angles, count, durationMs: duration() };
    },
  };
}

/**
 * Logical angles at time `t` (ms) into a recording, linearly interpolated
 * between the 25 ms pose steps so motion reads as continuous rather than
 * stepping at 40 Hz.
 */
export function sampleAt(rec: Recording, t: number, out: Float32Array): void {
  if (rec.count === 0) return;
  if (rec.count === 1 || t <= rec.times[0]) {
    for (let j = 0; j < SERVO_COUNT; j++) out[j] = rec.angles[j];
    return;
  }

  // Poses are evenly spaced, so the index is arithmetic rather than a search.
  const step = (rec.times[rec.count - 1] - rec.times[0]) / (rec.count - 1) || 1;
  const pos = (t - rec.times[0]) / step;
  const i = Math.min(rec.count - 2, Math.max(0, Math.floor(pos)));
  const f = Math.min(1, Math.max(0, pos - i));

  const a = i * SERVO_COUNT;
  const b = (i + 1) * SERVO_COUNT;
  for (let j = 0; j < SERVO_COUNT; j++) {
    out[j] = rec.angles[a + j] + (rec.angles[b + j] - rec.angles[a + j]) * f;
  }
}

// --- mapping logical angles onto the 3D rig ---------------------------------

/**
 * Per-leg sign conventions measured from the Blender assembly at export time
 * and shipped in `quadruped.rig.json`. See scripts/blender/export_rigged_glb.py.
 */
export interface RigLeg {
  hipPlusIsForward: 1 | -1;
  kneePlusIsUp: 1 | -1;
}
export type RigInfo = Record<LegId, RigLeg>;

export async function loadRigInfo(url = "/models/quadruped.rig.json"): Promise<RigInfo> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`rig sidecar ${res.status}`);
  const json = (await res.json()) as { rig: { legs: RigInfo } };
  return json.rig.legs;
}

/** Firmware home pose: coxa centred, femur planted. */
export const COXA_HOME = 90;
export const FEMUR_HOME = 135;

/**
 * The gait table is written in *logical* angles, and the rear coxa pair is
 * mirrored relative to the front pair — walk.cpp says so directly, with
 * LEG_FRONT_COXA = {135,135,45,45} against LEG_BACK_COXA = {45,45,135,135}.
 * So "above 90" means forward for a front leg and backward for a rear one.
 */
const IS_FRONT: Record<LegId, boolean> = { FL: true, FR: true, BL: false, BR: false };

const DEG = Math.PI / 180;

export interface JointAngles {
  /** Radians about the joint node's local Z. */
  hip: number;
  knee: number;
}

export function jointAnglesFor(
  leg: LegId,
  coxaLogical: number,
  femurLogical: number,
  rig: RigInfo,
): JointAngles {
  const r = rig[leg];
  const forward = (coxaLogical - COXA_HOME) * (IS_FRONT[leg] ? 1 : -1);
  const up = FEMUR_HOME - femurLogical;
  return {
    hip: forward * r.hipPlusIsForward * DEG,
    knee: up * r.kneePlusIsUp * DEG,
  };
}

/** Channel index for a leg's coxa / femur, matching ServoConfig.cpp. */
export const coxaChannel = (leg: LegId) => LEG_IDS.indexOf(leg);
export const femurChannel = (leg: LegId) => 4 + LEG_IDS.indexOf(leg);
