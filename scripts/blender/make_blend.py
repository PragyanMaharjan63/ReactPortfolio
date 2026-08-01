"""
Generates editable .blend files for both robots.

Everything is imported at real scale (1 Blender unit = 1 mm), named, coloured
and parented into the joint hierarchy the web viewer expects. Positions are a
starting point — move/rotate the parts until the assembly is right, save, then
run export_glb.py.

Usage:
  blender -b --factory-startup --python scripts/blender/make_blend.py -- <which> <src> <out.blend>
    which: yeti | kame
"""
import bpy, sys, os, math

argv = sys.argv[sys.argv.index("--") + 1:]
WHICH, SRC, OUT = argv[0], argv[1], argv[2]


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    # Show millimetres in the UI so measurements match the print files.
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 0.001
    sc.unit_settings.length_unit = "MILLIMETERS"


def imp(path, name):
    if hasattr(bpy.ops.wm, "stl_import"):
        bpy.ops.wm.stl_import(filepath=path)
    else:
        bpy.ops.import_mesh.stl(filepath=path)
    o = bpy.context.selected_objects[0]
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    o.location = (0, 0, 0)
    o.name = name
    return o


def mat(name, rgb, rough=0.5):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    m.diffuse_color = (*rgb, 1)
    return m


def setmat(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)


def empty(name, loc, parent=None, size=6.0):
    e = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(e)
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = size
    e.location = loc
    if parent:
        e.parent = parent
        e.matrix_parent_inverse = parent.matrix_world.inverted()
    return e


def coll(name):
    c = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(c)
    return c


def move_to(o, c):
    for old in list(o.users_collection):
        old.objects.unlink(o)
    c.objects.link(o)


def note(text):
    t = bpy.data.texts.new("READ_ME")
    t.write(text)


def apply_rot(o):
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(rotation=True)


# ---------------------------------------------------------------- YetiBot ---
def build_yeti():
    reset()
    WHITE = mat("shell", (0.88, 0.88, 0.90), 0.62)
    BLUE = mat("bezel_blue", (0.06, 0.11, 0.65), 0.40)
    DARK = mat("screen_black", (0.010, 0.013, 0.025), 0.22)

    P = lambda n: os.path.join(SRC, n)
    c_main = coll("yetibot")
    c_spare = coll("unused_parts")

    body = imp(P("obj_7_corp+face.stl_1.stl"), "body")
    body.rotation_euler = (math.radians(-90), 0, 0)
    apply_rot(body)

    bezel = imp(P("obj_8_corp+face.stl_2.stl"), "bezel")
    bezel.rotation_euler = (math.radians(90), 0, 0)
    apply_rot(bezel)

    back = imp(P("obj_4_Yeti Full.stl_3.stl"), "back_panel")
    back.rotation_euler = (math.radians(90), 0, 0)
    apply_rot(back)

    bd = body.dimensions
    FACE_Z = 4.0
    bezel.location = (0, -bd.y / 2 + 2.2, FACE_Z)
    back.location = (0, bd.y / 2 - 2.2, FACE_Z)

    bpy.ops.mesh.primitive_cube_add(size=1)
    plate = bpy.context.active_object
    plate.name = "face_plate"
    plate.scale = (bd.x * 0.62, 1.6, bd.z * 0.60)
    bpy.ops.object.transform_apply(scale=True)
    plate.location = (0, -bd.y / 2 + 4.6, FACE_Z)

    bz = bezel.dimensions
    bpy.ops.mesh.primitive_cube_add(size=1)
    screen = bpy.context.active_object
    screen.name = "screen"
    screen.scale = (bz.x * 0.70, 0.7, bz.z * 0.62)
    bpy.ops.object.transform_apply(scale=True)
    screen.location = (0, bezel.location.y + 1.6, FACE_Z)

    for o, m in ((body, WHITE), (back, WHITE), (plate, WHITE),
                 (bezel, BLUE), (screen, DARK)):
        setmat(o, m)

    root = bpy.data.objects.new("yetibot_root", None)
    bpy.context.collection.objects.link(root)
    root.empty_display_size = 40
    for o in (body, bezel, screen, back, plate):
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()
        move_to(o, c_main)
    move_to(root, c_main)

    # Parts that exist in the print set but are internal or unused. Kept in the
    # file so you can decide, hidden so they do not clutter the viewport.
    for fn, nm in (("obj_1_Yeti Full.stl_1.stl", "spare_oled_holder"),
                   ("obj_2_Yeti Full.stl_7.stl", "spare_spiked_disc"),
                   ("obj_3_Yeti Full.stl_2.stl", "spare_panel"),
                   ("obj_5_Yeti Full.stl_4.stl", "spare_clip_a"),
                   ("obj_6_Yeti Full.stl_8.stl", "spare_clip_b")):
        p = P(fn)
        if os.path.exists(p):
            o = imp(p, nm)
            o.location = (0, 0, -160)
            o.hide_set(True)
            o.hide_render = True
            move_to(o, c_spare)

    note(
        "YETIBOT — editable assembly\n"
        "1 Blender unit = 1 mm.\n\n"
        "Nodes the web viewer expects (keep these names):\n"
        "  yetibot_root, body, bezel, screen, face_plate, back_panel\n\n"
        "Move/rotate parts until the assembly is right, then save and run:\n"
        "  blender -b scripts/blender/yetibot.blend \\\n"
        "    --python scripts/blender/export_glb.py -- \\\n"
        "    client/public/models/yetibot.glb\n\n"
        "The exporter decimates copies; your meshes here stay full-resolution.\n"
        "'unused_parts' holds print-internal pieces, hidden by default.\n"
    )


