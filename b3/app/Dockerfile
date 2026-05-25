# syntax=docker/dockerfile:1.6
# Building Culture — TanStack Start + Vite SSR (preview in production).
# Build needs VITE_* baked in: run `scripts/docker-build.sh` (copies .env → docker/dotenv-for-build).

FROM node:22-bookworm-slim AS builder
WORKDIR /repo

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY app/package.json app/package-lock.json ./app/
COPY packages ./packages
COPY app/prisma ./app/prisma
COPY content ./content
RUN npm ci --legacy-peer-deps

RUN npm -w @bc/contracts-sdk run build \
  && npm -w @bc/wallet-kit run build \
  && npm -w @bc/identity run build \
  && npm -w @bc/proof run build \
  && npm -w @bc/registry run build

COPY app ./app
COPY app/docker/dotenv-for-build ./app/.env
ARG NODE_MAX_OLD_SPACE=4096
WORKDIR /repo/app
RUN NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE}" npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="Building Culture App"

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /repo/app/package.json ./package.json
COPY --from=builder /repo/app/node_modules ./node_modules
COPY --from=builder /repo/app/.output ./.output
COPY --from=builder /repo/app/prisma ./prisma
COPY --from=builder /repo/app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "scripts/serve-production.mjs"]
