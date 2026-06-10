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
RUN node -e "const fs=require('fs');const p='/repo/node_modules/@noble/hashes/package.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.exports=j.exports||{};const alias={ './sha3':'./sha3.js','./sha256':'./sha2.js','./sha512':'./sha2.js','./sha2':'./sha2.js','./utils':'./utils.js','./hmac':'./hmac.js' };for (const [k,v] of Object.entries(alias)) if(!j.exports[k]) j.exports[k]=v;fs.writeFileSync(p,JSON.stringify(j,null,2));"

RUN npm -w @bc/contracts-sdk run build \
  && npm -w @bc/wallet-kit run build \
  && npm -w @bc/identity run build \
  && npm -w @bc/proof run build \
  && npm -w @bc/registry run build \
  && npm -w @bc/bcc-kit run build \
  && npm -w @bc/culture-auth run build \
  && npm -w @bc/bcd-orchestration run build \
  && npm -w @bc/growth-intelligence run build

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

COPY --from=builder /repo/packages ./packages
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/app/node_modules ./node_modules_app
RUN if [ -d node_modules_app ]; then cp -a node_modules_app/. node_modules/ && rm -rf node_modules_app; fi
COPY --from=builder /repo/app/package.json ./package.json
COPY --from=builder /repo/app/dist ./dist
COPY --from=builder /repo/app/prisma ./prisma
COPY --from=builder /repo/app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /repo/app/scripts/serve-production.mjs ./scripts/serve-production.mjs

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "scripts/serve-production.mjs"]
