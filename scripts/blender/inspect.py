import bpy, sys, os, glob, json
from mathutils import Vector

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def import_stl(path):
    if hasattr(bpy.ops.wm, "stl_import"):
        bpy.ops.wm.stl_import(filepath=path)
    else:
        bpy.ops.import_mesh.stl(filepath=path)
    return bpy.context.selected_objects[0]

root = sys.argv[sys.argv.index("--")+1]
out = []
for f in sorted(glob.glob(os.path.join(root, "**", "*.stl"), recursive=True)):
    clear()
    try:
        o = import_stl(f)
    except Exception as e:
        out.append({"file": os.path.relpath(f, root), "error": str(e)}); continue
    o.data.calc_loop_triangles()
    bb = [Vector(c) for c in o.bound_box]
    mn = Vector((min(v.x for v in bb), min(v.y for v in bb), min(v.z for v in bb)))
    mx = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
    dim = mx - mn
    out.append({
        "file": os.path.relpath(f, root),
        "tris": len(o.data.loop_triangles),
        "verts": len(o.data.vertices),
        "dim_mm": [round(dim.x,1), round(dim.y,1), round(dim.z,1)],
        "min": [round(mn.x,1), round(mn.y,1), round(mn.z,1)],
    })
print("###JSON###")
print(json.dumps(out, indent=1))
