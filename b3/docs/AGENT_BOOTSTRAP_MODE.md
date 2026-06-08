# Agent bootstrap (0G bridge blocked)

Use this when **0G Compute is unfunded** but agents must run and earn.

## One command

```bash
npm run bootstrap:agents
```

Sets in `deploy/.env`:

| Var | Value | Why |
|-----|-------|-----|
| `AGENT_BOOTSTRAP_MODE` | `1` | Enables auto LLM routing |
| `AGENT_LLM_PROVIDER` | `auto` | 0G if configured, else OpenAI |
| `AGENTS_PAUSED` | `0` | Fleet ticks run |
| `ECON_LIVE` | `0` | On-chain AGS mint stays gated (`VERIFY_GATE.md`) |

Redeploy **agent-runtime** + **web** after bootstrap so production picks up env.

## Revenue stack (works without 0G)

| Agent | Makes money by… |
|-------|-----------------|
| **grove-marketing-1** | Proof-first X/Farcaster → `/join`, `/pass`, BCC funnel |
| **social-scout-1** | X replies + posts → qualified builder traffic |
| **x402-monetizer-1** | Tracks `/api/x402/premium` settlements → MRR estimate in Slack |
| **ceo-orchestrator-0** | Queues grove_tick, social_burst, x402_report from KPIs |

**x402:** Configure `X402_PRICE`, facilitator, and thirdweb secret in deploy env — see `app/src/server/x402-premium.ts`.

**Grove:** Cron or `npm run grove:tick` on app host (`GROVE_TICK_URL`).

## LLM cost

OpenAI `gpt-4o-mini` via existing `OPENAI_API_KEY`. Daily caps per agent in `ops/agents.json` (`dailyApiBudgetUsd`).

Probe:

```bash
npm run probe:openai-inference
```

## Return to 0G later

When 0G is funded (direct transfer or Router key from pc.0g.ai):

```bash
# deploy/.env
AGENT_BOOTSTRAP_MODE=0
AGENT_LLM_PROVIDER=0g
AGENT_LLM_ALLOW_OPENAI_FALLBACK=0
npm run setup:agent-0g
```

0G **Agent ID** on chain `16661` is unchanged — only LLM billing moves back to wallet-funded compute.
