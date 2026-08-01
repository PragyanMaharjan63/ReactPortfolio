# 3D models

Drop web-optimised `.glb` files here. They are served from `/models/<name>.glb`.

Both robots are here, exported from the hand-assembled `.blend` files in
`scripts/blender/` and Draco-compressed. Each `.glb` has a `.rig.json` sidecar
carrying the joint sign conventions measured at export time.

## Adding a model

1. Export from CAD to glTF/GLB. Keep the engineering source file elsewhere —
   never overwrite it.
2. Reduce before exporting: remove internal parts that are never visible,
   decimate high-density meshes, merge materials, and cap texture size at
   2048px.
3. Compress: `npx gltf-transform optimize in.glb out.glb --compress draco`
4. Save as `client/public/models/<slug>.glb`.
5. On the project record in `client/src/data/projects.ts`, set
   `model: "/models/<slug>.glb"` and the correct `modelType`.

Target under ~3 MB; the viewer streams it only when the section scrolls near
the viewport.

---

## Current models

Both are generated from the print STLs in `stlfiles/`, not hand-modelled:

| File | Built from | Size |
|---|---|---|
| `yetibot.glb` | `scripts/blender/yetibot.blend` | 35 KB |
| `quadruped.glb` | `scripts/blender/quadruped.blend` | 207 KB |

Rebuild both with:

```bash
npm run build:models   # .blend -> .glb
npm run build:sim      # Draco-compress, and rebuild the firmware wasm
```

Both are decimated at export (print meshes carry far more curvature detail
than a few-hundred-pixel viewport needs) and then Draco-compressed, which is
why the models load in well under a second.

The Draco decoder is served from `/draco/`, copied out of the installed `three`
package by `scripts/sim/build.sh`. It is deliberately not loaded from a CDN, so
the site works behind a strict CSP and offline.
