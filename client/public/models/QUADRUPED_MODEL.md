# Quadruped — model & servo breakdown

Target model: **Kame32 — next-gen miniKame with ESP32**
<https://makerworld.com/en/models/1854482-kame32-next-gen-minikame-with-esp32>

> **Editable source:** `scripts/blender/quadruped.blend`.
> Fix the assembly there, then re-export:
> ```bash
> npm run build:models     # both robots
> npm run build:sim        # recompress + rebuild the firmware wasm
> ```
> See `scripts/blender/README.md`.

---

## 1. Topology

miniKame is an **8-servo, 4-leg, 2-DOF-per-leg** walker.

```
            FRONT  (-Y)
   FL ●───────────────● FR        ● = coxa servo (vertical shaft, swings the leg)
      │   ┌───────┐   │           ▼ = femur servo (horizontal shaft, lifts it)
      │   │ ESP32 │   │
      │   └───────┘   │
   BL ●───────────────● BR
            BACK   (+Y)
```

Per leg, outward from the chassis: coxa servo → bracket → femur servo → leg →
link + foot. The link and the leg are the two bars of a **parallelogram**, and
the foot is its coupler, which is what keeps the foot flat on the floor while
the leg swings.

## 2. Servo channels

**Source of truth: `scripts/robotCode/quadrapod3d/lib/servo_calibration/ServoConfig.cpp`.**
The channels are **grouped** — four coxa, then four femur — not interleaved.

| Ch | Name | Pin | Rig node | Home | Inverted |
|---|---|---|---|---|---|
| 0 | FL Coxa | 15 | `hip_FL` | 90 | |
| 1 | FR Coxa | 2 | `hip_FR` | 90 | ✓ |
| 2 | BL Coxa | 4 | `hip_BL` | 90 | ✓ |
| 3 | BR Coxa | 16 | `hip_BR` | 90 | |
| 4 | FL Femur | 17 | `knee_FL` | 135 | ✓ |
| 5 | FR Femur | 5 | `knee_FR` | 135 | |
| 6 | BL Femur | 18 | `knee_BL` | 135 | |
| 7 | BR Femur | 19 | `knee_BR` | 135 | ✓ |

"Inverted" means `ServoConfig::getPhysicalAngle` sends `180 - angle`, to
compensate for a mirrored horn. The viewer works in *logical* angles — the space
the gait tables are written in — so inversion does not enter the 3D rig.

Angles are 0–180. Femur **135 = planted, 90 = lifted**. Coxa 90 = centred, and
the rear pair is mirrored relative to the front: `walk.cpp` defines
`LEG_FRONT_COXA = {135,135,45,45}` against `LEG_BACK_COXA = {45,45,135,135}`, so
"above 90" means *forward* for a front leg and *backward* for a rear one.

> An earlier revision of this file listed the channels interleaved
> (`0 hip_FL, 1 knee_FL, 2 hip_FR …`) as an assumption. That was wrong; the
> table above is read from the firmware.

## 3. Where the motors sit

Measured off the print meshes by fitting circles to their cylindrical bores —
every figure below came from a fit with under 0.03 mm RMS error.

| Feature | Part | Bore | Axis |
|---|---|---|---|
| **Coxa shaft** | `bracket-right-sg90` | ⌀17.9 vertical boss, through the full 43 mm height | vertical (world Z) |
| **Femur shaft** | `leg-right-sg90` | ⌀16.8 proximal bore | horizontal |
| Foot pivot | `leg-right-sg90` | ⌀11.0 distal bore | horizontal, parallel to the femur |
| Link ends | `leg-link` | two ⌀8.00 bores, 43.17 mm apart | parallel to the femur |

In the assembled model the four coxa axes land at z ≈ +14.7 mm — **inside the
chassis** (`body_box` spans z −1.8…25.2 mm) — spaced symmetrically about the body
centre, which is exactly where a chassis-mounted coxa servo belongs. Each femur
axis lands inside its own bracket, 25.2–25.3 mm out from the coxa.

The linkage closes to within print tolerance, which is the check that the pivots
were identified correctly:

| | measured |
|---|---|
| leg bar (femur → foot pivot) | 43.45 mm |
| link bar (end to end) | 43.17 mm |
| coupler, knee side | 25.68–25.79 mm |
| coupler, foot side | 26.14–26.19 mm |

`export_rigged_glb.py` asserts on these and refuses to export if a pivot lands on
the wrong feature — the failure mode otherwise is feet that skate across the
floor during the gait, which is easy to miss by eye.

## 4. Rig in the GLB

```
quadruped_root
  body_box, body_cover
  hip_XX                  coxa, rotates about vertical
    bracket_XX
    knee_XX               femur, rotates about horizontal
      leg_XX
      footPivot_XX        counter-rotates, keeping the foot level
        foot_XX
    linkTop_XX            follows the femur, closing the parallelogram
      link_XX
```

Every joint is built so its **local +Z is the rotation axis**, so the viewer only
ever writes `node.rotation.z` and there is no per-joint axis table to keep in
sync.

`quadruped.rig.json` sits next to the GLB and carries the per-leg sign
conventions (`hipPlusIsForward`, `kneePlusIsUp`), derived at export time from the
actual assembly rather than hand-written. Re-assemble a leg in Blender,
re-export, and the animation stays correct.

## 5. Driving it from the firmware — done

`client/public/sim/gait.wasm` is `walk.cpp` and `ServoConfig.cpp` compiled
unmodified. The Forward / Back / Turn buttons call `Control::walkForward()` and
friends; the angles shown under the viewer are the ones the firmware commanded,
through its own 8-step / 25 ms interpolator. See `scripts/sim/README.md`.

## 6. Still needed

- [x] `quadruped.glb` — from the hand-assembled `.blend`, rigged at export
- [x] Servo channel → pin map, from the firmware
- [x] Gait driven by the real firmware
- [ ] Photos of the real build → `client/public/media/quadruped/`
- [ ] A walking clip → `demo-walk.mp4` + poster frame
- [ ] Servo model, battery, driver board

## 7. Notes on the assembly

The four legs are copies of the **right-hand** print parts; the left pair is
mirrored with a negative object scale rather than using the `-left-` STLs. That
is correct chirality for a render and costs nothing, but it means the left legs
in the viewer are not literally the parts you would print for that side.
