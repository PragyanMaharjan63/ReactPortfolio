"""
Export an assembled .blend to a web-ready, *rigged* GLB.

  blender -b scripts/blender/quadruped.blend \
    --python scripts/blender/export_rigged_glb.py -- client/public/models/quadruped.glb

  blender -b scripts/blender/yetibot.blend \
    --python scripts/blender/export_rigged_glb.py -- client/public/models/yetibot.glb

Why this exists alongside export_glb.py
---------------------------------------
export_glb.py assumes the .blend already carries the joint hierarchy. The
hand-assembled files do not: the parts sit at the right places but are flat,
unparented and named after whichever master they were duplicated from
(bracket_BR.001, leg_FL.002, ...). This script reconstructs the rig at export
time and leaves the .blend untouched.

How the pivots are found
------------------------
Each leg's meshes are independent copies of one master, and every copy carries a
*different* local offset, so master-local coordinates cannot be reused directly.
What is invariant is where a pivot sits as a fraction of the part's own local
bounding box. That fraction is measured once on the master, then applied to each
copy and pushed through that object's world matrix. Mirrored legs (scale -1 on X)
need no special case: the fraction is a local-space quantity and the object
matrix carries the mirror.

The master-local pivot coordinates below were measured by fitting circles to the
mesh's cylindrical bores (see the bore scan in the model docs); every one used
here fit with an RMS error under 0.03 mm.

Joint convention
----------------
Every joint empty is built so that its **local +Z is the rotation axis**. The
viewer therefore only ever writes `node.rotation.z`, with no per-joint axis
table to keep in sync.

  quadruped_root
    hip_FL                     rotates about vertical  (coxa servo, ch 0-3)
      bracket_FL
      knee_FL                  rotates about horizontal (femur servo, ch 4-7)
        leg_FL
        footPivot_FL           counter-rotates to keep the foot level
          foot_FL
      linkTop_FL               follows the femur, completing the parallelogram
        link_FL

  yetibot_root
    body, bezel, screen, back_panel
    head_top                   anchor for the "tap here" marker
"""
import bpy
import sys
import json
import math
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:]
OUT = argv[0]
SCALE = float(argv[1]) if len(argv) > 1 else 0.020
TARGET_TRIS = int(argv[2]) if len(argv) > 2 else 2500

LEGS = ("FL", "FR", "BL", "BR")

# --- master-local pivot coordinates, from the bore scan ---------------------
# name -> (master object, local point, which local axis is the rotation axis)
#
# The leg carries two coaxial bores, one at each end, and they are easy to
# confuse: the proximal one rides the femur shaft, the distal one carries the
# foot. Picking the wrong one puts the knee outside the bracket entirely and
# collapses the parallelogram, so the export asserts on the bar lengths below.
PIVOTS = {
    # vertical boss the coxa shaft runs through, dia 17.9
    "hip":       ("_master_brkR", Vector((15.55, 0.0, -3.01)),   "Y"),
    # proximal (femur shaft) bore in the leg, dia 16.8
    "knee":      ("_master_legR", Vector((19.57, 0.0, 3.49)),    "Y"),
    # distal bore in the leg, dia 11.0, rms 0.000 — where the foot hangs
    "legDistal": ("_master_legR", Vector((-22.50, 4.25, -6.50)), "Y"),
    # the link's two 8.00 mm ends, rms 0.000; which is which is decided at
    # runtime by proximity to the knee, so a flipped link cannot silently pass
    "linkA":     ("_master_link", Vector((-21.0, 5.0, 0.0)),     "Z"),
    "linkB":     ("_master_link", Vector((21.0, -5.0, 0.0)),     "Z"),
}


def local_bbox(o):
    bb = [Vector(v) for v in o.bound_box]
    mn = Vector((min(v[i] for v in bb) for i in range(3)))
    mx = Vector((max(v[i] for v in bb) for i in range(3)))
    return mn, mx


def to_fraction(o, p):
    mn, mx = local_bbox(o)
    d = mx - mn
    return Vector([(p[i] - mn[i]) / d[i] if abs(d[i]) > 1e-9 else 0.5 for i in range(3)])


def from_fraction(o, f):
    mn, mx = local_bbox(o)
    d = mx - mn
    return Vector([mn[i] + f[i] * d[i] for i in range(3)])


def axis_of(o, which):
    v = {"X": Vector((1, 0, 0)), "Y": Vector((0, 1, 0)), "Z": Vector((0, 0, 1))}[which]
    return (o.matrix_world.to_3x3() @ v).normalized()


def basis_with_z(z):
    """Rotation matrix whose local +Z is `z`, so joints animate on rotation.z."""
    z = z.normalized()
    up = Vector((0, 0, 1)) if abs(z.z) < 0.9 else Vector((1, 0, 0))
    x = up.cross(z).normalized()
    y = z.cross(x).normalized()
    return Matrix((x, y, z)).transposed().to_4x4()


