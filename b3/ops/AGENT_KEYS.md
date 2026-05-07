# Agent wallet keys (v0)

## Generate

One run creates a **single BIP39 mnemonic** and derives **two** Ethereum accounts (`m/44'/60'/0'/0/0` = operator, `/1` = `ags-distributor-1`).

```bash
node b3/scripts/generate-agent-wallets.mjs
```

Write to a **gitignored** file (recommended; never paste keys in chat):

```bash
node b3/scripts/generate-agent-wallets.mjs --write-secrets
# → b3/.secrets/agent-wallets.txt
```

Copy the **operator** and **ags-distributor** addresses from that file. Fund the **operator** (~0.05 ETH on Base for Phase 0). Fund the distributor when `ECON_LIVE=1` (mint `value` + gas per recipient).

Treat the **operator** as the default **HotOps** wallet (limited float) for agent operations on Base.
Funding should follow `docs/AGENT_FUNDING_RUNBOOK.md` and be recorded in `ops/SAFE_REFILL_LOG.md` (addresses/tx hashes only; never secrets).

## Optional: encrypt with `age`

```bash
export AGE_RECIPIENT=age1…   # your age public key
node b3/scripts/generate-agent-wallets.mjs --encrypt > wallets.age
sudo install -m 600 wallets.age /etc/bc-agents/wallets.age
```

On the server, decrypt at boot into a root-only env file (avoid logging):

```bash
age -d -i /root/.config/age/keys.txt /etc/bc-agents/wallets.age | while read -r line; do …
```

## Rotation

1. Generate new keys, update `/etc/bc-agent-tick.env`.
2. Restart `bc-agent-tick.timer`.
3. Revoke old keys on-chain if they held roles (none today beyond NFT ownership).

## Phase 2

Move to **Turnkey** or **Privy** server wallets with policy engine and audit exports.
