import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  CornerDownRight,
  Square,
} from "lucide-react";
import type { GaitCommand } from "@/sim/gait";
import type { YetiState } from "@/sim/yeti";

/**
 * Controls for the firmware-driven simulations.
 *
 * The quadruped exposes exactly the four gaits walk.cpp implements plus its
 * stop, and nothing else — inventing a control the firmware does not have would
 * make the simulation a lie about the robot.
 */

const GAITS: { cmd: GaitCommand; label: string; Icon: typeof ArrowUp }[] = [
  { cmd: "forward", label: "Forward", Icon: ArrowUp },
  { cmd: "backward", label: "Back", Icon: ArrowDown },
  { cmd: "left", label: "Turn left", Icon: CornerDownLeft },
  { cmd: "right", label: "Turn right", Icon: CornerDownRight },
];

export function GaitControls({
  command,
  onCommand,
  angles,
  servoNames,
}: {
  command: GaitCommand | null;
  onCommand: (cmd: GaitCommand | null) => void;
  angles: Float32Array | null;
  servoNames: string[];
}) {
  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {GAITS.map(({ cmd, label, Icon }) => {
          const active = command === cmd;
          return (
            <button
              key={cmd}
              type="button"
              onClick={() => onCommand(active ? null : cmd)}
              aria-pressed={active}
              className={`btn min-h-10 gap-2 px-3 ${active ? "btn-primary" : "btn-secondary"}`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onCommand("stop")}
          className="btn btn-secondary min-h-10 gap-2 px-3"
        >
          <Square className="size-4" aria-hidden="true" />
          Stop
        </button>
      </div>

      {angles && (
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4"
          aria-live="off"
        >
          {servoNames.map((name, i) => (
            <div key={name} className="flex items-baseline justify-between gap-2">
              <span className="label truncate">{name}</span>
              <span className="font-mono text-sm tabular-nums text-secondary">
                {Math.round(angles[i])}°
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="label">
        Angles come from the firmware’s own gait tables, run through its 8-step
        interpolator at 25 ms per step.
      </p>
    </div>
  );
}

const STATE_LABEL: Record<YetiState, string> = {
  DEFAULT: "Idle — showing expressions",
  SLEEP_INTRO: "Falling asleep",
  SLEEP_LOOP: "Asleep",
  SLEEP_POP: "Waking up",
  LOVE: "Love",
  POMODORO: "Pomodoro timer",
  MENU: "Menu",
  FLAPPY: "Flappy Bird",
};

export function TapControls({
  state,
  frame,
  tapWindowMs,
  holdThresholdMs,
  sleepTimeoutMs,
}: {
  state: YetiState | null;
  frame: number;
  tapWindowMs: number;
  holdThresholdMs: number;
  sleepTimeoutMs: number;
}) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="label">State</span>
        <span className="font-mono text-sm text-secondary">
          {state ? STATE_LABEL[state] : "starting…"}
        </span>
        <span className="label ml-auto font-mono">frame {frame}</span>
      </div>
      <p className="text-sm text-secondary">
        Tap the top of the head. One tap steps through the menu, two open the
        highlighted item, three open the menu from anywhere, and holding for{" "}
        {holdThresholdMs} ms triggers the hold gesture. Taps within{" "}
        {tapWindowMs} ms count as one gesture; after{" "}
        {Math.round(sleepTimeoutMs / 1000)} s of no input it falls asleep.
      </p>
    </div>
  );
}
