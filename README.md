# Pragyan Maharjan — Portfolio

Robotics and full-stack engineering portfolio. MERN monorepo with an
interactive WebGL robot viewer.

Production: <https://maharjanpragyan.com.np>

---

## 1. Overview

An npm-workspaces monorepo:

| Workspace | Role |
|---|---|
| `client/` | Vite + React + TypeScript SPA — the site |
| `server/` | Express + Mongoose — API, static hosting, per-route metadata |
| `scripts/` | Generates the server's bundled content from the client's data |

Express serves everything on one port: `/api/*`, the compiled bundle, and
`index.html` with route-specific `<title>`/OG tags injected before the response
is sent, so crawlers and link unfurlers get real metadata from an SPA.

**MongoDB is optional.** With no `MONGODB_URI` the API serves project content
bundled at build time and the site is fully functional. Setting it lets you
edit project content without a redeploy.

## 2. Technology stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion ·
React Three Fiber + drei + three.js · lucide-react ·
Express 5 · Mongoose · Docker · Docker Compose · Jenkins

## 3. Local development

```bash
npm ci                 # install all workspaces
npm run dev            # client on :5173, server on :3000 (proxied)
```

Run them separately if you prefer:

```bash
npm run dev -w client
npm run dev -w server
```

## 4. Environment variables

Copy the template — every variable is optional and has a working default:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Standard Node environment |
| `PORT` | `3000` | Port Express binds inside the container |
| `HOSTNAME` | `0.0.0.0` | Must stay `0.0.0.0` in Docker |
| `SITE_URL` | `https://maharjanpragyan.com.np` | Canonical origin for `<link rel=canonical>` and `og:url` |
| `MONGODB_URI` | *(empty)* | Optional. Empty ⇒ bundled content |
| `CLIENT_DIR` | auto-detected | Absolute path to `client/dist` |

No secrets are required. `.env` is gitignored and excluded from the image.

## 5. Production build

```bash
npm run build          # client -> client/dist, server -> server/dist
npm start              # serves both on http://localhost:3000
```

## 6. Docker

```bash
docker build -t maharjan-pragyan-portfolio:test .
docker run --rm -p 6767:3000 maharjan-pragyan-portfolio:test
curl --fail http://localhost:6767/api/health
```

Four stages — `base`, `deps`, `builder`, `prod-deps`, `runner`. The runner
holds only production dependencies, `server/dist` and `client/dist`: no source,
no toolchain. Runs as the unprivileged `node` user (uid 1000).

## 7. Docker Compose

```bash
docker compose up --build -d
docker compose logs -f app
docker compose down
```

Publishes **host `6767` → container `3000`**. Point your reverse proxy at 6767.
Mongo runs on the internal network only and is never published to the host.

Seed MongoDB from the bundled content (idempotent, upserts by slug):

```bash
docker compose exec app node -e "process.exit(0)"   # confirm app is up
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio npm run seed
```

## 8. Jenkins deployment

`Jenkinsfile` runs: Checkout → Validate → Install → Lint → Type Check → Build →
Docker Build → Deploy → Health Check → Cleanup.

- `checkout scm` uses the credentials Jenkins already holds — nothing hardcoded,
  and private repositories work.
- Lint, type-check and build run inside `node:22-alpine`, so the agent needs
  only Docker.
- Before the `latest` tag moves, the current image is tagged `:rollback`.
- The health check polls `/api/health` (20 attempts, 5s apart, 3-minute
  timeout) and also verifies `/` serves the document.
- On failure: container logs are printed and the previous image is redeployed
  automatically.
- Cleanup prunes **dangling layers only** — never `system prune -a`, so the
  rollback image survives.

## 9. Health endpoint

```bash
curl http://localhost:6767/api/health
# {"status":"ok","uptime":12,"database":"not-configured","env":"production"}
```

Returns 200 whenever the process can serve traffic. The database is optional,
so its state is reported but never fails the check.

## 10. 3D models and robot simulations

