# BC Studio — community app builder

BC Studio is Building Culture's Lovable-style creation tool: chat to build general-purpose web apps, preview in Docker sandboxes, export bundles, and publish to `{slug}.buildingcultureid.space`.

## Surfaces

| URL | Role |
|-----|------|
| `/studio` | Project gallery + new app |
| `/studio/{projectId}` | Chat + files + live preview |
| `studio.buildingcultureid.space` | Optional nginx alias to unified app `/studio` |

## Access (community gating)

- Privy auth + connected wallet
- Member `intent` = `build` **or** `supporterTier` founding/elder
- Free tier: **5 generations/day**; extra generations cost **10 Culture Points**
- Deploy: **50 BCC** fee recorded in `StudioUsage` (on-chain settlement follow-up)

## Architecture

```
Browser (/studio) → TanStack server fns → Postgres (projects/files/messages)
                                      ↘ studio-agent (LangChain tools)
                                      ↘ VPS orchestrator (:8790) → Docker sandboxes (:5100–5199)
Publish → npm run build in sandbox → CreateOS upload (optional) → nginx subdomain
```

## Operator setup

1. Build sandbox image:
   ```bash
   docker build -t bc-studio-sandbox:latest -f infra/studio-sandbox/Dockerfile infra/studio-sandbox
   ```
2. Run orchestrator on VPS:
   ```bash
   STUDIO_SANDBOX_SECRET=... STUDIO_WORK_ROOT=/var/lib/bc-studio node scripts/studio-orchestrator/index.mjs
   ```
3. Set in `deploy/.env`:
   - `STUDIO_SANDBOX_HOST=http://VPS_IP:8790`
   - `STUDIO_SANDBOX_SECRET`
   - `STUDIO_PREVIEW_ORIGIN=https://app.buildingcultureid.space`
   - `CREATEOS_API_BASE` + `CREATEOS_API_KEY` for publish
4. Nginx: `infra/nginx-studio-community-app.example.conf` per published slug

## Quests

| Slug | Reward |
|------|--------|
| `studio-first-app` | 50 CP — first project created |
| `daily-studio-build` | 25 CP — one generation per UTC day |

## Security

- Sandboxes: non-root, 512MB RAM, whitelisted npm commands only
- Agent cannot read `.env` or run destructive shell
- One active sandbox per project; idle cleanup on orchestrator restart (future: cron)

## Local dev

Without Docker orchestrator, studio UI works but preview returns `sandbox_not_configured`. Run orchestrator locally with Docker Desktop for full loop.
