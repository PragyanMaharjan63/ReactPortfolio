import { useRef } from "react";
import type { Group } from "three";

/**
 * Quadruped joint rig, on the miniKame / Kame32 layout: four legs, two servos
 * each — a hip (coxa, rotates about Z, swings the leg fore/aft) and a knee
 * (femur/tibia, rotates about Z, extends the lower link).
 *
 * The purpose of this file is the *rig*, not the styling. Every joint group is
 * named to match SERVO_MAP below, so when the real Bambu Studio export lands
 * the same names drive it and nothing downstream changes. Those names are also
 * the contract a future PlatformIO importer writes angles into.
 *
 * See client/public/models/QUADRUPED_MODEL.md for the full component map.
 */

/** Servo index -> rig node. Indices follow the usual miniKame channel order. */
export const SERVO_MAP = [
  { index: 0, node: "hip_FL", joint: "hip", leg: "FL" },
  { index: 1, node: "knee_FL", joint: "knee", leg: "FL" },
  { index: 2, node: "hip_FR", joint: "hip", leg: "FR" },
  { index: 3, node: "knee_FR", joint: "knee", leg: "FR" },
  { index: 4, node: "hip_BL", joint: "hip", leg: "BL" },
  { index: 5, node: "knee_BL", joint: "knee", leg: "BL" },
  { index: 6, node: "hip_BR", joint: "hip", leg: "BR" },
  { index: 7, node: "knee_BR", joint: "knee", leg: "BR" },
] as const;

export type LegId = "FL" | "FR" | "BL" | "BR";

/** x/z offsets of each hip from body centre, and which way the leg faces. */
const LEGS: { id: LegId; x: number; z: number; dir: 1 | -1 }[] = [
  { id: "FL", x: -0.62, z: 0.46, dir: 1 },
  { id: "FR", x: 0.62, z: 0.46, dir: 1 },
  { id: "BL", x: -0.62, z: -0.46, dir: -1 },
  { id: "BR", x: 0.62, z: -0.46, dir: -1 },
];

const BODY = "#d8dde4";
const JOINT = "#1b2029";
const ACCENT = "#65e6ff";

function Leg({ x, z, dir, id }: { x: number; z: number; dir: 1 | -1; id: LegId }) {
  const hip = useRef<Group>(null);
  const knee = useRef<Group>(null);

  return (
    // Hip pivot — a servo horn rotating the whole leg fore/aft.
    <group ref={hip} name={`hip_${id}`} position={[x, 0, z]}>
      {/* Hip servo body */}
      <mesh position={[dir * 0.06, 0, 0]}>
        <boxGeometry args={[0.26, 0.22, 0.24]} />
        <meshStandardMaterial color={JOINT} roughness={0.55} />
      </mesh>
      {/* Horn marker: makes the rotation axis legible while debugging a gait */}
      <mesh position={[dir * 0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.35} />
      </mesh>

      {/* Upper link (coxa -> knee) */}
      <mesh position={[dir * 0.3, -0.12, 0]}>
        <boxGeometry args={[0.5, 0.11, 0.13]} />
        <meshStandardMaterial color={BODY} roughness={0.7} />
      </mesh>

      {/* Knee pivot */}
      <group ref={knee} name={`knee_${id}`} position={[dir * 0.54, -0.16, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color={JOINT} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.02, 0.11]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.35} />
        </mesh>

        {/* Lower link (tibia) */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.11, 0.52, 0.11]} />
          <meshStandardMaterial color={BODY} roughness={0.7} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.58, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.07, 16]} />
          <meshStandardMaterial color={JOINT} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

export function QuadrupedRig() {
  return (
    <group name="quadruped_root" position={[0, 0.42, 0]} scale={1.35}>
      {/* Chassis plate */}
      <mesh name="body" castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.16, 1.0]} />
        <meshStandardMaterial color={BODY} roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Controller board sitting on top — ESP32 in the real build */}
      <mesh name="controller" position={[0, 0.13, -0.06]}>
        <boxGeometry args={[0.46, 0.08, 0.3]} />
        <meshStandardMaterial color="#12331f" roughness={0.6} />
      </mesh>

      {LEGS.map((leg) => (
        <Leg key={leg.id} id={leg.id} x={leg.x} z={leg.z} dir={leg.dir} />
      ))}
    </group>
  );
}
