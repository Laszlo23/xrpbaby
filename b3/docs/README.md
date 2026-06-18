# Building Culture docs index

Canonical docs for ecosystem strategy, operations, token utility, and agent growth.

Canonical product entrypoint: `https://app.buildingcultureid.space`.

## Start here

### Operators

- [ECOSYSTEM_GOALS_AND_ROADMAP.md](ECOSYSTEM_GOALS_AND_ROADMAP.md)
- [ECOSYSTEM_EXECUTION_BACKLOG.md](ECOSYSTEM_EXECUTION_BACKLOG.md)
- [GRANT_READINESS_PACK.md](GRANT_READINESS_PACK.md)
- [GRANT_SUBMISSIONS.md](GRANT_SUBMISSIONS.md)
- [INVESTOR_PROOF_PLAYBOOK.md](INVESTOR_PROOF_PLAYBOOK.md)
- [ATTRIBUTION_WEEKLY_SNAPSHOT.md](ATTRIBUTION_WEEKLY_SNAPSHOT.md)
- [RUNWAY_CONTROL_OPERATIONS.md](RUNWAY_CONTROL_OPERATIONS.md)
- [DOMAIN_CUTOVER.md](DOMAIN_CUTOVER.md)
- [GO_LIVE_COMMAND_PACK.md](GO_LIVE_COMMAND_PACK.md)
- [RELEASE_CAPTAIN_15MIN.md](RELEASE_CAPTAIN_15MIN.md)
- [MISSING_AND_FIXES.md](MISSING_AND_FIXES.md)
- [OBSERVABILITY.md](OBSERVABILITY.md)
- [INCIDENT_RUNBOOK.md](INCIDENT_RUNBOOK.md)

### Builders

- [protocol/README.md](protocol/README.md) — **BCID v1** protocol spec (identity, reputation, agent economy)
- [TRUST_LAYER.md](TRUST_LAYER.md) — live Culture ID trust layer
- [SMART_WALLET_AND_PACKS.md](SMART_WALLET_AND_PACKS.md)
- [BCC_TOKEN.md](BCC_TOKEN.md)
- [MARKET_API.md](MARKET_API.md)
- [ON_CHAIN_MARKETING_AGENT.md](ON_CHAIN_MARKETING_AGENT.md)
- [GROWTH_AUTOMATION_RUNBOOK.md](GROWTH_AUTOMATION_RUNBOOK.md)
- [AUTO_TRAFFIC_STRATEGY.md](AUTO_TRAFFIC_STRATEGY.md)
- [ECOSYSTEM_WALLETS.md](ECOSYSTEM_WALLETS.md)

### Partners

- [CHAINLINK_PARTNER_ONBOARDING.md](CHAINLINK_PARTNER_ONBOARDING.md)
- [CHAINLINK_RWA_COMPLIANCE.md](CHAINLINK_RWA_COMPLIANCE.md)
- [BCDAI_ECOSYSTEM.md](BCDAI_ECOSYSTEM.md)
- [TELEGRAM_MINIAPP_SETUP.md](TELEGRAM_MINIAPP_SETUP.md) — install script + local testing
- [TELEGRAM_MINIAPP_GO_LIVE.md](TELEGRAM_MINIAPP_GO_LIVE.md) — **go-live follow-up: status, gaps, checklist**
- [TELEGRAM_MINIAPP_TON_XRP.md](TELEGRAM_MINIAPP_TON_XRP.md)
- [ADDRESSES.md](ADDRESSES.md)

## Documentation governance

| Rule | Policy |
|-----|--------|
| Canonical naming | Use **BCC** for current token/product narrative. Use **BCD** only for historical contract/runbook context. |
| Canonical domain language | Use `app.buildingcultureid.space` as user-facing front door and keep ecosystem hosts under `*.buildingcultureid.space`. |
| Status tags | Every doc in the registry below is tagged `active`, `reference`, `legacy`, or `archive-candidate`. |
| Ownership | Product/strategy docs: growth + product owners. Ops docs: platform ops owner. Contract docs: protocol owner. |
| Review cadence | `active` docs reviewed monthly; `legacy`/`archive-candidate` reviewed quarterly. |
| Deprecation | Do not delete history. Add a top-line note (`Legacy context`) and point to the replacement doc. |

## Full document registry

