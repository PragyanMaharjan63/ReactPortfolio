# Pragyan Maharjan — Portfolio

A Next.js App Router portfolio for robotics and full-stack engineering, with interactive 3D robots driven by their original firmware compiled to WebAssembly.

Production domain: <https://maharjanpragyan.com.np>

## Development

Use **Node.js 24.15+** (Node 24 LTS is used by Docker and Jenkins). SQLite uses Node's built-in `node:sqlite`; no database service or native npm addon is required.

```bash
npm ci
npm run dev
# http://localhost:3000 — Turbopack, pages, and API on one port
```

Optional environment overrides in `.env.local`:

```dotenv
SITE_URL=https://maharjanpragyan.com.np
DATABASE_PATH=./data/portfolio.sqlite
```

`DATABASE_PATH` is also read by the seed CLI when exported in the shell. The CLI does not load `.env.local` automatically.

## Stack and layout

Next.js 16 · React 19 · TypeScript · Turbopack · Tailwind CSS 4 · Framer Motion · React Three Fiber / drei / Three.js · SQLite.

| Path | Purpose |
| --- | --- |
| `src/app/` | App Router pages, layouts, metadata, sitemap, robots and API handlers |
| `src/views/` | Server-rendered page composition |
| `src/components/` | Sections, motion, UI and preserved 3D robot viewers |
| `src/lib/database.ts` | SQLite schema, initialization, queries and explicit content seed |
| `src/lib/projects.ts` | Server-only database access; request-scoped read deduplication |
| `src/data/projects.ts` | Initial project content and project types |
| `public/` | Original media, compressed models, Draco decoder and WASM firmware |
| `scripts/` | Content seeding, Blender exports and firmware compilation |

All existing URLs are retained: `/`, `/work`, `/about`, `/contact`, `/projects/<slug>`, `/api/projects`, `/api/projects/<slug>` and `/api/health`. Missing projects now return real 404 responses.

## Database

The first request creates `data/portfolio.sqlite`, applies schema version 1 and inserts the initial project records in a transaction. Both HTML pages and API endpoints read SQLite at request time, including the home page, project listings, detail pages and sitemap. Builds never create or bundle a runtime database.

Startup preserves database edits and deletions. To explicitly refresh the known projects after editing `src/data/projects.ts`:

```bash
npm run seed
# Or select another database:
DATABASE_PATH=/absolute/path/portfolio.sqlite npm run seed
```

Seeding upserts by slug without duplicates; it does not delete additional runtime records. SQLite uses WAL, a busy timeout and parameterized lookups. The schema preserves all existing project fields, including galleries, video metadata and model paths. The health endpoint returns 503 if the actual database cannot be queried.

The previous MongoDB connection was optional. This migration imports all repository project content. If the deployed MongoDB contains additional or edited records, export and reconcile those records before retiring that database; this repository contains no production credentials or live export.

For production, provide a **writable persistent directory**. Docker Compose mounts `sqlite-data` at `/app/data`. Preserve the volume across deployments (`docker compose down` preserves it; `down -v` removes it). Use SQLite's backup API or stop the app before copying the database; copying only the main file while writes are active can miss its WAL. Run one app instance per local SQLite volume. An ephemeral serverless filesystem does not provide durable storage.

## Production

```bash
npm run build       # optimized Turbopack production build
npm start           # Next.js on :3000
```

```bash
docker compose up --build -d
curl --fail http://localhost:6767/api/health
# {"status":"ok","database":"connected","engine":"sqlite",...}
```

The multi-stage Docker image uses Next's standalone output and runs as the unprivileged `node` user. Compose retains host port **6767 → 3000**. MongoDB is no longer needed. Jenkins validates, installs, lints, type-checks, runs database tests, builds and deploys the standalone image, then verifies database health and server-rendered hero markup. Its existing image rollback is retained. No deployment is performed by changing these files.

## Performance and motion

- Server Components keep page composition and database code out of the browser bundle.
- Turbopack handles development and production builds; `npm run analyze` opens Next's Turbopack bundle analyzer.
- `next/image` provides responsive sizes and AVIF/WebP optimization, including a prioritized hero poster.
- `next/font/local` self-hosts variable Manrope and JetBrains Mono fonts from npm packages, without network requests at build time.
- Next links prefetch routes; route-specific titles, canonical URLs and social metadata are rendered on the server.
- The Three.js viewer is dynamically imported with SSR disabled. The lightweight poster is rendered immediately; original model and Draco downloads overlap JavaScript loading.
- Original GLBs, WASM, gait tables, touch gestures, display frames, orbit controls, shadows, antialiasing and DPR are retained. No visual quality settings were reduced.
- Existing Framer Motion entrance/reveal/menu animations remain. Reduced-motion preferences are respected and a photograph remains available if WebGL fails.
- Public assets have revalidatable cache headers; Next's fingerprinted bundles and fonts use its own immutable caching.

## Verification

```bash
npm run lint
npm run type-check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests run against the **production** server on port 3100 with an isolated SQLite database. They exercise desktop/mobile navigation, metadata, all project URLs, API health and 404s, actual WASM gait execution and changing servo angles, YetiBot display frames and touch interaction, pause/reset controls, reduced motion and WebGL fallback.

## Models and firmware

The existing animation and simulation implementation lives in `src/components/three/` and `src/sim/`. Public asset URLs have not changed.

```bash
npm run build:models  # Blender assemblies → public/models/*.glb (needs Blender)
npm run build:sim     # firmware → public/sim/*, Draco compression (needs Docker)
```

See [firmware build notes](scripts/sim/README.md), [Blender notes](scripts/blender/README.md), [quadruped rig](public/models/QUADRUPED_MODEL.md) and [YetiBot rig](public/models/YETIBOT_MODEL.md). Source firmware under `scripts/robotCode/` is required to rebuild simulations; committed runtime artifacts work without that toolchain.

To add a project: add its typed seed record, put assets in `public/media/<slug>/`, run `npm run seed`, and visit `/projects/<slug>`. Keep assets out of `public/projects/`, which is the page route namespace. Undocumented project details stay visible in `missingInfo` instead of being invented.
