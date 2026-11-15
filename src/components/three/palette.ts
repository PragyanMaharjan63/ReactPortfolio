import { Color, type Material, type Mesh, type Object3D } from "three";

/** Robot accent colours, matched to the site's violet → rose palette. */
export const ROBOT_ACCENT = "#8f6ff2";
export const ROBOT_GLOW = "#f0b8ff";

const tinted = new WeakSet<Material>();
const hsl = { h: 0, s: 0, l: 0 };

/**
 * The exported .glb files carry the original cobalt plastic (bezel_blue,
 * chassis_blue). Recolour any saturated blue material to the site accent so
 * the robots sit in the palette without re-exporting from Blender.
 * Materials are shared between clones, so each is only touched once.
 */
export function tintAccentMaterials(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (tinted.has(material)) continue;
      tinted.add(material);
      const color = (material as Material & { color?: unknown }).color;
      if (!(color instanceof Color)) continue;
      color.getHSL(hsl);
      if (hsl.s > 0.3 && hsl.h > 0.53 && hsl.h < 0.72) color.set(ROBOT_ACCENT);
    }
  });
}
