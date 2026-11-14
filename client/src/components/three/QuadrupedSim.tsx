import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { DRACO_PATH } from "@/sim/wasm";
import { Box3, type Group, type Object3D } from "three";
import {
  LEG_IDS,
  SERVO_COUNT,
  coxaChannel,
  femurChannel,
  jointAnglesFor,
  loadGaitSim,
  loadRigInfo,
  sampleAt,
  type GaitCommand,
  type GaitSim,
  type LegId,
  type Recording,
  type RigInfo,
} from "@/sim/gait";

/**
 * The printed quadruped, driven by its own firmware.
 *
 * The GLB carries a rig rebuilt at export time from the Blender assembly:
 * `hip_XX` on the coxa shaft, `knee_XX` on the femur shaft, plus `linkTop_XX`
 * and `footPivot_XX` which together close the four-bar linkage that keeps each
 * foot level as the leg swings. Every joint rotates about its own local Z, so
 * there is no per-joint axis table to keep in sync.
 *
 * Angles come from `gait.wasm` — the firmware's gait tables run through its own
 * interpolator — not from anything transcribed into TypeScript.
 */

/** Nodes the animation writes to, per leg. */
interface LegNodes {
  hip: Object3D;
  knee: Object3D;
  linkTop: Object3D | null;
  footPivot: Object3D | null;
}

export interface QuadrupedSimProps {
  url: string;
  /** null = hold the standing pose. */
  command: GaitCommand | null;
  /** Reports logical angles for the servo read-out, throttled to ~10 Hz. */
  onAngles?: (angles: Float32Array) => void;
  /** Feet are placed on this plane so the model never floats or sinks. */
  groundY?: number;
}

export function QuadrupedSim({
  url,
  command,
  onAngles,
  groundY = -0.95,
}: QuadrupedSimProps) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const invalidate = useThree((s) => s.invalidate);
  const root = useRef<Group>(null);

  const [sim, setSim] = useState<GaitSim | null>(null);
  const [rig, setRig] = useState<RigInfo | null>(null);

  // One instance per mount, so two viewers on a page cannot fight over the
  // shared GLTF cache entry.
  const model = useMemo(() => scene.clone(true), [scene]);

  // Held in a ref, not memoised state: these Object3Ds are written to on every
  // frame, which is exactly what a render-derived value must not be.
  const legs = useRef<Partial<Record<LegId, LegNodes>>>({});
  useEffect(() => {
    const out: Partial<Record<LegId, LegNodes>> = {};
    for (const id of LEG_IDS) {
      const hip = model.getObjectByName(`hip_${id}`);
      const knee = model.getObjectByName(`knee_${id}`);
      if (!hip || !knee) continue;
      out[id] = {
        hip,
        knee,
        linkTop: model.getObjectByName(`linkTop_${id}`) ?? null,
        footPivot: model.getObjectByName(`footPivot_${id}`) ?? null,
      };
    }
    legs.current = out;
  }, [model]);

  // Drop the model so its lowest point rests on the shadow plane. Measured
  // rather than hard-coded: re-exporting with a different stance would
  // otherwise leave it hovering.
  const yOffset = useMemo(() => {
    const box = new Box3().setFromObject(model);
    return groundY - box.min.y;
  }, [model, groundY]);

  useEffect(() => {
    let alive = true;
    Promise.all([loadGaitSim(), loadRigInfo()])
      .then(([g, r]) => {
        if (!alive) return;
        setSim(g);
        setRig(r);
        invalidate();
      })
      .catch((err) => console.error("gait sim unavailable", err));
    return () => {
      alive = false;
    };
  }, [invalidate]);

  // Playback state. Kept in refs: these change every frame and must not
  // re-render React.
  const rec = useRef<Recording | null>(null);
  const startedAt = useRef(0);
  const angles = useRef(new Float32Array(SERVO_COUNT));
  const lastReport = useRef(0);

  // A new command starts a fresh recording. Because the WASM keeps the servo
  // state between calls, the first pose of the next cycle interpolates from
  // wherever the previous one stopped — the same continuity the robot has.
  useEffect(() => {
    if (!sim) return;
    if (!command) {
      rec.current = null;
      return;
    }
    rec.current = sim.run(command);
    startedAt.current = 0;
    invalidate();
  }, [sim, command, invalidate]);

  useFrame(({ clock }) => {
    if (!sim || !rig) return;
    const r = rec.current;

    if (r && r.count > 0) {
      const now = clock.elapsedTime * 1000;
      if (startedAt.current === 0) startedAt.current = now;
      const t = now - startedAt.current;

      if (t >= r.durationMs) {
        // Chain the next cycle. `stop` settles onto a pose and then holds, so
        // it is not repeated.
        if (command && command !== "stop") {
          rec.current = sim.run(command);
          startedAt.current = now;
        } else {
          rec.current = null;
        }
      }
      sampleAt(r, Math.min(t, r.durationMs), angles.current);
      invalidate(); // frameloop is "demand"; keep frames coming while moving
    }

    const a = angles.current;
    for (const id of LEG_IDS) {
      const n = legs.current[id];
      if (!n) continue;
      const { hip, knee } = jointAnglesFor(id, a[coxaChannel(id)], a[femurChannel(id)], rig);
      n.hip.rotation.z = hip;
      n.knee.rotation.z = knee;
      // The link is the second bar of the parallelogram: same rotation, own
      // pivot. The foot is the coupler, so it counter-rotates and stays level.
      if (n.linkTop) n.linkTop.rotation.z = knee;
      if (n.footPivot) n.footPivot.rotation.z = -knee;
    }

    if (onAngles) {
      const now = clock.elapsedTime * 1000;
      if (now - lastReport.current > 100) {
        lastReport.current = now;
        onAngles(a);
      }
    }
  });

  // Standing pose before the WASM finishes loading, so the rig is never shown
  // collapsed.
  useEffect(() => {
    const a = angles.current;
    for (let i = 0; i < 4; i++) a[i] = 90;
    for (let i = 4; i < 8; i++) a[i] = 135;
  }, []);

  return (
    <group ref={root} position={[0, yOffset, 0]} dispose={null}>
      <primitive object={model} />
    </group>
  );
}
