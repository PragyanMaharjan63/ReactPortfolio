"""
Exports the currently-open .blend to a web-ready GLB.

Run against a saved .blend:
  blender -b scripts/blender/quadruped.blend \
    --python scripts/blender/export_glb.py -- client/public/models/quadruped.glb

What it does:
  - hides nothing you left visible; hidden objects are excluded
  - decimates *copies* only, so your source meshes stay full-resolution
  - scales the root down to viewer size (mm -> ~1.5 units)
  - exports +Y up, which is what glTF and three.js expect
"""
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
OUT = argv[0]
SCALE = float(argv[1]) if len(argv) > 1 else 0.020
TARGET_TRIS = int(argv[2]) if len(argv) > 2 else 2500

# Drop anything hidden in the viewport or flagged non-rendering.
for o in list(bpy.data.objects):
    if o.hide_render or not o.visible_get():
        bpy.data.objects.remove(o, do_unlink=True)

# Decimate the heavy print meshes. Ratio is per-object so small parts keep
# their detail and large ones lose the tessellation nobody will ever see.
for o in bpy.data.objects:
    if o.type != "MESH":
        continue
    n = len(o.data.polygons)
    if n < TARGET_TRIS:
        continue
    m = o.modifiers.new("web_decimate", "DECIMATE")
    m.ratio = max(0.12, min(0.6, float(TARGET_TRIS) / n))

for name in ("quadruped_root", "yetibot_root"):
    root = bpy.data.objects.get(name)
    if root:
        root.scale = (SCALE,) * 3

bpy.context.view_layer.update()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_yup=True,
    export_apply=True,          # bakes the decimate modifiers
    use_visible=True,
)
tris = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
print(f"###EXPORTED### {OUT}  source_tris={tris}")
