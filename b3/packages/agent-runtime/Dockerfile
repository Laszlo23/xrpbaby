# syntax=docker/dockerfile:1.6
# @bc/agent-runtime production image with periodic tick loop.
# Build from monorepo root (b3):
#
#   docker build -f packages/agent-runtime/Dockerfile -t buildingculture-agent-runtime:latest .

FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/contracts-sdk ./packages/contracts-sdk
COPY packages/proof ./packages/proof
COPY packages/agent-runtime ./packages/agent-runtime
COPY frontend/package.json ./frontend/
COPY frontend/prisma ./frontend/prisma
COPY ecorwa/package.json ./ecorwa/
COPY strapiapp/package.json ./strapiapp/

RUN npm ci

RUN npm run build -w @bc/contracts-sdk \
  && npm run build -w @bc/proof \
  && npm run build -w @bc/agent-runtime

FROM node:22-bookworm-slim AS runner
WORKDIR /app/packages/agent-runtime

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 agent \
  && useradd --system --uid 1001 --gid agent agent

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/contracts-sdk /app/packages/contracts-sdk
COPY --from=builder /app/packages/proof /app/packages/proof
COPY --from=builder /app/packages/agent-runtime/dist ./dist
COPY --from=builder /app/packages/agent-runtime/package.json ./package.json
COPY --from=builder /app/packages/agent-runtime/scripts/tick-loop.sh ./scripts/tick-loop.sh

RUN chmod +x ./scripts/tick-loop.sh && chown -R agent:agent /app

# Default agent graph (override with a bind mount at /app/ops/agents.json if needed)
COPY ops/agents.json /app/ops/agents.json
RUN chown -R agent:agent /app/ops

USER agent

# AGENTS_CONFIG_PATH=/app/ops/agents.json
ENV AGENTS_CONFIG_PATH=/app/ops/agents.json

ENTRYPOINT ["./scripts/tick-loop.sh"]
