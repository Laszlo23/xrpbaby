# Economics and fee schedule (reference)

Figures below are **defaults for product documentation** and match [`web/src/lib/protocol-fees.ts`](../web/src/lib/protocol-fees.ts). On-chain fee switches must respect any **timelock** policy you publish.

## Revenue streams

| Stream | Recipient | Notes |
|--------|-----------|------|
| Primary issuance | Protocol treasury | Applied when issuer sells shares through integrated primary paths; exact % in fee config. |
| Secondary trading | Protocol treasury | AMM / router fee tier; typically competes with DEX norms. |
| SaaS / operator tools | Company (offchain) | Optional subscription; disclose in Terms. |
| Property rent & exit | SPV / legal entity | Per offering docs; **not** the platform token unless explicitly structured. |

## Treasury policy (recommended)

- Hold protocol fees in a **Base Safe multisig** with published signers.
- **Fee cap**: document a maximum protocol take; larger changes require **notice period** (see `feeChangeNoticeDays` in code).
- **Founder alignment**: team token allocations (if any) use **vesting**; no hidden mint after deployment for fixed-supply settlement tokens.

## Company vs protocol

**Company equity** (SAFE, priced round) funds engineering, hosting, and marketing with **investor protections** defined in securities documents. **Protocol fees** fund ongoing onchain operations and liquidity programs. Keep accounting and disclosures separate.
