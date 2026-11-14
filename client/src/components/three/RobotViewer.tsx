
import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { RobotScene } from "./RobotScene";
import { RobotFallback } from "./RobotFallback";
import { ViewerControls } from "./ViewerControls";
import { GaitControls, TapControls } from "./SimControls";
import { useGLTF } from "@react-three/drei";
import { DRACO_PATH } from "@/sim/wasm";
import type { ModelType } from "@/data/projects";
import type { RigKind } from "./RobotScene";
import type { GaitCommand } from "@/sim/gait";
import type { YetiState } from "@/sim/yeti";

/** Channel order is ServoConfig.cpp's: four coxa, then four femur. */
const SERVO_NAMES = [
  "FL Coxa", "FR Coxa", "BL Coxa", "BR Coxa",
  "FL Femur", "FR Femur", "BL Femur", "BR Femur",
];

/** Catches GLTF load failures and anything else thrown inside the canvas. */
class ViewerErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const supportsWebGL = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
};

export interface RobotViewerProps {
  modelUrl?: string;
  /** Which built-in rig to show when no .glb is configured. */
  rig?: RigKind;
  modelType?: ModelType;
  poster: string;
  posterAlt: string;
  /** Read by screen readers in place of the canvas. */
  description: string;
  /** Drive the model from the firmware compiled to WebAssembly. */
  simulate?: boolean;
}

export default function RobotViewer({
  modelUrl,
  rig = "yetibot",
  modelType = "visual-reconstruction",
  poster,
  posterAlt,
  description,
  simulate = false,
}: RobotViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  // Both are computed once during the initial render rather than in an effect:
  // they are synchronous browser capability reads, and deferring them would
  // flash the wrong UI for a frame.
  const [webgl] = useState(supportsWebGL);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [resetKey, setResetKey] = useState(0);

  // Subscribe to later changes only; the initial value is already in state.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) setPlaying(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Only mount the canvas once the section is near the viewport, so the WebGL
  // context is never paid for above the fold. The margin is generous: by the
  // time this component is running, the three.js chunk has already been
  // fetched, and the remaining work — model download plus Draco decode — is
  // what the viewer waits on, so it should start well before the panel is
  // actually on screen.
  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { rootMargin: "900px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Start the model download and the decoder fetch as soon as this chunk is
  // alive, rather than waiting for the canvas to mount. DRACOLoader only
  // requests its decoder once a compressed mesh needs one, so without this the
  // two are strictly sequential and the decoder's round trip is dead time.
  useEffect(() => {
    if (!modelUrl) return;
    useGLTF.preload(modelUrl, DRACO_PATH);
  }, [modelUrl]);

  // Stop burning frames when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Flipped by the scene once the model has actually been added to it, which
  // is later than "chunk loaded" and later than Suspense resolving the fetch.
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  const handleReset = useCallback(() => {
    setReady(false);
    setResetKey((k) => k + 1);
  }, []);

  // Simulation state. Angles arrive ~10x a second from inside the canvas, so
  // they are held in a ref and mirrored into state on a tick the UI can absorb.
  const [command, setCommand] = useState<GaitCommand | null>(null);
  const [angles, setAngles] = useState<Float32Array | null>(null);
  const [yeti, setYeti] = useState<{ state: YetiState; frame: number } | null>(null);

  const handleAngles = useCallback((a: Float32Array) => setAngles(a.slice()), []);
  const handleYetiState = useCallback(
    (state: YetiState, frame: number) =>
      setYeti((prev) =>
        prev && prev.state === state && prev.frame === frame ? prev : { state, frame },
      ),
    [],
  );

  const simulating = simulate && Boolean(modelUrl);

  const fallback = (
    <RobotFallback
      poster={poster}
      alt={posterAlt}
      reason="3D viewer unavailable — showing a project photograph."
    />
  );

  if (!webgl) return fallback;

  return (
    <figure className="m-0">
      <div
        ref={hostRef}
        className="panel relative aspect-square w-full overflow-hidden"
      >
        {inView ? (
          <ViewerErrorBoundary fallback={fallback}>
            <Canvas
              key={resetKey}
              // Demand rendering: frames are produced on interaction or an
              // explicit invalidate(), not continuously.
              frameloop="demand"
              shadows
              dpr={[1, 1.75]}
              // The quadruped is far wider than it is tall, so it needs a
              // longer lens distance than the YetiBot to frame without clipping.
              camera={{
                position: rig === "quadruped" ? [0, 0.8, 5.6] : [0, 0.5, 4],
                fov: 42,
              }}
              gl={{ antialias: true, powerPreference: "high-performance" }}
              // The canvas is decorative; the text below carries the meaning.
              aria-hidden="true"
            >
              <RobotScene
                modelUrl={modelUrl}
                rig={rig}
                animate={playing && !reducedMotion}
                allowZoom
                simulate={simulating}
                command={command}
                onAngles={handleAngles}
                onYetiState={handleYetiState}
                onReady={handleReady}
              />
            </Canvas>
          </ViewerErrorBoundary>
        ) : null}

        {/* The same model, pre-rendered. Shown from the first paint and faded
            out once the real one is on screen, so the panel is never an empty
            box while ~250 KB of mesh and decoder come down the wire. It is
            decorative here: the canvas replaces it, and the caption carries
            the meaning. */}
        {!ready && (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-contain p-6"
          />
        )}

        {inView && (
          <ViewerControls
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            onReset={handleReset}
          />
        )}
      </div>

      {inView && simulating && rig === "quadruped" && (
        <GaitControls
          command={command}
          onCommand={setCommand}
          angles={angles}
          servoNames={SERVO_NAMES}
        />
      )}

      {inView && simulating && rig === "yetibot" && (
        <TapControls
          state={yeti?.state ?? null}
          frame={yeti?.frame ?? 0}
          tapWindowMs={400}
          holdThresholdMs={200}
          sleepTimeoutMs={10000}
        />
      )}

      <figcaption className="mt-3 space-y-1">
        <p className="text-sm text-secondary">{description}</p>
        {modelType === "visual-reconstruction" && (
          <p className="label">
            Interactive visual reconstruction based on project media
          </p>
        )}
        {modelType === "placeholder" && (
          <p className="label">Joint rig — awaiting the printed model export</p>
        )}
      </figcaption>
    </figure>
  );
}
