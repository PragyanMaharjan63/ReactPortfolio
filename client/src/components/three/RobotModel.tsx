
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { DRACO_PATH } from "@/sim/wasm";
import type { Group } from "three";

/**
 * Loads a real exported asset. Only mounted when a model URL is configured;
 * a load failure propagates to the error boundary in RobotViewer, which
 * swaps in the poster image.
 */
export function GLTFRobot({ url }: { url: string }) {
  // DRACO_PATH is not optional: the models are Draco-compressed, and without a
  // decoder path drei reaches for a Google CDN, which fails silently into the
  // poster fallback. That is what broke the model on the landing page.
  const { scene } = useGLTF(url, DRACO_PATH);
  return <primitive object={scene} />;
}

/**
 * Procedural stand-in for YetiBot, modelled from the project's own photographs:
 * a white 3D-printed shell, a blue printed bezel, and a dark inset display.
 *
 * This is explicitly a *visual reconstruction* — proportions are approximate
 * and it carries no dimensional authority. The UI labels it as such. Replace
 * it by exporting the real CAD to public/models/yetibot.glb and setting
 * `model` on the project record.
 */
export function ReconstructedYetiBot({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);
  const invalidate = useThree((s) => s.invalidate);

  useFrame((state) => {
    if (!animate || !group.current) return;
    // A slow idle sway. `invalidate` is required because the canvas runs on
    // demand rather than rendering every frame unconditionally.
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.22;
    invalidate();
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      {/* Body. Radius drives every other offset below — the display assembly
          has to sit proud of this surface or it z-fights inside the shell. */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]} scale={[1, 1, 0.9]}>
        <capsuleGeometry args={[0.82, 0.42, 8, 32]} />
        <meshStandardMaterial color="#f2f4f7" roughness={0.72} metalness={0.02} />
      </mesh>

      {/* Crown tufts */}
      {[-0.34, 0, 0.34].map((x, i) => (
        <mesh key={x} position={[x, 1.05 - Math.abs(x) * 0.16, -0.04]}>
          <coneGeometry args={[0.15 - i * 0.01, 0.3, 16]} />
          <meshStandardMaterial color="#f2f4f7" roughness={0.72} />
        </mesh>
      ))}

      {/* Ears — partially embedded by design */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.24, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
          <sphereGeometry args={[0.2, 20, 16]} />
          <meshStandardMaterial color="#eef1f5" roughness={0.75} />
        </mesh>
      ))}

      {/* Display bezel. Sized so its front corners sit on the 0.82 shell
          radius — any wider and they break the silhouette when rotated. */}
      <mesh position={[0, 0.16, 0.76]}>
        <boxGeometry args={[0.9, 0.62, 0.12]} />
        <meshStandardMaterial color="#2438c8" roughness={0.45} metalness={0.06} />
      </mesh>

      {/* Screen, inset into the bezel */}
      <mesh position={[0, 0.16, 0.825]}>
        <boxGeometry args={[0.72, 0.42, 0.03]} />
        <meshStandardMaterial color="#04060a" roughness={0.25} />
      </mesh>

      {/* Pixel face matching the photographed expression: two eyes, one mouth */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.21, 0.843]}>
          <boxGeometry args={[0.13, 0.13, 0.01]} />
          <meshStandardMaterial
            color="#65e6ff"
            emissive="#65e6ff"
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0.843]}>
        <boxGeometry args={[0.11, 0.032, 0.01]} />
        <meshStandardMaterial
          color="#65e6ff"
          emissive="#65e6ff"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, -0.63, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.14, 32]} />
        <meshStandardMaterial color="#e7eaef" roughness={0.8} />
      </mesh>
    </group>
  );
}
