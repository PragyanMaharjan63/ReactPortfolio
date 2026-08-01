import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { DRACO_PATH } from "@/sim/wasm";
import {
  Box3,
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
  type Object3D,
} from "three";
import { loadYetiSim, type YetiSim, type YetiState } from "@/sim/yeti";

/**
 * The printed YetiBot, driven by its own firmware.
 *
 * `yeti.wasm` is the firmware's state machine, so tapping the head here counts
 * taps through the same 400 ms window, the same 200 ms hold threshold and the
 * same 10 s sleep timeout the real robot uses, and the OLED shows the real
 * 128x64 frames read straight out of WASM memory.
 */

export interface YetiBotSimProps {
  url: string;
  /** Pause ticking when the viewer is paused or off-screen. */
  running?: boolean;
  onState?: (state: YetiState, frame: number) => void;
  groundY?: number;
}

/** Low-opacity "TAP HERE" disc that sits on top of the head. */
function makeTapTexture(): CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;

  ctx.clearRect(0, 0, S, S);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 45px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("TAP", S / 2, S / 2 - 24);
  ctx.fillText("HERE", S / 2, S / 2 + 24);

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  return tex;
}

export function YetiBotSim({
  url,
  running = true,
  onState,
  groundY = -0.95,
}: YetiBotSimProps) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const invalidate = useThree((s) => s.invalidate);
  const [sim, setSim] = useState<YetiSim | null>(null);

  const model = useMemo(() => scene.clone(true), [scene]);
  const [tapTexture] = useState(makeTapTexture);

  // Drop the model so it rests on the shadow plane, and find the crown of the
  // head. The exporter emits a `head_top` node for exactly this, so the marker
  // tracks the model instead of a hard-coded offset.
  const placement = useMemo(() => {
    const box = new Box3().setFromObject(model);
    const centre = box.getCenter(new Vector3());
    const node = model.getObjectByName("head_top");
    const p = new Vector3();
    if (node) node.getWorldPosition(p);
    else p.set(centre.x, box.max.y, centre.z);

    // Turn the robot to face the camera. Which way "forward" is depends on how
    // the shell was oriented in Blender, so it is read off the screen's
    // position rather than assumed: the camera looks down -Z from +Z, and the
    // display should be the side pointing at it.
    const screen = model.getObjectByName("screen");
    let faceYaw = 0;
    if (screen) {
      const s = new Vector3();
      screen.getWorldPosition(s);
      faceYaw = Math.atan2(s.x - centre.x, s.z - centre.z);
    }

    return {
      yOffset: groundY - box.min.y,
      head: [p.x, p.y, p.z] as [number, number, number],
      faceYaw,
    };
  }, [model, groundY]);

  // Mount the OLED as a child of the `screen` node so it inherits that node's
  // transform. The screen mesh is a thin box whose UVs come from a generic
  // unwrap, so rather than trusting them a correctly-sized quad is placed on
  // its outward face, derived from the mesh's own bounding box.
  const screenTexture = useRef<CanvasTexture | null>(null);
  useEffect(() => {
    if (!sim) return;
    const node = model.getObjectByName("screen");
    if (!(node instanceof Mesh)) return;

    node.geometry.computeBoundingBox();
    const bb = node.geometry.boundingBox!;
    const size = bb.getSize(new Vector3());
    const centre = bb.getCenter(new Vector3());

    // The thinnest local axis is the panel normal.
    const axes = [size.x, size.y, size.z];
    const thin = axes.indexOf(Math.min(...axes));
    const [w, h] = [0, 1, 2].filter((i) => i !== thin).map((i) => axes[i]);

    // Face away from the body, whichever side of the panel that is.
    const bodyCentre = new Box3().setFromObject(model).getCenter(new Vector3());
    const worldCentre = node.localToWorld(centre.clone());
    const normal = new Vector3().setComponent(thin, 1);
    const worldNormal = normal.clone().transformDirection(node.matrixWorld);
    const outward = worldNormal.dot(worldCentre.sub(bodyCentre)) >= 0 ? 1 : -1;

    const tex = new CanvasTexture(sim.canvas);
    tex.magFilter = NearestFilter; // keep the OLED grid crisp, not smeared
    tex.minFilter = LinearFilter;
    tex.colorSpace = SRGBColorSpace;
    screenTexture.current = tex;

    // Fit the panel to the OLED's own 2:1 aspect rather than the printed
    // pocket's 1.48:1. Stretching to the pocket squashed the glyphs and pushed
    // the header and the hint line behind the bezel lip.
    const oledAspect = sim.width / sim.height;
    let qw = w;
    let qh = w / oledAspect;
    if (qh > h) {
      qh = h;
      qw = h * oledAspect;
    }

    const quad = new Mesh(
      new PlaneGeometry(qw, qh),
      new MeshBasicMaterial({ map: tex, toneMapped: false, side: DoubleSide }),
    );
    quad.name = "screen_oled";
    quad.position.copy(centre);
    // Lift clear of the panel so it never z-fights with the printed bezel.
    quad.position.setComponent(thin, centre.getComponent(thin) + outward * (axes[thin] / 2 + 0.05));
    if (thin === 0) quad.rotation.y = (outward > 0 ? 1 : -1) * Math.PI / 2;
    else if (thin === 1) quad.rotation.x = (outward > 0 ? -1 : 1) * Math.PI / 2;
    else if (outward < 0) quad.rotation.y = Math.PI;

    // Blender's exporter decomposed this node's transform as a 180° rotation
    // with scale (-1,-1,-1) — a net reflection. Anything parented under it is
    // mirrored, which renders the menu text back-to-front. Cancel it with a
    // second reflection so the determinant comes out positive again.
    if (node.matrixWorld.determinant() < 0) quad.scale.x = -1;

    node.add(quad);
    invalidate();

    return () => {
      node.remove(quad);
      quad.geometry.dispose();
      (quad.material as MeshBasicMaterial).dispose();
      tex.dispose();
      screenTexture.current = null;
    };
  }, [sim, model, invalidate]);

  useEffect(() => {
    let alive = true;
    loadYetiSim()
      .then((s) => {
        if (!alive) return;
        setSim(s);
        invalidate();
      })
      .catch((err: unknown) => console.error("yeti sim unavailable", err));
    return () => {
      alive = false;
    };
  }, [invalidate]);

  const t0 = useRef(0);
  const lastRevision = useRef(-1);
  const pulse = useRef<Object3D>(null);
  const touched = useRef(false);

  useFrame(({ clock, camera }) => {
    const now = clock.elapsedTime * 1000;
    if (sim) {
      if (t0.current === 0) t0.current = now;
      if (running) {
        sim.tick(now - t0.current);
        const tex = screenTexture.current;
        if (tex && sim.revision !== lastRevision.current) {
          lastRevision.current = sim.revision;
          tex.needsUpdate = true;
        }
        onState?.(sim.state, sim.frame);
        invalidate();
      }
    }

    if (pulse.current) {
      // Breathe slowly, so the marker reads as an affordance rather than an alert.
      const k = 1 + Math.sin(now / 520) * 0.06;
      pulse.current.scale.setScalar(touched.current ? 0.9 : k);
      // Billboard it. Lying flat on the crown would be the literal reading of
      // "on top of the head", but the default camera looks at the robot almost
      // horizontally, which puts a flat marker edge-on and invisible. Facing
      // the viewer keeps it legible from every orbit angle.
      //
      // lookAt, not a copy of the camera's quaternion: this group sits under a
      // parent yawed to face the robot forwards, and a world-space quaternion
      // written into a local one there points the marker backwards.
      pulse.current.lookAt(camera.position);
    }
  });

  // A press anywhere on the shell counts: the real sensor is the shell surface,
  // and making someone hunt for an exact spot with a mouse would be worse.
  const press = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (touched.current) return;
    touched.current = true;
    sim?.touch(true);
    invalidate();
  };

  useEffect(() => {
    // A release outside the canvas must still lift the finger, or the firmware
    // sees a hold that never ends.
    const release = () => {
      if (!touched.current) return;
      touched.current = false;
      sim?.touch(false);
      invalidate();
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [sim, invalidate]);

  useEffect(() => () => tapTexture.dispose(), [tapTexture]);

  return (
    <group
      position={[0, placement.yOffset, 0]}
      rotation={[0, placement.faceYaw, 0]}
      dispose={null}
    >
      <group onPointerDown={press}>
        <primitive object={model} />
      </group>

      {/* "TAP HERE", lying flat on the crown of the head. */}
      <group
        ref={pulse}
        position={[placement.head[0], placement.head[1] + 0.19, placement.head[2]]}
        onPointerDown={press}
      >
        <mesh>
          <planeGeometry args={[0.62, 0.62]} />
          <meshBasicMaterial
            map={tapTexture}
            transparent
            opacity={0.28}
            depthWrite={false}
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