| Doc | Category | Status | Description |
|-----|----------|--------|-------------|
| [ECOSYSTEM_GOALS_AND_ROADMAP.md](ECOSYSTEM_GOALS_AND_ROADMAP.md) | Strategy | active | North star, 90-day objectives, KPI scoreboard, review loop |
| [ECOSYSTEM_EXECUTION_BACKLOG.md](ECOSYSTEM_EXECUTION_BACKLOG.md) | Strategy | active | Prioritized execution tickets with owner, KPI linkage, and DoD |
| [GRANT_READINESS_PACK.md](GRANT_READINESS_PACK.md) | Strategy | active | Unified grant/investor verification pack, `grant:proof` workflow, and public `/grant-proof` lane |
| [GRANT_SUBMISSIONS.md](GRANT_SUBMISSIONS.md) | Strategy | active | Copy-paste submission pack for Base, 0G Guild, and ecosystem programs with contact + payout wallet |
| [INVESTOR_PROOF_PLAYBOOK.md](INVESTOR_PROOF_PLAYBOOK.md) | Strategy | active | Repeatable proof-bundle process for reliability, monetization, and investor updates |
| [ATTRIBUTION_WEEKLY_SNAPSHOT.md](ATTRIBUTION_WEEKLY_SNAPSHOT.md) | Strategy | active | Weekly funnel/agent attribution snapshot process for investor reporting |
| [RUNWAY_CONTROL_OPERATIONS.md](RUNWAY_CONTROL_OPERATIONS.md) | Strategy | active | Weekly runway report and cost-control operating process |
| [GO_LIVE_COMMAND_PACK.md](GO_LIVE_COMMAND_PACK.md) | Ops | active | Copy/paste staging + production command pack with reliability and proof gates |
| [RELEASE_CAPTAIN_15MIN.md](RELEASE_CAPTAIN_15MIN.md) | Ops | active | Timed release-captain checklist (T-30 to T+15), go/no-go gates, and handoff template |
| [PLATFORM_VOICE.md](PLATFORM_VOICE.md) | Strategy | active | Brand and tone rules for public and agent channels |
| [BCDAI_ECOSYSTEM.md](BCDAI_ECOSYSTEM.md) | Strategy | active | BCDAI integration and ecosystem placement |
| [NEXT_STEPS_UNIFIED_PLATFORM.md](NEXT_STEPS_UNIFIED_PLATFORM.md) | Strategy | reference | Platform consolidation execution notes |
| [bcd-product-map.md](bcd-product-map.md) | Strategy | legacy | Historical BCD-era product map; not canonical for current messaging |
| [MISSING_AND_FIXES.md](MISSING_AND_FIXES.md) | Ops | active | Open/fixed platform gaps and verification status |
| [DOMAIN_CUTOVER.md](DOMAIN_CUTOVER.md) | Ops | active | Domain cutover and canonical host behavior |
| [CROSS_DOMAIN_UNIFIED_ENTRY.md](CROSS_DOMAIN_UNIFIED_ENTRY.md) | Ops | active | Unified nginx entry topology |
| [UMBRELLA_DEPLOY.md](UMBRELLA_DEPLOY.md) | Ops | active | Umbrella deployment model |
| [BC_UMBRELLA_VERIFY.md](BC_UMBRELLA_VERIFY.md) | Ops | reference | Umbrella verification steps |
| [STAGING_CHECKLIST.md](STAGING_CHECKLIST.md) | Ops | active | Pre-deploy quality gates |
| [OBSERVABILITY.md](OBSERVABILITY.md) | Ops | active | Monitoring and service health anchors |
| [INCIDENT_RUNBOOK.md](INCIDENT_RUNBOOK.md) | Ops | active | Incident response playbook |
| [COMMUNITY_GUIDE_HOSTING.md](COMMUNITY_GUIDE_HOSTING.md) | Ops | reference | Hosting notes for community guide surfaces |
| [SUPABASE_ELIAS_SETUP.md](SUPABASE_ELIAS_SETUP.md) | Ops | reference | Elias setup and data integration |
| [PULSE_CRON.md](PULSE_CRON.md) | Pulse/social | active | Pulse ingest and digest cron operations |
| [PULSE_SOCIAL_APIS.md](PULSE_SOCIAL_APIS.md) | Pulse/social | active | Social API wiring and credentials |
| [ON_CHAIN_MARKETING_AGENT.md](ON_CHAIN_MARKETING_AGENT.md) | Pulse/social | active | Grove on-chain marketing agent operations |
| [GROWTH_AUTOMATION_RUNBOOK.md](GROWTH_AUTOMATION_RUNBOOK.md) | Pulse/social | active | Daily blog, SEO, and Grove cross-channel publishing ops |
| [AUTO_TRAFFIC_STRATEGY.md](AUTO_TRAFFIC_STRATEGY.md) | Pulse/social | active | Investor-ready auto-traffic loops, KPI board, and daily operator cadence |
| [X_SSH_SOCIAL_AGENT.md](X_SSH_SOCIAL_AGENT.md) | Pulse/social | reference | Official X posting automation on VPS |
| [FARCASTER_MINIAPP.md](FARCASTER_MINIAPP.md) | Pulse/social | reference | Farcaster miniapp integration details |
| [BCC_TOKEN.md](BCC_TOKEN.md) | Token/contracts | active | BCC utility, discounts, oracle/deploy patterns |
| [BCC_ROOTS_STAKING.md](BCC_ROOTS_STAKING.md) | Token/contracts | active | Culture Roots treasury staking — pools, keeper, deploy |
| [BCC_SOLANA_AND_ARBITRAGE.md](BCC_SOLANA_AND_ARBITRAGE.md) | Token/contracts | reference | Solana bridge and route context for BCC |
| [BCD_TOKENOMICS_LAUNCH.md](BCD_TOKENOMICS_LAUNCH.md) | Token/contracts | legacy | Historical launch mechanics and rounds |
| [BCD_PRELAUNCH_RUNBOOK.md](BCD_PRELAUNCH_RUNBOOK.md) | Token/contracts | legacy | Historical prelaunch checklist |
| [BCD_CORE_LAUNCH_AUDIT.md](BCD_CORE_LAUNCH_AUDIT.md) | Token/contracts | reference | Launch audit and execution evidence |
| [BCD_LAUNCH_AUDIT_AND_LP.md](BCD_LAUNCH_AUDIT_AND_LP.md) | Token/contracts | reference | LP and launch audit companion |
| [BCD_PAYER_WALLET.md](BCD_PAYER_WALLET.md) | Token/contracts | reference | Payer wallet/operator context |
| [CLANKER_LAUNCH_OPTIONS.md](CLANKER_LAUNCH_OPTIONS.md) | Token/contracts | reference | Alternate launch paths evaluation |
| [BCD_SEPOLIA_DEPLOY.md](BCD_SEPOLIA_DEPLOY.md) | Token/contracts | reference | Testnet deploy procedure |
| [TREASURY_POLICY.md](TREASURY_POLICY.md) | Treasury | active | Treasury policy and safeguards |
| [AGENT_FUNDING_RUNBOOK.md](AGENT_FUNDING_RUNBOOK.md) | Treasury | active | Agent funding operations |
| [ECOSYSTEM_WALLETS.md](ECOSYSTEM_WALLETS.md) | Treasury | active | Ecosystem wallet inventory and purpose |
| [MULTISIG_MIGRATION.md](MULTISIG_MIGRATION.md) | Treasury | reference | Multisig migration path |
| [AGS_DISTRIBUTION_POLICY.md](AGS_DISTRIBUTION_POLICY.md) | Treasury | reference | Distribution policy notes |
| [ADDRESSES.md](ADDRESSES.md) | Contracts/identity | active | Human-readable contract address index |
| [CONTRACTS_AUDIT.md](CONTRACTS_AUDIT.md) | Contracts/identity | active | Canonical contract and naming audit |
| [CONTRACTS_P0_STATUS.md](CONTRACTS_P0_STATUS.md) | Contracts/identity | reference | P0 contract status tracking |
| [contracts-hardening.md](contracts-hardening.md) | Contracts/identity | reference | Hardening checklists and notes |
| [EXTERNAL_AUDIT_BRIEF.md](EXTERNAL_AUDIT_BRIEF.md) | Contracts/identity | archive-candidate | Vendor brief; partially stale naming/contract labels |
| [IDENTITY_MINT_PRICE.md](IDENTITY_MINT_PRICE.md) | Identity | active | Identity mint price policy and ops |
| [IDENTITY_RESOLUTION.md](IDENTITY_RESOLUTION.md) | Identity | active | Name resolution behavior |
| [CULTURE_AUTH_FOUNDING.md](CULTURE_AUTH_FOUNDING.md) | Identity | reference | Founding auth integration |
| [SMART_WALLET_AND_PACKS.md](SMART_WALLET_AND_PACKS.md) | Identity | active | Privy wallet, packs, points, auth hub patterns |
| [ERC8004_AGENT_REGISTRY.md](ERC8004_AGENT_REGISTRY.md) | Identity/agents | reference | Agent registry and public card model |
| [BCD_AGENT_MONETIZATION.md](BCD_AGENT_MONETIZATION.md) | Agents/monetization | active | Attribution and x402 monetization path |
| [TRADING_AGENT_SUGAR.md](TRADING_AGENT_SUGAR.md) | Agents/monetization | active | Trading quote service integration |
| [MARKET_API.md](MARKET_API.md) | Agents/monetization | active | Market API contract |
| [CHAINLINK_RWA_COMPLIANCE.md](CHAINLINK_RWA_COMPLIANCE.md) | Partners/compliance | active | Compliance matrix for RWA surfaces |
| [CHAINLINK_PARTNER_ONBOARDING.md](CHAINLINK_PARTNER_ONBOARDING.md) | Partners/compliance | active | Chainlink onboarding track |
| [WORLD_MINI_APP.md](WORLD_MINI_APP.md) | Partners/ecosystem | reference | World mini app notes |
| [TELEGRAM_MINIAPP_SETUP.md](TELEGRAM_MINIAPP_SETUP.md) | Partners/ecosystem | active | BotFather install + local dev |
| [TELEGRAM_MINIAPP_GO_LIVE.md](TELEGRAM_MINIAPP_GO_LIVE.md) | Partners/ecosystem | active | Go-live follow-up: what works, gaps, growth checklist |
| [TELEGRAM_MINIAPP_TON_XRP.md](TELEGRAM_MINIAPP_TON_XRP.md) | Partners/ecosystem | active | Telegram Mini App launch plan with TON + phased XRP liquidity |
| [TELEGRAM_MINIAPP_API_CONTRACT.md](TELEGRAM_MINIAPP_API_CONTRACT.md) | Partners/ecosystem | active | Exact Telegram endpoint contract with quest and learning flows |
| [TELEGRAM_MINIAPP_IMPLEMENTATION_CHECKLIST.md](archive/TELEGRAM_MINIAPP_IMPLEMENTATION_CHECKLIST.md) | Partners/ecosystem | archive | File-by-file implementation checklist (superseded by API contract + rollout runbook) |
| [TELEGRAM_CONTROLLED_ROLLOUT_REPORT.md](archive/TELEGRAM_CONTROLLED_ROLLOUT_REPORT.md) | Partners/ecosystem | archive | Controlled Telegram go-live reporting template |
| [0G_HACKATHON_JUDGE_README.md](0G_HACKATHON_JUDGE_README.md) | Hackathon | reference | 0G judge walkthrough and repro |
| [0G_HACKATHON_SUBMISSION.md](0G_HACKATHON_SUBMISSION.md) | Hackathon | reference | 0G submission package |
| [0G_HACKATHON_VIDEO_AND_X.md](archive/0G_HACKATHON_VIDEO_AND_X.md) | Hackathon | archive | 0G demo + social packaging |
| [HACKQUEST_SUBMIT_NOW.md](HACKQUEST_SUBMIT_NOW.md) | Hackathon | reference | HackQuest submission checklist |
| [STRAPI_HARDENING.md](STRAPI_HARDENING.md) | Security | reference | Strapi hardening guide |

## App and infra references

| Doc | Description |
|-----|-------------|
| [../app/README.md](../app/README.md) | Local app development and environment |
| [../app/MANUAL_QA_CHECKLIST.md](../app/MANUAL_QA_CHECKLIST.md) | Manual QA before release |
| [../app/e2e/README.md](../app/e2e/README.md) | End-to-end smoke test guidance |
| [../infra/nginx-unified-entry.example.conf](../infra/nginx-unified-entry.example.conf) | Unified nginx example |
| [../onboarding/DEPRECATED.md](../onboarding/DEPRECATED.md) | Retired onboarding app context |
