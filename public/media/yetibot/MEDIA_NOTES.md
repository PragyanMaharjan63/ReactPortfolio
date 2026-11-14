# YetiBot — media

## Present

Copied from the project's own repository, `PragyanMaharjan63/yetibot`:

| File | Source |
|---|---|
| `face.jpg` | `public/resources/feature1.jpeg` — expressive display |
| `touch-menu.jpg` | `public/resources/feature2.jpeg` — on-screen menu prompts |
| `play-mode.jpg` | `public/resources/feature3.jpeg` — built-in play mode |
| `manual-views.png` | `public/resources/yetibot-manual-views.png` |
| `logo.png` | `public/logo.png` |

## Still to add

- `demo.mp4` + `demo-poster.webp` — the repository contains
  `yetiebothero1.mp4` (prototype movement) and `yetibotTouc1h.mp4` (touch
  response). Copy and compress them here; real demonstration footage is
  stronger proof than the 3D reconstruction.
- The deployed YetiBot site URL. The repository has no `homepage` set, so the
  public address could not be determined. Once known, add it to
  `links.live` on the `yetibot` record.
- Firmware details — microcontroller, display part, touch sensor type, and the
  firmware repository. The `yetibot` repo contains the product website only.

## 3D model

There is no CAD or mesh file in any reachable source, so the viewer renders a
procedural reconstruction built from the photographs above
(`client/src/components/three/RobotModel.tsx`). It is labelled in the UI as
"Interactive visual reconstruction based on project media" and carries no
dimensional authority.

To replace it with the real thing: export to `client/public/models/yetibot.glb`,
set `model: "/models/yetibot.glb"` and `modelType: "original"` (or
`"cad-export"`) on the record. The label disappears automatically.