# --------------------------------------------------------------- Quadruped ---
def build_kame(servo="sg90"):
    reset()
    BLUE = mat("chassis_blue", (0.09, 0.16, 0.62), 0.45)
    BLACK = mat("linkage_black", (0.045, 0.05, 0.06), 0.55)

    P = lambda n: os.path.join(SRC, n)
    c_body = coll("chassis")

    box = imp(P("body-box.stl"), "body_box")
    cover = imp(P("body-cover.stl"), "body_cover")
    cover.location = (0, 0, box.dimensions.z / 2 + cover.dimensions.z / 2 - 3)
    setmat(box, BLUE)
    setmat(cover, BLUE)

    # Source parts, kept hidden as masters; each leg gets a linked-data copy.
    masters = {}
    for key, fn in (("brkL", f"bracket-left-{servo}.stl"),
                    ("brkR", f"bracket-right-{servo}.stl"),
                    ("legL", f"leg-left-{servo}.stl"),
                    ("legR", f"leg-right-{servo}.stl"),
                    ("link", "leg-link.stl"),
                    ("foot", "foot.stl"),
                    ("bush", "bushing.stl")):
        o = imp(P(fn), f"_master_{key}")
        o.location = (0, 0, -200)
        o.hide_set(True)
        o.hide_render = True
        masters[key] = o

    c_masters = coll("_masters")
    for o in masters.values():
        move_to(o, c_masters)

    root = bpy.data.objects.new("quadruped_root", None)
    bpy.context.collection.objects.link(root)
    root.empty_display_size = 40
    box.parent = root
    cover.parent = root
    move_to(root, c_body)
    move_to(box, c_body)
    move_to(cover, c_body)

    bd = box.dimensions
    HX, HY = bd.x / 2 - 4, bd.y / 2 - 10

    def dup(src, name):
        c = src.copy()
        c.data = src.data.copy()
        c.name = name
        bpy.context.collection.objects.link(c)
        c.hide_set(False)
        c.hide_render = False
        return c

    for tag, sx, sy in (("FL", -1, 1), ("FR", 1, 1), ("BL", -1, -1), ("BR", 1, -1)):
        cl = coll(f"leg_{tag}")

        hip = empty(f"hip_{tag}", (sx * HX, sy * HY, 2.0), root)
        knee = empty(f"knee_{tag}", (sx * 26, 0, -4.0), hip)
        knee.rotation_euler = (0, math.radians(sx * 46), 0)

        yaw = math.radians(0 if sy > 0 else 180)

        b = dup(masters["brkR"] if sx > 0 else masters["brkL"], f"bracket_{tag}")
        b.parent = hip
        b.location = (sx * 8, 0, 0)
        b.rotation_euler = (0, 0, yaw)
        setmat(b, BLUE)

        l = dup(masters["legR"] if sx > 0 else masters["legL"], f"leg_{tag}")
        l.parent = knee
        l.location = (0, 0, 0)
        l.rotation_euler = (0, 0, yaw)
        setmat(l, BLUE)

        k = dup(masters["link"], f"link_{tag}")
        k.parent = knee
        k.location = (sx * 2, sy * 7, 2)
        k.rotation_euler = (0, 0, yaw)
        setmat(k, BLACK)

        f = dup(masters["foot"], f"foot_{tag}")
        f.parent = knee
        f.location = (sx * 14, 0, -30)
        f.rotation_euler = (0, math.radians(-sx * 46), yaw)
        setmat(f, BLACK)

        for o in (hip, knee, b, l, k, f):
            move_to(o, cl)

    note(
        "QUADRUPED (Kame32 / miniKame) — editable assembly\n"
        "1 Blender unit = 1 mm.  Servo variant used: " + servo + "\n\n"
        "HIERARCHY — keep these names, the web viewer and the future\n"
        "PlatformIO gait importer address them directly:\n"
        "  quadruped_root\n"
        "    body_box, body_cover\n"
        "    hip_FL -> knee_FL -> (leg_FL, link_FL, foot_FL)   ... FR, BL, BR\n\n"
        "SERVO CHANNELS (confirm against your firmware pin map):\n"
        "  0 hip_FL   1 knee_FL   2 hip_FR   3 knee_FR\n"
        "  4 hip_BL   5 knee_BL   6 hip_BR   7 knee_BR\n\n"
        "IMPORTANT — put each joint empty ON the servo shaft axis. The viewer\n"
        "rotates the empties, so if an empty is off-axis the limb orbits\n"
        "instead of pivoting.\n\n"
        "Only the empties' positions matter for animation; the meshes just ride\n"
        "along. Fix the mesh placement first, then move the empties onto the\n"
        "real pivot points.\n\n"
        "Swap servo variant: re-run make_blend.py with 'kame-mg90s'.\n\n"
        "When done, save and run:\n"
        "  blender -b scripts/blender/quadruped.blend \\\n"
        "    --python scripts/blender/export_glb.py -- \\\n"
        "    client/public/models/quadruped.glb\n"
    )


if WHICH == "yeti":
    build_yeti()
elif WHICH == "kame":
    build_kame("sg90")
elif WHICH == "kame-mg90s":
    build_kame("mg90s")
else:
    raise SystemExit(f"unknown target: {WHICH}")

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("###SAVED###", OUT)