def make_empty(name, location, z_axis, parent=None, size=6.0):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = size
    bpy.context.scene.collection.objects.link(e)
    e.matrix_world = Matrix.Translation(location) @ basis_with_z(z_axis)
    if parent:
        # Keep Transform: the child must not jump when it gains a parent.
        e.parent = parent
        e.matrix_parent_inverse = parent.matrix_world.inverted()
    return e


def reparent(obj, parent):
    obj.parent = parent
    obj.matrix_parent_inverse = parent.matrix_world.inverted()


# ---------------------------------------------------------------------------
# quadruped
# ---------------------------------------------------------------------------
def rig_quadruped():
    report = {"legs": {}}

    fracs = {}
    for key, (master_name, pt, ax) in PIVOTS.items():
        m = bpy.data.objects.get(master_name)
        if not m:
            raise SystemExit(f"missing master {master_name}; cannot derive pivots")
        fracs[key] = to_fraction(m, pt)

    root = bpy.data.objects.new("quadruped_root", None)
    root.empty_display_size = 40
    bpy.context.scene.collection.objects.link(root)

    for name in ("body_box", "body_cover"):
        o = bpy.data.objects.get(name)
        if o:
            reparent(o, root)

    for leg in LEGS:
        coll = bpy.data.collections.get(f"leg_{leg}")
        if not coll:
            raise SystemExit(f"missing collection leg_{leg}")

        parts = {}
        for o in coll.objects:
            for kind in ("bracket", "link", "foot", "leg"):
                if o.name.startswith(kind):
                    parts[kind] = o
        missing = {"bracket", "link", "foot", "leg"} - set(parts)
        if missing:
            raise SystemExit(f"leg_{leg}: missing {missing}")

        brk, lg, lnk, ft = parts["bracket"], parts["leg"], parts["link"], parts["foot"]

        hip_p = brk.matrix_world @ from_fraction(brk, fracs["hip"])
        hip_ax = axis_of(brk, PIVOTS["hip"][2])
        knee_p = lg.matrix_world @ from_fraction(lg, fracs["knee"])
        knee_ax = axis_of(lg, PIVOTS["knee"][2])
        foot_p = lg.matrix_world @ from_fraction(lg, fracs["legDistal"])

        # The link is symmetric, so its two ends are interchangeable in the
        # mesh. Assign them by geometry: the end nearer the knee is the one
        # pinned to the bracket.
        a = lnk.matrix_world @ from_fraction(lnk, fracs["linkA"])
        b = lnk.matrix_world @ from_fraction(lnk, fracs["linkB"])
        link_top_p, link_foot_p = (a, b) if (a - knee_p).length < (b - knee_p).length else (b, a)

        # The coxa axis is vertical by construction; force it exactly so the four
        # legs cannot drift a fraction of a degree apart.
        hip_ax = Vector((0, 0, 1)) if hip_ax.z > 0 else Vector((0, 0, -1))
        # Both femur-driven pivots must share one axis or the parallelogram racks.
        knee_ax = knee_ax.normalized()

        mirrored = brk.matrix_world.to_3x3().determinant() < 0

        hip = make_empty(f"hip_{leg}", hip_p, hip_ax, root, 14)
        reparent(brk, hip)
        knee = make_empty(f"knee_{leg}", knee_p, knee_ax, hip, 10)
        reparent(lg, knee)
        link_top = make_empty(f"linkTop_{leg}", link_top_p, knee_ax, hip, 8)
        reparent(lnk, link_top)
        foot_pivot = make_empty(f"footPivot_{leg}", foot_p, knee_ax, knee, 8)
        reparent(ft, foot_pivot)

        # Two-phase rename. The parts are named after the master they were
        # duplicated from, so leg_FL is really the BR leg and the name a *later*
        # leg wants is still held by an earlier one. Park everything on a
        # temporary name first; the final pass runs once all legs are done.
        brk.name = f"__bracket_{leg}"
        lg.name = f"__leg_{leg}"
        lnk.name = f"__link_{leg}"
        ft.name = f"__foot_{leg}"

        # Which way does a *positive* rotation actually move this leg? It
        # depends on the leg's rest yaw and on whether the leg is mirrored, so
        # deriving it here beats hand-written per-leg sign constants in the
        # viewer that silently rot when the assembly changes.
        #
        # For a small rotation t about unit axis `a`, a point at offset `r` from
        # the pivot moves along `a x r`. Test that against the foot.
        ft_bb = [ft.matrix_world @ Vector(v) for v in ft.bound_box]
        foot_c = sum(ft_bb, Vector((0, 0, 0))) / 8

        hip_move = hip_ax.cross(foot_c - hip_p)
        knee_move = knee_ax.cross(foot_c - knee_p)
        # Front of the robot is -Y; up is +Z.
        hip_plus_is_forward = -1 if hip_move.y > 0 else 1
        knee_plus_is_up = 1 if knee_move.z > 0 else -1

        # A true parallelogram has |knee->linkTop| == |footAttach->linkFoot| and
        # |knee->footAttach| == |linkTop->linkFoot|. Report both so a bad pivot
        # shows up as a number rather than as a limb that slides while walking.
        report["legs"][leg] = {
            "hipPlusIsForward": hip_plus_is_forward,
            "kneePlusIsUp": knee_plus_is_up,
            "hip": [round(v, 2) for v in hip_p],
            "hip_axis": [round(v, 3) for v in hip_ax],
            "knee": [round(v, 2) for v in knee_p],
            "knee_axis": [round(v, 3) for v in knee_ax],
            "mirrored": mirrored,
            "hip_to_knee": round((knee_p - hip_p).length, 2),
            "bar_leg": round((foot_p - knee_p).length, 2),
            "bar_link": round((link_foot_p - link_top_p).length, 2),
            "coupler_knee_side": round((link_top_p - knee_p).length, 2),
            "coupler_foot_side": round((link_foot_p - foot_p).length, 2),
        }

    for o in list(bpy.data.objects):
        if o.name.startswith("__"):
            o.name = o.name[2:]

    # A parallelogram only keeps the foot level if opposite sides match. Bail
    # rather than ship a rig whose feet skate across the floor while walking.
    for leg, r in report["legs"].items():
        for a, b in (("bar_leg", "bar_link"), ("coupler_knee_side", "coupler_foot_side")):
            if abs(r[a] - r[b]) > 3.0:
                raise SystemExit(
                    f"leg_{leg}: linkage does not close, {a}={r[a]} vs {b}={r[b]}. "
                    "A pivot in PIVOTS is on the wrong feature."
                )
    return report


