# Trust and launch gates

Before routing significant user or issuer capital through the protocol, treat the following as **explicit gates** — not optional polish.

## Smart contracts

- **Independent security audit** of the deployed bytecode relevant to production (scope: DeFi stack, compliance, share tokens, sales contracts).
- **Bug bounty** (Immunefi or similar) with clear scope and payout tiers.
- **Monitoring** — indexer or subgraph for critical admin events, large transfers, and unusual pool movements; alerting to on-call operators.

## Product and legal

- **Securities / offering review** in each jurisdiction where you solicit investors; issuer documents and disclosures must match on-chain behaviour.
- **Privacy** — data handling for KYC providers and SIWE sessions aligned with `/legal/privacy`.

## Operations

- **Multisig** for admin roles (see [multisig-base-roles.md](./multisig-base-roles.md)).
- **Runbooks** for incident response, pausing or restricting flows if required by compliance or exploit suspicion.

## Marketing

Avoid promising outcomes that depend on deposit insurance or bank-style guarantees unless you have equivalent protections. Prefer transparent language: programmable compliance, auditable contracts, and issuer disclosures.
