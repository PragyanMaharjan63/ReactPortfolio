# Pragyan Maharjan — Portfolio

Next.js App Router portfolio with an owner dashboard and interactive 3D robots driven by firmware compiled to WebAssembly.

## Development

Use **Node.js 24** (24.15+ recommended).

```bash
npm ci
cp .env.example .env.local
npm run dev
# http://localhost:3000
```

Next.js serves pages and API routes together. Turbopack handles development and production builds. Local development uses Node's built-in SQLite at `data/portfolio.sqlite`; the first request initializes all seven project records.

## Dashboard

Visit **`/dashboard`**. Configure these private environment variables first:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | A unique password of 12–256 characters |
| `AUTH_SECRET` | A random secret of at least 32 characters |
| `TURSO_DATABASE_URL` | Required on Vercel: hosted SQLite address (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Required on Vercel: database token with read/write permission |
| `SITE_URL` | Canonical public origin, e.g. `https://maharjanpragyan.com.np` |
| `DATABASE_PATH` | Optional local SQLite path; ignored when Turso is configured |

Generate `AUTH_SECRET` locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The dashboard creates, edits and deletes projects, changes featured status, reorders projects, and exports a JSON backup. Editable fields include text, links, technologies, image/model references, galleries, videos, specifications, challenges and undocumented details. Galleries, videos and specifications use JSON editors with examples. Media fields accept existing public paths or HTTPS URLs; file uploading is not included. Keep existing robot slugs and model URLs to preserve their firmware simulations.

Changes become visible on the public site without a rebuild. Sessions use signed, expiring HttpOnly cookies, production HTTPS, same-site restrictions, and mutation origin checks. Every admin endpoint checks authentication. Failed logins are throttled through the database. Stale edits/deletions are rejected rather than overwriting another tab's changes. Changing either credential invalidates existing sessions. There is no signup or default password.

Without credentials the dashboard shows setup instructions. An unconfigured Vercel deployment can preview the portfolio using seeded in-memory SQLite, but dashboard writes remain disabled until Turso is connected; no edits are silently stored in temporary function files.

## Vercel deployment

1. Import this repository into Vercel with the **repository root** as Root Directory.
2. Keep the Next.js framework preset. `vercel.json` runs `npm ci` and `npm run build`; Node is pinned to the 24.x line.
3. Create a Turso database and set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_PASSWORD`, `AUTH_SECRET`, and `SITE_URL` in the project environment variables.
4. Deploy, then visit `/api/health` and `/dashboard`.

Vercel Functions do not provide persistent local SQLite files. Turso provides hosted SQLite/libSQL storage so dashboard edits survive cold starts and redeployments. The database initializes and seeds once; subsequent starts preserve edits and deletions. No paid resource, database account, or deployment is created by this repository configuration.

The runtime `data/` directory is ignored with **`/data/`**, scoped to the repository root. **`src/data/` must be committed**, because it contains the initial projects, site profile and skills. An unscoped `data/` ignore rule hides those source files and causes Vercel's “Module not found” build errors.

Firmware submodules are not needed to build/deploy the website: the `.wasm`, `.mjs`, models and Draco decoder in `public/` are committed. A submodule-fetch warning does not cause missing `src/data` imports.

## Database and content

Pages, APIs and dashboard use the same database. Without Turso, local edits persist in `DATABASE_PATH`; with Turso, local and deployed apps can use the same remote database. Use separate Turso databases for development/preview and production if changes should be isolated.

Initial content lives in `src/data/projects.ts`. Normal startup never overwrites dashboard edits. To deliberately refresh those seed records:

```bash
npm run seed
```

The seed CLI reads exported shell variables, not `.env.local` automatically. For a hosted seed, export `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` before running it. Seeding upserts known slugs without deleting extra projects. Export a dashboard backup before refreshing content. Local database backups must include SQLite's WAL or use a proper SQLite backup operation.

The original MongoDB was optional. Any production-only MongoDB records must be exported and reconciled separately; this repository includes the seven known projects.

## Production locally

```bash
npm run build
npm start
# http://localhost:3000
```

The repository uses the standard Next.js server and Vercel deployment configuration.

## Structure

| Path | Purpose |
| --- | --- |
| `src/app/` | Pages, metadata, sitemap and API handlers |
| `src/app/dashboard/` | Protected owner workspace and login |
| `src/components/dashboard/` | Project editor and login UI |
| `src/lib/storage.ts` | Shared local SQLite / Turso project store |
| `src/lib/database.ts` | Local SQLite initialization and seed helpers |
| `src/lib/session.ts`, `auth.ts`, `admin-api.ts` | Session and authorization checks |
| `src/lib/project-validation.ts` | Shared browser/server input validation |
| `src/data/` | Version-controlled source content |
| `public/` | Original media, models, Draco decoder and WASM firmware |

Existing public URLs remain: `/`, `/work`, `/about`, `/contact`, `/projects/<slug>`, `/api/projects`, `/api/projects/<slug>`, `/api/health`.

## Visual direction

An off-white and ink palette, flat surfaces, fine rules, a static SVG dot field and clipped text reveals. Original robot geometry and firmware remain the focus. References: [Logomotion](https://www.logomotion.design/), [Magic UI dot pattern](https://magicui.design/docs/components/dot-pattern), [React Bits](https://reactbits.dev/get-started/index), [devl](https://devl.dev/components), [Aceternity](https://ui.aceternity.com/templates), and [21st](https://21st.dev/). The dot field and motion are implemented with SVG and the existing Framer Motion dependency.

## Performance and animation

Server Components, responsive optimized images, locally hosted variable fonts, prefetched links, package import optimization, revalidatable assets and the Turbopack analyzer keep the site lean. The Three.js viewer remains dynamically imported without server rendering. Its poster appears immediately while model/decoder downloads overlap loading. Dashboard-provided external images load directly in the browser; local images retain Next's AVIF/WebP optimization.

Original models, lighting, shadows, antialiasing, DPR, WASM gait/touch behavior, Framer Motion transitions, reduced-motion support and WebGL fallbacks are retained.

```bash
npm run analyze
```

## Verification

```bash
npm run lint
npm run type-check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests use a production server and an isolated test database. They cover public navigation, metadata, actual firmware animations and dashboard authentication/CRUD. Remote integration still requires real Turso credentials; local store tests exercise the shared SQL and initialization rules.

## Rebuilding models and firmware

```bash
npm run build:models  # needs Blender
npm run build:sim     # needs Emscripten; optional gltf-transform compression
```

See [simulation notes](scripts/sim/README.md), [Blender notes](scripts/blender/README.md), [quadruped rig](public/models/QUADRUPED_MODEL.md) and [YetiBot rig](public/models/YETIBOT_MODEL.md). Original firmware under `scripts/robotCode/` is required only to rebuild simulations. Committed runtime assets work without that toolchain.
