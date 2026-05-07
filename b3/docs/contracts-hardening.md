# Contracts hardening checklist

Operational checklist for **Building Culture** Solidity in [`contracts/`](../contracts/). This is **not** a substitute for a professional audit.

## Automated tests (local)

From repo root:

```bash
cd contracts && forge test
```

Run before releases that touch `src/` or deploy scripts.

## Deployed stack review

When addresses are in production, verify against explorer:

| Contract | Env keys | Risk notes |
|----------|----------|------------|
| **RaffleTicketCampaign** | `VITE_RAFFLE_CAMPAIGN_ADDRESS` | Mint caps, treasury, BCD approval paths if enabled |
| **BuildingCultureDollar** | `VITE_BCD_TOKEN_ADDRESS` | Mint authority, cap, pause |
| **BCDGenesisClaim** | `VITE_BCD_GENESIS_MERKLE_ROOT_HEX`, claim fee | Merkle root rotation, fee recipient |
| **BCDFixedPriceSale** | `VITE_BCD_SALE_ADDRESS`, `VITE_BCD_SALE_ROUND_ID`, optional `VITE_BCD_SALE_ELIGIBILITY_BASE` | Round windows, merkle roots, fee bps, pause, payment token (ETH vs ERC-20) |

## Deferred (hub lane)

Do **not** deploy hub equity / revenue-share style contracts until:

- Treasury entity and disclosures are clear.
- [`bcd-product-map.md`](bcd-product-map.md) roadmap items are prioritized.

Track ideas like HubMembership / vaults in product specs first.

## Ops

- Rotate deploy keys if leaked; never commit `.env` with `PRIVATE_KEY`.
- Prefer multisig for ownership transfers post-deploy.
