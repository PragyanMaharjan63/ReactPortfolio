import bpy, sys, os, math
argv = sys.argv[sys.argv.index("--")+1:]
SRC, OUT, PREVIEW = argv[0], argv[1], argv[2]

def imp(path, name):
    if hasattr(bpy.ops.wm,"stl_import"): bpy.ops.wm.stl_import(filepath=path)
    else: bpy.ops.import_mesh.stl(filepath=path)
    o = bpy.context.selected_objects[0]
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    o.location=(0,0,0); o.name=name; return o

def upright(o, rx=-90):
    o.rotation_euler=(math.radians(rx),0,0)
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.transform_apply(rotation=True)

def mat(name, rgb, rough=0.55):
    m=bpy.data.materials.new(name); m.use_nodes=True
    b=m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value=(*rgb,1)
    b.inputs["Roughness"].default_value=rough
    m.diffuse_color=(*rgb,1)          # workbench preview colour
    return m

def setmat(o,m): o.data.materials.clear(); o.data.materials.append(m)

bpy.ops.wm.read_factory_settings(use_empty=True)
WHITE=mat("shell",(0.88,0.88,0.90),0.62)
BLUE =mat("bezel",(0.06,0.11,0.65),0.40)
DARK =mat("screen",(0.010,0.013,0.025),0.22)

P=lambda n: os.path.join(SRC,n)
# obj_7 is the complete shell: horns, top tuft, arms and feet are all modelled in.
body  = imp(P("obj_7_corp+face.stl_1.stl"), "body");  upright(body)
bezel = imp(P("obj_8_corp+face.stl_2.stl"), "bezel"); upright(bezel, 90)
back  = imp(P("obj_4_Yeti Full.stl_3.stl"), "back_panel"); upright(back, 90)

bd = body.dimensions
front_y = -bd.y/2
FACE_Z = 4.0   # aperture sits slightly above the shell's vertical centre

bezel.location = (0, front_y + 2.2, FACE_Z)
back.location  = (0,  bd.y/2 - 2.2, FACE_Z)

# The shell's face aperture is larger than the bezel, so the hollow interior
# shows through around it. A plate behind the bezel closes it, which is what
# the printed OLED holder does in the real build.
bpy.ops.mesh.primitive_cube_add(size=1)
plate = bpy.context.active_object; plate.name="face_plate"
plate.scale=(bd.x*0.62, 1.6, bd.z*0.60)
bpy.ops.object.transform_apply(scale=True)
plate.location=(0, front_y + 4.6, FACE_Z)

bz = bezel.dimensions
bpy.ops.mesh.primitive_cube_add(size=1)
screen = bpy.context.active_object; screen.name="screen"
screen.scale=(bz.x*0.70, 0.7, bz.z*0.62)
bpy.ops.object.transform_apply(scale=True)
screen.location=(0, bezel.location.y + 1.6, FACE_Z)

setmat(body,WHITE); setmat(back,WHITE); setmat(plate,WHITE); setmat(bezel,BLUE); setmat(screen,DARK)

root = bpy.data.objects.new("yetibot_root", None)
bpy.context.collection.objects.link(root)
for o in (body,bezel,screen,back,plate): o.parent = root
root.scale=(0.024,)*3
bpy.context.view_layer.update()

cam_d=bpy.data.cameras.new("c"); cam=bpy.data.objects.new("c",cam_d)
bpy.context.collection.objects.link(cam); bpy.context.scene.camera=cam
cam.location=(1.9,-4.4,1.3); cam.rotation_euler=(math.radians(78),0,math.radians(23))
cam_d.lens=55
for pos,e in [((6,-6,8),4.0),((-6,-4,3),1.6)]:
    ld=bpy.data.lights.new("l","SUN"); ld.energy=e
    lo=bpy.data.objects.new("l",ld); bpy.context.collection.objects.link(lo)
    lo.location=pos; lo.rotation_euler=(math.radians(52),0,math.radians(28))
sc=bpy.context.scene; sc.render.engine="BLENDER_WORKBENCH"
sc.display.shading.light="STUDIO"; sc.display.shading.color_type="MATERIAL"
sc.render.resolution_x=sc.render.resolution_y=520
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
