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
# Receives the compiled bundle and the server config only: no node_modules,
# no sources, no toolchain, no package manager.
# ---------------------------------------------------------------------------
FROM nginx:1.29-alpine AS runner

ENV NODE_ENV=production

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Drop the stock sample site, hand the served files to the unprivileged user
# and fail the build early if the nginx config is invalid.
#
# `nginx -t` runs as root and leaves a root-owned pid file and temp dirs
# behind. /tmp is sticky, so uid 101 could not replace them at runtime — they
# must be removed in this same layer.
RUN rm -rf /etc/nginx/conf.d /usr/share/nginx/html/50x.html \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && nginx -t -c /etc/nginx/nginx.conf \
    && rm -rf /tmp/nginx.pid /tmp/nginx-*

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1

# Bypass the stock entrypoint scripts, which expect to run as root.
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
