# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache dumb-init

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 DATABASE_PATH=/app/data/portfolio.sqlite
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:3000/api/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
