# Quadruped — media required

Nothing about this project could be verified automatically:

- No GitHub repository exists under `PragyanMaharjan63` matching "quadruped".
- LinkedIn blocks automated reads (HTTP 999), so the post could not be opened.
- No images, video, CAD, captions or notes exist anywhere in this repository.

The project therefore ships as a structural placeholder. Its page renders and
lists exactly what is outstanding; nothing about the hardware or capabilities
has been invented.

## Files to add here

| File | What it should be |
|---|---|
| `hero.webp` | Best full-robot photograph, ~1600px wide |
| `front-view.webp` | Front elevation |
| `walking-poster.webp` | Poster frame taken from the walking video |
| `walking-demo.mp4` | Compressed walking clip (H.264, no audio track needed) |

## Information to add to `client/src/data/projects.ts`

Edit the `quadruped` record:

- `summary` / `description` — what it does and why it was built
- `technologies` — frame, actuators, controller, sensors, languages
- `metadata` — the rows to show in the technical table
- `role` — your specific contribution
- `challenges` / `outcome` / `status`
- `links.github`, `links.documentation` if they exist
- `sources.linkedinPost` — the post URL

## 3D model

Drop a web-optimised `.glb` at `client/public/models/quadruped.glb`, then set
`model` and change `modelType` from `"placeholder"` to `"cad-export"` or
`"original"` on the record. The viewer picks it up with no code change.
