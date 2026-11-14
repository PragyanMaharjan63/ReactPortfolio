# Blender source files

Editable assemblies for the two robots. **Fix the model here, export, done** —
no other code needs touching.

| File | Opens as |
|---|---|
| `yetibot.blend` | Shell, bezel, screen, face plate, back panel |
| `quadruped.blend` | Chassis + 4 legs, one collection per leg |

Built from the print STLs in `stlfiles/`. **1 Blender unit = 1 mm**, so the
viewport ruler matches the real parts.

---

## Fix a model

```bash
blender scripts/blender/quadruped.blend
```

Move and rotate the parts until the assembly is right, then save (`Ctrl+S`).
Each file has a `READ_ME` text block in the Scripting workspace with the
specifics.

### Then export

```bash
npm run build:models     # both robots
npm run build:sim        # Draco-compress them, rebuild the firmware wasm
```

Refresh the site — the viewer picks the new files up, nothing else changes.

`export_rigged_glb.py` decimates **copies**, so your meshes stay full-resolution
in the `.blend`. It scales the root to viewer size and exports +Y up, which is
what three.js expects. Override if needed:

```bash
# args: <output> [root_scale] [target_tris_per_object]
--python scripts/blender/export_rigged_glb.py -- out.glb 0.020 2500
```

### You do not need to build the joint hierarchy

`export_rigged_glb.py` reconstructs it every time, from the geometry. Keep the
**collections** right (`leg_FL` / `leg_FR` / `leg_BL` / `leg_BR`, one bracket +
leg + link + foot in each) and place the parts where you want them; the exporter
finds each servo axis by locating the part's cylindrical bores, builds
`hip_XX` / `knee_XX` / `linkTop_XX` / `footPivot_XX` on those axes, and renames
the parts per leg. Duplicate names like `leg_FL.002` are fine.

It refuses to export if the four-bar linkage does not close to within 3 mm,
which is what catches a pivot landing on the wrong feature. The failure it
prevents is subtle — feet that slide along the floor mid-gait.

It also writes `<model>.rig.json` next to the GLB, carrying the per-leg sign
conventions (which way a positive rotation swings the leg, and which way lifts
the foot) measured from *your* assembly. The viewer reads that file, so
re-posing a leg and re-exporting keeps the animation correct with no code
change.

---

## Names

Inside the `.blend` only the **collection** names matter — the exporter names
the parts itself. What it emits, and what the viewer looks up:

```
quadruped_root
  body_box, body_cover
  hip_XX ──► bracket_XX
         ──► knee_XX ──► leg_XX, footPivot_XX ──► foot_XX
         ──► linkTop_XX ──► link_XX
```

Servo channels are **grouped**, four coxa then four femur, read from
`scripts/robotCode/quadrapod3d/lib/servo_calibration/ServoConfig.cpp`:

| Ch | Node | Ch | Node |
|---|---|---|---|
| 0 | `hip_FL` | 4 | `knee_FL` |
| 1 | `hip_FR` | 5 | `knee_FR` |
| 2 | `hip_BL` | 6 | `knee_BL` |
| 3 | `hip_BR` | 7 | `knee_BR` |

**yetibot.blend** — the exporter emits `yetibot_root`, `body`, `bezel`,
`screen`, `back_panel`, plus a `head_top` empty at the crown of the shell that
anchors the "TAP HERE" marker. Keep `screen` a separate object: the viewer
mounts the OLED quad onto it.

---

## The one thing that matters for animation

**Keep each leg's four parts in that leg's collection.** That is the only thing
the exporter uses to tell the legs apart. Everything else — which bore is the
coxa shaft, which way the leg swings, whether the leg is mirrored — it measures.

If a leg comes out wrong, check the export report: it prints each leg's pivot
positions and the four linkage lengths, and those numbers localise the problem
faster than looking at the model does.

---

## Collections

**quadruped.blend**

- `chassis` — body box and cover
- `leg_FL` / `leg_FR` / `leg_BL` / `leg_BR` — one per leg, each holding that
  leg's bracket, leg, link and foot. **This grouping is what the exporter reads**,
  so a part in the wrong collection puts a joint on the wrong leg.
- `_masters` — hidden source imports. Each leg holds an independent copy, so
  editing a leg does not affect the others. Delete this collection once you no
  longer need to re-copy from it.

**yetibot.blend**

- `yetibot` — the assembled robot
- `unused_parts` — print-internal pieces (OLED holder, the spiked disc, clips),
  hidden. `obj_2` (the 90 mm spiked disc) is wider than the shell and is not
  part of the visible robot; it is kept only so you can decide.

Hidden objects are dropped at export.

---

## Servo variant

`quadruped.blend` uses the **sg90** parts. Your STL set also has `mg90s`.
To rebuild the file with those instead:

```bash
blender -b --factory-startup --python scripts/blender/make_blend.py -- \
  kame-mg90s "stlfiles/Kame32_+Next-Gen+Minikame+with+ESP32" \
  scripts/blender/quadruped.blend
```

> This **overwrites** the .blend and discards your edits — only do it before
> you start, or on a copy.

---

## Regenerating from scratch

`make_blend.py` rebuilds a `.blend` from the raw STLs. `build_yeti.py` and
`build_kame.py` are the original one-shot STL → GLB scripts, and `export_glb.py`
is the earlier exporter that expected the `.blend` to already carry its joint
empties. All three are kept for reference; `export_rigged_glb.py` replaces them
for day-to-day work.
