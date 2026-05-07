# syntax=docker/dockerfile:1.6
# Strapi 5 production image. Build from monorepo root (b3), not from strapiapp/:
#
#   docker build -f strapiapp/Dockerfile -t buildingculture-strapi:latest .
#
# Requires workspace package.json stubs for npm ci (frontend + ecorwa paths).

FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages ./packages
COPY strapiapp ./strapiapp
COPY frontend/package.json ./frontend/
# frontend postinstall runs `prisma generate` — schema must exist for root `npm ci`
COPY frontend/prisma ./frontend/prisma
COPY ecorwa/package.json ./ecorwa/

RUN npm ci

RUN npm run build -w @bc/identity

WORKDIR /app/strapiapp
ENV NODE_ENV=production
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 strapi \
  && useradd --system --uid 1001 --gid strapi strapi

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/strapiapp ./strapiapp
COPY --from=builder /app/frontend/package.json ./frontend/
COPY --from=builder /app/ecorwa/package.json ./ecorwa/

RUN chown -R strapi:strapi /app

USER strapi

EXPOSE 1337

# Strapi listens on 0.0.0.0:PORT (default 1337)
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -fsSL "http://127.0.0.1:${PORT:-1337}/admin" -o /dev/null || exit 1

WORKDIR /app
CMD ["npm", "run", "start", "-w", "buildingculture-strapi"]
