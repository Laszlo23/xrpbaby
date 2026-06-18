# Audit Baseline — Building Culture (b3)

Established: 2026-06-18. Refresh with `npm run audit:gate -- --write-scorecard`.

## Summary

| Area | Status | Owner | Notes |
|------|--------|-------|-------|
| App unit tests | pass | platform | Includes `admin-secret`, `siwe`, `xrpl-link-env` auth tests |
| Auth hardening pass | pass | security | SIWE nonce on payouts, credential claim, admin fail-closed, Privy binding — see `SECURITY_AUDIT.md` |
| App Playwright | pass | platform | ~87 specs; flows in `app/e2e/flows/` |
| Root contracts forge | pass | contracts | 50 tests |
| Places forge | pass | places | 42+ tests |
| Identity forge | pass | identity | 9 tests |
| Art forge | pass | art | 3 tests |
| Package tests | pass | platform | agent-runtime, bcc-kit, culture-auth, support-score |
| npm audit | warn | security | WalletConnect/Reown transitive moderates — see `SECURITY_AUDIT_EXCEPTIONS.json` |
| Slither | warn | contracts | Run `npm run slither`; install via `pip install slither-analyzer` |
| External audit | fail | leadership | Not yet published — see `docs/EXTERNAL_AUDIT_PACKAGE/` |
| Grant verify (prod) | pass/warn | ops | Trading health + Grove optional channels may warn |
| Backtest suite | pass | platform | `npm run backtest` |
| Security scan | pass/warn | security | `npm run security:scan` |

## Known exceptions (honest scope)

- `/api/trading/health` — warn until trading sidecar deployed
- Grove X/Farcaster — warn until credentials set
- `ECON_LIVE=0` — economics gated per [`deploy/VERIFY_GATE.md`](../deploy/VERIFY_GATE.md)
- `CI_WALLET_E2E=1` — on-chain wallet specs (Anvil) optional in CI

## Commands

```bash
npm run audit:gate              # Full local gate
npm run audit:gate -- --skip-e2e # Faster (unit + forge + backtest + security)
npm run backtest                # Economic logic replay tests
npm run security:scan           # npm audit + gitleaks (if installed)
npm run grant:verify            # Production diligence matrix
npm run test-gate:snapshot      # Refresh TEST_GATE_SNAPSHOT.json
```

## Next review

Weekly cron via `.github/workflows/audit-gate.yml` or before grant submissions (`npm run grant:proof`).
