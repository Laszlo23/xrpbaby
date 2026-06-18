# XRPL treasury rail (testnet)

> **Status:** Phase 3 demo on XRPL Testnet only. Mainnet settlement requires counsel + multisig policy.

Building Culture is **not** an XRP project. XRPL is optional infrastructure under Culture ID and investor diligence — same framing as [TRUST_LAYER.md](./TRUST_LAYER.md).

## Scope (this release)

| Capability | Testnet | Mainnet |
|------------|---------|---------|
| Culture ID wallet link (`/credentials`) | Yes (verified link) | Display when configured |
| Investor intake address published | Yes | No (default) |
| Live balance on `/investors` | Yes | When configured + counsel |
| Quote API (`/api/market/xrp-quote`) | Yes | Flag-gated |
| Settlement / RLUSD | No | Not enabled |

## Environment

```bash
XRPL_NETWORK=testnet
XRPL_RPC_URL=wss://s.altnet.rippletest.net:51233
XRPL_TREASURY_INTAKE_ADDRESS=r...   # fund via https://faucet.altnet.rippletest.net/
XRPL_QUOTE_ENABLED=1
XRPL_EXECUTION_ENABLED=1            # only honored on testnet/devnet
```

**Guard:** `isXrplExecutionAllowed()` returns `false` on `mainnet` even if `XRPL_EXECUTION_ENABLED=1`. See `app/src/lib/xrpl-env.ts`.

## APIs

| Route | Purpose |
|-------|---------|
| `GET /api/investors/treasury-balances` | Labeled Base + XRPL wallet balances |
| `GET /api/investors/xrpl-intake` | Testnet intake status + recent payments |
| `GET /api/credentials/xrpl/challenge` | Link XRPL to Culture ID |
| `POST /api/credentials/xrpl/link` | Store linked XRPL address |

## Wallet separation

- **Base Gnosis Safe** — protocol treasury (canonical). See [TREASURY_POLICY.md](./TREASURY_POLICY.md).
- **XRPL testnet intake** — demo rail only; never mix with operating float without board/counsel approval.
- **No private keys** in repo — testnet wallet funded via public faucet.

## Mainnet gate (future)

Before enabling mainnet XRPL:

1. Counsel memo on securities / money transmission
2. Multisig or custodian policy documented
3. Set `XRPL_NETWORK=mainnet` with `XRPL_EXECUTION_ENABLED=0` until explicit approval
4. Update [ECOSYSTEM_WALLETS.md](./ECOSYSTEM_WALLETS.md) and `/investors` disclaimers

## Investor narrative

> We publish labeled treasury wallets and live Base balances. XRPL Testnet demonstrates a second stablecoin-friendly rail as banks adopt on-chain USD — infrastructure under Culture ID, not a pivot to XRP.

See [TRUST_LAYER_ANNOUNCEMENTS.md](./TRUST_LAYER_ANNOUNCEMENTS.md).
