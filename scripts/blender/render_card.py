"""
Render a project-card image from an exported GLB.

  blender -b --factory-startup --python scripts/blender/render_card.py -- \
    client/public/models/quadruped.glb client/public/media/quadruped/model.png

The listing page shows a still, not a WebGL canvas: two live viewers on /work
would cost two GL contexts and the model downloads before anyone has asked for
them. The 3D viewer stays on the case-study page.

Transparent background, so the card's own surface colour shows through and the
image needs no edit if the theme changes.
"""
import bpy
import sys
import math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
GLB, OUT = argv[0], argv[1]
# 16:10 to match the card's aspect, at 2x for high-density screens.
W = int(argv[2]) if len(argv) > 2 else 1280
H = int(argv[3]) if len(argv) > 3 else 800
# Camera direction, as a multiple of the model's radius.
YAW = float(argv[4]) if len(argv) > 4 else 35.0
PITCH = float(argv[5]) if len(argv) > 5 else 16.0

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = W
scene.render.resolution_y = H
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"


def bounds():
    mn = Vector((1e9,) * 3)
    mx = Vector((-1e9,) * 3)
    for o in bpy.data.objects:
        if o.type != "MESH":
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mn[i] = min(mn[i], w[i])
                mx[i] = max(mx[i], w[i])
    return mn, mx


mn, mx = bounds()
centre = (mn + mx) / 2
radius = max((mx - mn).length / 2, 1e-3)

# --- camera ---------------------------------------------------------------
cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 70  # long-ish, so the printed parts do not fan out
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

yaw = math.radians(YAW)
pitch = math.radians(PITCH)
direction = Vector((
    math.sin(yaw) * math.cos(pitch),
    -math.cos(yaw) * math.cos(pitch),
    math.sin(pitch),
))
cam.location = centre + direction * radius * 3.1
cam.rotation_euler = (centre - cam.location).normalized().to_track_quat("-Z", "Y").to_euler()

# Frame it: nudge the camera back until the whole model is inside the frame.
bpy.context.view_layer.update()
for _ in range(40):
    coords = []
    from bpy_extras.object_utils import world_to_camera_view
    for o in bpy.data.objects:
        if o.type != "MESH":
            continue
        for c in o.bound_box:
            coords.append(world_to_camera_view(scene, cam, o.matrix_world @ Vector(c)))
    xs = [c.x for c in coords]
    ys = [c.y for c in coords]
    # 0.06 of margin on the tightest edge.
    if min(xs) > 0.06 and max(xs) < 0.94 and min(ys) > 0.06 and max(ys) < 0.94:
        break
    cam.location = centre + (cam.location - centre) * 1.06
    bpy.context.view_layer.update()

# --- lighting -------------------------------------------------------------
# Mirrors the viewer's three-light setup so the still and the interactive model
# read as the same object.
# Suns, not area lights: sun energy is irradiance, so it does not have to be
# rescaled when the model's size changes. Area lights scaled by radius squared
# blew the exposure out completely on the quadruped.
def add_sun(name, loc, energy, angle=0.5):
    d = bpy.data.lights.new(name, "SUN")
    d.energy = energy
    d.angle = angle  # soft-ish shadow edges
    o = bpy.data.objects.new(name, d)
    scene.collection.objects.link(o)
    o.location = centre + Vector(loc) * radius
    o.rotation_euler = (centre - o.location).normalized().to_track_quat("-Z", "Y").to_euler()
    return o


add_sun("key", (1.4, -1.8, 2.0), 3.2)
add_sun("fill", (-2.0, -1.2, 0.5), 1.1)
add_sun("rim", (-0.5, 2.0, 1.2), 1.8)

world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.25
scene.world = world

scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print(f"###RENDERED### {OUT} {W}x{H}")
