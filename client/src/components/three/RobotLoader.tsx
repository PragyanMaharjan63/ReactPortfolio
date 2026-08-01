
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

/**
 * Shown while the viewer chunk is still in flight.
 *
 * Given a poster — for the robots, a still rendered from the very same model —
 * it shows that rather than an empty box, so the panel has its subject in it
 * from the first paint and the swap to the live canvas is barely visible.
 */
export function RobotViewerSkeleton({ poster }: { poster?: string }) {
  return (
    <div
      className="panel relative flex aspect-square w-full items-center justify-center overflow-hidden"
      role="status"
      aria-live="polite"
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full object-contain p-6"
        />
      ) : (
        <span className="label">Preparing 3D viewer…</span>
      )}
    </div>
  );
}
