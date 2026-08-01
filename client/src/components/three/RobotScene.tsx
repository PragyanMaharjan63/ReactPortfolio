
import { Suspense, useEffect } from "react";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { GLTFRobot, ReconstructedYetiBot } from "./RobotModel";
import { QuadrupedRig } from "./QuadrupedModel";
import { QuadrupedSim } from "./QuadrupedSim";
import { YetiBotSim } from "./YetiBotSim";
import { RobotLoader } from "./RobotLoader";
import type { GaitCommand } from "@/sim/gait";
import type { YetiState } from "@/sim/yeti";

export type RigKind = "yetibot" | "quadruped";

export interface SceneProps {
  modelUrl?: string;
  rig?: RigKind;
  animate: boolean;
  allowZoom?: boolean;
  /**
   * Drive the model from the firmware compiled to WASM rather than showing it
   * as a static prop. Only meaningful when a .glb is configured, since the
   * procedural fallbacks have no rig to drive.
   */
  simulate?: boolean;
  command?: GaitCommand | null;
  onAngles?: (angles: Float32Array) => void;
  onYetiState?: (state: YetiState, frame: number) => void;
  /** Fired once the model is in the scene, so the poster can be dropped. */
  onReady?: () => void;
}

/**
 * Reports mount from *inside* Suspense. Rendering it as a sibling of the model
 * means it only mounts once the model's fetch and decode have resolved, which
 * is the moment the panel actually has something to show.
 */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

/**
 * Scene contents only — the <Canvas> itself lives in RobotViewer so this file
 * stays free of DOM concerns and can be reused by other viewers.
 */
export function RobotScene({
  modelUrl,
  rig = "yetibot",
  animate,
  allowZoom = true,
  simulate = false,
  command = null,
  onAngles,
  onYetiState,
  onReady,
}: SceneProps) {
  const simulating = simulate && Boolean(modelUrl);

  return (
    <>
      {/* Three lights is enough for a matte plastic shell; more would cost
          frame time without changing the read. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.5} castShadow />
      {/* Neutral fill, not a coloured rim — the palette stays matte. */}
      <directionalLight position={[-5, 2, -3]} intensity={0.45} color="#ffffff" />

      <Suspense fallback={<RobotLoader />}>
        {simulating && modelUrl ? (
          rig === "quadruped" ? (
            <QuadrupedSim url={modelUrl} command={command} onAngles={onAngles} />
          ) : (
            <YetiBotSim url={modelUrl} running={animate} onState={onYetiState} />
          )
        ) : modelUrl ? (
          <GLTFRobot url={modelUrl} />
        ) : rig === "quadruped" ? (
          <QuadrupedRig />
        ) : (
          <ReconstructedYetiBot animate={animate} />
        )}
        <ReadySignal onReady={onReady} />
        <ContactShadows
          position={[0, -0.95, 0]}
          opacity={0.45}
          scale={6}
          blur={2.6}
          far={2}
        />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={allowZoom}
        minDistance={rig === "quadruped" ? 4 : 2.6}
        maxDistance={rig === "quadruped" ? 11 : 6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        // Spinning the camera while the robot is walking makes the gait
        // impossible to read, so the turntable yields to the simulation.
        autoRotate={animate && rig === "quadruped" && !(simulating && command)}
        autoRotateSpeed={0.5}
        // Damping needs continuous frames while the user is interacting;
        // OrbitControls calls invalidate() itself under frameloop="demand".
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}
