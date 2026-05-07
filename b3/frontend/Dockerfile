# syntax=docker/dockerfile:1.6
# Building Culture — TanStack Start + Vite SSR (preview in production).
# Build needs VITE_* baked in: run `scripts/docker-build.sh` (copies .env → docker/dotenv-for-build).

FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# postinstall runs prisma generate — schema must exist before npm ci
COPY prisma ./prisma
RUN npm ci

COPY . .
# Injected by scripts/docker-build.sh before `docker build` (see .dockerignore)
COPY docker/dotenv-for-build .env
# SSR bundle is large; default Node heap (~2GB) OOMs on modest VPS.
RUN NODE_OPTIONS="--max-old-space-size=6144" npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="Building Culture Frontend"
LABEL org.opencontainers.image.description="TanStack Start + Vite — BUILDCHAIN web app"
LABEL org.opencontainers.image.vendor="Building Culture"

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs vite

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/prisma ./prisma
COPY scripts/serve-production.mjs ./scripts/serve-production.mjs
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh

RUN npx prisma generate \
  && chmod +x scripts/docker-entrypoint.sh \
  && chown -R vite:nodejs /app

USER vite

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