Both robots are shown as their real printed geometry and are **driven by their
own firmware**, compiled to WebAssembly. The gait tables, the tap rules and the
face animation are executed, not re-implemented in TypeScript, so the site
cannot drift away from what the hardware does.

| | Quadruped | YetiBot |
|---|---|---|
| Model | `client/public/models/quadruped.glb` | `.../yetibot.glb` |
| Source | `scripts/blender/quadruped.blend` | `scripts/blender/yetibot.blend` |
| Firmware | `scripts/robotCode/quadrapod3d` | `scripts/robotCode/yetibot` |
| In the viewer | Forward / Back / Turn buttons run the real gait | Tap the head; the real state machine responds |

Read next:

- `scripts/sim/README.md` — how the firmware is compiled and driven
- `scripts/blender/README.md` — editing the assemblies
- `client/public/models/QUADRUPED_MODEL.md` — servo channel map, motor placement
- `client/public/models/YETIBOT_MODEL.md` — hardware, tap rules, frame ranges

### Rebuilding after a change

```bash
npm run build:models   # .blend -> .glb, rebuilding the joint rig (needs Blender)
npm run build:sim      # firmware -> wasm, compress the .glb (needs Docker)
```

Both write into `client/public/`, and their outputs are committed. The runtime
image therefore needs no Emscripten, no Blender and no `gltf-transform` — `npm
run build` and the production `Dockerfile` are untouched by any of this.

Changing only firmware needs `build:sim`. Changing an assembly needs both.

### Adding a different model

1. Export to GLB and reduce first: drop never-visible internal parts, decimate
   dense meshes, merge materials, cap textures at 2048px.
2. Save to `client/public/models/<slug>.glb` and let `npm run build:sim`
   compress it.
3. In `client/src/data/projects.ts` set `model: "/models/<slug>.glb"` and the
   right `modelType`.

Only the two robots are wired to a firmware simulation; any other model renders
as a static, orbitable object. See `client/public/models/README.md`.

## 11. Adding a project

Everything lives in one typed array: `client/src/data/projects.ts`.

1. Append a `Project` object. `slug` becomes the URL `/projects/<slug>`.
2. Put images in `client/public/media/<slug>/` and reference them as
   `/media/<slug>/file.webp`.
   **Do not use `/projects/` for assets** — that path is the route namespace
   and a directory there shadows the page with a 301.
3. `featured: true` promotes it to the homepage.
4. `domain: "robotics"` gives it the 3D viewer and metadata table;
   `"web"` gives it a browser-framed screenshot.
5. Anything unverified goes in `missingInfo[]` — it renders as a visible
   checklist rather than being quietly omitted.
6. Run `npm run sync:content` so the server's fallback matches (the server
   build does this automatically).

## 12. Ports

| Context | Port |
|---|---|
| Vite dev server | 5173 |
| Express (dev and in-container) | 3000 |
| Published by Compose | 6767 → 3000 |
| MongoDB | 27017, internal network only |

## 13. Verification

```bash
npm ci && npm run lint && npm run type-check && npm run build
docker build -t maharjan-pragyan-portfolio:test .
docker run --rm -p 6767:3000 maharjan-pragyan-portfolio:test
curl --fail http://localhost:6767/api/health
```

## 14. Troubleshooting

**Blank page, console mentions a route** — an asset directory under
`client/public/` is shadowing a route. Assets belong in `/media/`, never
`/projects/`.

**3D viewer shows a photograph instead of a canvas** — expected when WebGL is
unavailable or the model fails to load. The viewer degrades to the poster
image; check the console for a GLTF load error.

**Viewer never appears** — it mounts only when scrolled within 200px of the
viewport, by design, to keep three.js (≈320 KB gzip) out of first paint.

**`npm ci` fails in Docker** — `package-lock.json` and the workspace
manifests must be committed and in sync. The build fails loudly rather than
falling back to a non-deterministic install.

**Mongo connection errors in logs, site still works** — intended. The
connection is best-effort; the API falls back to bundled content.

**Container exits immediately** — `docker logs portfolio-app`. Most often
`PORT`/`HOSTNAME` were overridden; `HOSTNAME` must be `0.0.0.0`.
