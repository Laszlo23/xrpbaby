# Agent LLM via 0G Compute (wallet-funded)

Building Culture agents (CEO orchestrator, Grove, social-scout) use **0G Compute Router** by default — not centralized OpenAI billing.

## Why 0G instead of OpenAI?

| | 0G Compute Router | OpenAI |
|--|-------------------|--------|
| Payment | **0G tokens** from wallet-funded on-chain balance | USD credit card / API invoice |
| Alignment | Same stack as our **Agent ID on 0G Chain** (`/0g/agentid`) | Off-ecosystem |
| API shape | OpenAI-compatible (`/v1/chat/completions`) | Native |
| Cost | ~90% cheaper per token (market-driven) | Centralized pricing |

OpenAI is **disabled by default** for agent-runtime. Set `AGENT_LLM_ALLOW_OPENAI_FALLBACK=1` only for emergency fallback.

## One-command setup

From repo root:

```bash
npm run setup:agent-0g
```

**If funding from Base ETH** (bridge + setup in one flow):

```bash
# 1. Send ≥0.015 ETH on Base to the deployer wallet (contracts/.env PRIVATE_KEY)
# 2. Run — opens Oku bridge link, polls balance, then runs setup
npm run complete:0g-agent
```

Headless APIs do not yet support Base → 0G in one shot; `complete:0g-agent` handles the one manual Oku bridge click, then automates deposit, Direct API key, migrate, build, and probe.

This script:

1. Merges 0G + Grove env defaults into `deploy/.env` and syncs to `app/.env`
2. Loads `OG_COMPUTE_ROUTER_API_KEY` from `.secrets/og-router-api-key` if present
3. **Direct fallback** (no Router key): configures `0g-compute-cli` from `contracts/.env` `PRIVATE_KEY`, deposits ≥3 0G, funds a provider, mints `OG_COMPUTE_DIRECT_*` keys
4. Starts local Postgres + runs Prisma migrations (agent orchestration tables)
5. Builds `@bc/agent-runtime` and probes inference

Verify anytime:

```bash
npm run probe:og-inference
```

## Setup (5 minutes)

1. Open [pc.0g.ai](https://pc.0g.ai) and connect the ops wallet (same wallet family as agent deployer/ops is fine).
2. **Deposit 0G tokens** to the Router payment layer (on-chain).
3. **Dashboard → API Keys → Create** — copy the `sk-…` key once.
4. Add to `deploy/.env`:

```bash
OG_COMPUTE_ROUTER_API_KEY=sk-your-key
OG_COMPUTE_NETWORK=mainnet
OG_COMPUTE_MODEL=zai-org/GLM-5-FP8
GROVE_LLM_ENABLED=1
AGENT_LLM_ALLOW_OPENAI_FALLBACK=0
```

5. Redeploy agent-runtime / web stack so env is loaded.

## Testnet

```bash
OG_COMPUTE_NETWORK=testnet
OG_COMPUTE_ROUTER_URL=https://router-api-testnet.integratenetwork.work/v1
```

Use [pc.testnet.0g.ai](https://pc.testnet.0g.ai) for deposits and keys.

## Code paths

| Component | File |
|-----------|------|
| Agent-runtime LLM | `packages/agent-runtime/src/llm/run.ts` → `og-compute.ts` |
| Grove copy refinement | `app/src/server/marketing/grove/copy.ts` → `app/src/server/llm/inference.ts` |
| Tool probe | `inference.0g` in agent tool registry |

## Low balance

Router returns `402 insufficient_balance`. Top up at pc.0g.ai → Deposit. CEO tick logs the error in `AgentActionLog`.

## Direct mode (wallet via CLI)

When you skip Router keys, `setup-agent-0g.sh` runs `scripts/setup-agent-0g-direct.mjs`:

- Writes `~/.0g-compute-cli/config.json` from `contracts/.env` `PRIVATE_KEY`
- Deposits **≥3 0G** into the compute ledger (contract minimum)
- Transfers 1 0G to the GLM-5 provider sub-account
- Sets `OG_COMPUTE_DIRECT_URL` (provider `/v1/proxy/chat/completions`) and `OG_COMPUTE_DIRECT_API_KEY` (`app-sk-…`)

Requires native **0G on 0G Chain** in the deployer wallet. If deposit fails with `insufficient funds`, fund the wallet then re-run setup.

## Direct mode (advanced — browser SDK)

For per-provider wallet signing in the browser, use 0G **Direct** flow with `@0gfoundation/0g-compute-ts-sdk`. Agent-runtime on VPS uses **Router** mode because it matches autonomous server agents (one key, auto failover, unified balance).

Docs: [0G Compute Router](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview)

## Related

- Agent ID contract: [0G_HACKATHON_JUDGE_README.md](./0G_HACKATHON_JUDGE_README.md)
- Treasury caps for agent wallets: [TREASURY_POLICY.md](./TREASURY_POLICY.md)
