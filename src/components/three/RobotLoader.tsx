
import { Html, useProgress } from "@react-three/drei";

/** In-canvas loading indicator, driven by drei's suspense progress. */
export function RobotLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-2 text-center"
      >
        <div className="h-px w-24 overflow-hidden bg-line">
          <div
            className="h-full bg-accent transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="label">Loading model {Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

