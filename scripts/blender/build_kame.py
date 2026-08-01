import bpy, sys, os, math
from mathutils import Vector
argv = sys.argv[sys.argv.index("--")+1:]
SRC, OUT, PREVIEW = argv[0], argv[1], argv[2]

def imp(path, name):
    if hasattr(bpy.ops.wm,"stl_import"): bpy.ops.wm.stl_import(filepath=path)
    else: bpy.ops.import_mesh.stl(filepath=path)
    o=bpy.context.selected_objects[0]
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    o.location=(0,0,0); o.name=name; return o

def dup(o, name):
    c=o.copy(); c.data=o.data.copy(); c.name=name
    bpy.context.collection.objects.link(c); return c

def mat(name, rgb, rough=0.5):
    m=bpy.data.materials.new(name); m.use_nodes=True
    b=m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value=(*rgb,1)
    b.inputs["Roughness"].default_value=rough
    m.diffuse_color=(*rgb,1); return m

def setmat(o,m): o.data.materials.clear(); o.data.materials.append(m)

def empty(name, loc, parent=None):
    e=bpy.data.objects.new(name, None); bpy.context.collection.objects.link(e)
    e.location=loc
    if parent: e.parent=parent
    return e

bpy.ops.wm.read_factory_settings(use_empty=True)
BLUE  = mat("chassis",(0.09,0.16,0.62),0.45)   # printed blue, per the photo
BLACK = mat("linkage",(0.045,0.05,0.06),0.55)  # black linkage arms
DARK  = mat("servo",(0.10,0.11,0.13),0.5)

P=lambda n: os.path.join(SRC,n)
SERVO="sg90"   # switch to "mg90s" if the build uses metal-gear servos

box   = imp(P("body-box.stl"), "body_box")
cover = imp(P("body-cover.stl"), "body_cover")
brkL  = imp(P(f"bracket-left-{SERVO}.stl"),  "_brkL")
brkR  = imp(P(f"bracket-right-{SERVO}.stl"), "_brkR")
legL  = imp(P(f"leg-left-{SERVO}.stl"),  "_legL")
legR  = imp(P(f"leg-right-{SERVO}.stl"), "_legR")
link  = imp(P("leg-link.stl"), "_link")
foot  = imp(P("foot.stl"), "_foot")

bd = box.dimensions          # 62 x 72 x 27
cover.location = (0, 0, bd.z/2 + cover.dimensions.z/2 - 3)
setmat(box, BLUE); setmat(cover, BLUE)

root = bpy.data.objects.new("quadruped_root", None)
bpy.context.collection.objects.link(root)
box.parent = root; cover.parent = root

# Leg anchors at the four chassis corners.
LEGS = [("FL", -1, +1), ("FR", +1, +1), ("BL", -1, -1), ("BR", +1, -1)]
HX, HY = bd.x/2 - 4, bd.y/2 - 10

for tag, sx, sy in LEGS:
    hip = empty(f"hip_{tag}", (sx*HX, sy*HY, 2.0), root)

    b = dup(brkR if sx > 0 else brkL, f"bracket_{tag}")
    b.parent = hip
    b.rotation_euler = (0, 0, math.radians(0 if sy > 0 else 180))
    b.location = (sx*8, 0, 0)
    setmat(b, BLUE)

    knee = empty(f"knee_{tag}", (sx*26, 0, -4.0), hip)
    knee.rotation_euler = (0, math.radians(sx*46), 0)

    l = dup(legR if sx > 0 else legL, f"leg_{tag}")
    l.parent = knee; l.location = (0,0,0)
    l.rotation_euler = (0, 0, math.radians(0 if sy > 0 else 180))
    setmat(l, BLUE)

    k = dup(link, f"link_{tag}")
    k.parent = knee; k.location = (sx*2, sy*7, 2)
    k.rotation_euler = (0, 0, math.radians(0 if sy > 0 else 180))
    setmat(k, BLACK)

    f = dup(foot, f"foot_{tag}")
    f.parent = knee
    f.location = (sx*14, 0, -30)
    f.rotation_euler = (0, math.radians(-sx*46), math.radians(0 if sy > 0 else 180))
    setmat(f, BLACK)

for o in (brkL, brkR, legL, legR, link, foot):
    bpy.data.objects.remove(o, do_unlink=True)

# Root offset is in world units, applied after the 0.020 scale.
root.location = (0, 0, 0.45)
root.scale = (0.020,)*3
bpy.context.view_layer.update()

cam_d=bpy.data.cameras.new("c"); cam=bpy.data.objects.new("c",cam_d)
bpy.context.collection.objects.link(cam); bpy.context.scene.camera=cam
cam.location=(3.4,-4.4,2.2); cam.rotation_euler=(math.radians(68),0,math.radians(38))
cam_d.lens=52
for pos,e in [((6,-6,8),4.0),((-6,-4,3),1.5)]:
    ld=bpy.data.lights.new("l","SUN"); ld.energy=e
    lo=bpy.data.objects.new("l",ld); bpy.context.collection.objects.link(lo)
    lo.location=pos; lo.rotation_euler=(math.radians(52),0,math.radians(28))
sc=bpy.context.scene; sc.render.engine="BLENDER_WORKBENCH"
sc.display.shading.light="STUDIO"; sc.display.shading.color_type="MATERIAL"
sc.render.resolution_x=sc.render.resolution_y=560
sc.render.filepath=PREVIEW
bpy.ops.render.render(write_still=True)


# Decimate before export: these are print meshes (fine curvature tessellation)
# and the viewer only ever shows them at a few hundred pixels.
for o in list(bpy.data.objects):
    if o.type != "MESH":
        continue
    n = len(o.data.polygons)
    if n < 2000:
        continue
    m = o.modifiers.new("dec", "DECIMATE")
    m.ratio = max(0.12, min(0.5, 2500.0 / n))
bpy.context.view_layer.update()

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True, export_apply=True)
print("###DONE###")
