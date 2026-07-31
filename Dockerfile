# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Vite + React portfolio.
#
# Repository layout this file is written against:
#
#   ./package.json          ./index.html         ./vite.config.js
#   ./package-lock.json     ./eslint.config.js
#   ./docker/nginx.conf     <- runtime web server config
#   ./public/               <- static assets copied verbatim (penguin.png,
#                              icons/, projectImages/)
#   ./src/                  <- main.jsx, App.jsx, index.css, components/
#
# `npm run build` emits a folder of static files, so the runtime stage is a
# web server, not Node. node:alpine builds; nginx:alpine serves.
#
# ---------------------------------------------------------------------------
# Build-time configuration
#
# src/components/contact.jsx reads `import.meta.env.VITE_FORMSPREE_ID`. Vite
# inlines that value into the JS bundle **at build time**, so it cannot be
# supplied when the container starts — it must be passed to `docker build`:
#
#   docker build --build-arg VITE_FORMSPREE_ID=<your-form-id> -t portfolio .
#
# No default is invented here. If it is omitted the site still builds and
# serves; only the contact form is inert, and the build says so loudly.
# No .env file is created, read, or copied.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Stage 1 — dependencies
# Manifests are copied alone so this layer is reused whenever only source
# code changed.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# package-lock.json is present, so npm is the package manager and `npm ci`
# installs exactly what the lockfile pins. devDependencies are required:
# vite and @vitejs/plugin-react-swc are what perform the build.
RUN npm ci --include=dev


# ---------------------------------------------------------------------------
# Stage 2 — build
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build

ARG VITE_FORMSPREE_ID=""

ENV NODE_ENV=production \
    VITE_FORMSPREE_ID=${VITE_FORMSPREE_ID}

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Only what `vite build` actually reads. eslint.config.js is deliberately
# excluded — linting is a CI step, not part of producing the bundle.
COPY package.json package-lock.json ./
COPY vite.config.js index.html ./
COPY public ./public
COPY src ./src

RUN if [ -z "$VITE_FORMSPREE_ID" ]; then \
    echo "=====================================================================" >&2; \
    echo " WARNING: VITE_FORMSPREE_ID was not passed to the build." >&2; \
    echo " The site will build and serve, but the contact form cannot submit." >&2; \
    echo " Pass it with: docker build --build-arg VITE_FORMSPREE_ID=<id> ." >&2; \
    echo "=====================================================================" >&2; \
    else \
    echo "VITE_FORMSPREE_ID supplied — contact form enabled."; \
    fi; \
    npm run build

# ---------------------------------------------------------------------------
# Stage 3 — runtime
# Caddy serves the compiled Vite bundle. No Node, source code, or node_modules.
# ---------------------------------------------------------------------------
FROM caddy:2-alpine AS runner

ENV NODE_ENV=production

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

# Port 9866 is non-privileged, so Caddy can run as its unprivileged user.
RUN chown -R caddy:caddy /srv /config /data

USER caddy

EXPOSE 9866

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:9866/healthz || exit 1

ENTRYPOINT []

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]