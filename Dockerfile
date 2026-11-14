# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# MERN portfolio — npm workspaces monorepo.
#
#   client/   Vite + React + TypeScript SPA  -> static bundle
#   server/   Express + Mongoose API         -> serves the API and the bundle
#   scripts/  content sync (client data -> server bundled fallback)
#
# The runtime is Node: Express serves /api, the static build, and injects
# per-route SSR markup and metadata into index.html. Mongo is optional — without MONGODB_URI
# the API serves the bundled project content and the site is fully functional.
#
# Build:  docker build -t portfolio .
# Run:    docker run -p 6767:3000 portfolio
# ---------------------------------------------------------------------------


# --- base -------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false
# dumb-init reaps zombies and forwards signals, so the container stops cleanly.
RUN apk add --no-cache dumb-init


# --- deps -------------------------------------------------------------------
# Manifests only, so this layer is reused whenever just source code changed.
FROM base AS deps
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
# Fails loudly rather than silently falling back to a non-deterministic install.
RUN test -f package-lock.json || (echo "ERROR: package-lock.json is required for npm ci" >&2 && exit 1)
RUN npm ci --include=dev


# --- builder ----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY client ./client
COPY server ./server
COPY scripts ./scripts
ENV NODE_ENV=production
RUN npm run build -w client && npm run build -w server


# --- prod-deps --------------------------------------------------------------
# A second, clean install with devDependencies omitted. Building and running
# from the same tree would drag the whole toolchain into the runtime image.
FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
# The client's runtime dependencies are bundled into client/dist/server by
# Vite, so they are not needed in the production image.
RUN npm ci --omit=dev --workspace server --include-workspace-root \
    && npm cache clean --force


# --- runner -----------------------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    CLIENT_DIR=/app/client/dist

# Only what the process needs at runtime: production dependencies, the compiled
# server, and the static bundle. No source, no toolchain, no dev dependencies.
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder   --chown=node:node /app/server/dist ./server/dist
COPY --from=builder   --chown=node:node /app/client/dist ./client/dist
COPY --chown=node:node package.json ./
COPY --chown=node:node server/package.json ./server/

# node:alpine ships an unprivileged `node` user (uid 1000).
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"]