# ---------------------------------------------------------------------------
# yetibot
# ---------------------------------------------------------------------------
def rig_yetibot():
    root = bpy.data.objects.new("yetibot_root", None)
    root.empty_display_size = 40
    bpy.context.scene.collection.objects.link(root)

    body = bpy.data.objects.get("body")
    for name in ("body", "bezel", "screen", "back_panel"):
        o = bpy.data.objects.get(name)
        if o:
            reparent(o, root)

    # Turn the robot to face a +Z viewer, so the display is what you see first.
    # The export converts Blender's Z-up to glTF's Y-up, which maps Blender -Y
    # onto glTF +Z — so the screen has to end up on Blender's -Y side. Baking it
    # here rather than rotating in the viewer means every consumer gets it
    # right, including the plain non-interactive one on the landing page.
    screen = bpy.data.objects.get("screen")
    if screen and body:
        sy = screen.matrix_world.translation.y
        by = sum((body.matrix_world @ Vector(c)).y for c in body.bound_box) / 8
        if sy > by:
            root.rotation_euler = (0.0, 0.0, math.pi)
            bpy.context.view_layer.update()

    report = {}
    if body:
        bb = [body.matrix_world @ Vector(v) for v in body.bound_box]
        top = Vector((
            sum(v.x for v in bb) / 8,
            sum(v.y for v in bb) / 8,
            max(v.z for v in bb),
        ))
        make_empty("head_top", top, Vector((0, 0, 1)), root, 10)
        report["head_top"] = [round(v, 2) for v in top]
        report["body_height_mm"] = round(max(v.z for v in bb) - min(v.z for v in bb), 2)

    screen = bpy.data.objects.get("screen")
    if screen:
        sb = [screen.matrix_world @ Vector(v) for v in screen.bound_box]
        report["screen_world"] = {
            "min": [round(min(v[i] for v in sb), 2) for i in range(3)],
            "max": [round(max(v[i] for v in sb), 2) for i in range(3)],
        }
    return report


# ---------------------------------------------------------------------------
is_quad = bpy.data.collections.get("leg_FL") is not None
report = rig_quadruped() if is_quad else rig_yetibot()

# Drop anything hidden in the viewport or flagged non-rendering. Done *after*
# rigging so the masters are still available to measure pivots from.
for o in list(bpy.data.objects):
    if o.type == "MESH" and (o.hide_render or not o.visible_get()):
        bpy.data.objects.remove(o, do_unlink=True)

# Decimate the heavy print meshes. Ratio is per-object so small parts keep their
# detail and large ones lose tessellation nobody will ever see at viewer size.
for o in bpy.data.objects:
    if o.type != "MESH":
        continue
    n = len(o.data.polygons)
    if n < TARGET_TRIS:
        continue
    m = o.modifiers.new("web_decimate", "DECIMATE")
    m.ratio = max(0.12, min(0.6, float(TARGET_TRIS) / n))

root = bpy.data.objects.get("quadruped_root") or bpy.data.objects.get("yetibot_root")
if root:
    root.scale = (SCALE,) * 3

bpy.context.view_layer.update()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_yup=True,
    export_apply=True,       # bakes the decimate modifiers
    use_visible=True,
    export_cameras=False,
    export_lights=False,
)

tris = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
nodes = [o.name for o in bpy.data.objects]
summary = {"out": OUT, "source_tris": tris, "nodes": sorted(nodes), "rig": report}

# Sidecar next to the .glb. The viewer reads the joint sign conventions from
# here rather than hard-coding them, so re-assembling a leg in Blender and
# re-exporting is enough to keep the animation correct.
if OUT.endswith(".glb"):
    with open(OUT[:-4] + ".rig.json", "w") as f:
        json.dump(summary, f, indent=1)

print("###REPORT###")
print(json.dumps(summary, indent=1))
