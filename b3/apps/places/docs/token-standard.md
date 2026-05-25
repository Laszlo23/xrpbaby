# OG Property Share Token (og-RE-share)

This repository implements **REOC v1** — the **Real Estate On Chain** standard for a property-backed ERC-20. The **normative specification** is:

**[standards/reoc-v1.md](./standards/reoc-v1.md)**

Use that document for layers L1 (registry identity), L2 (token interface and events), L3 (metadata JSON), and L4 (compliance profiles). This page summarizes the implementation name **og-RE-share** and points to source files.

## Quick reference

- **Not legal title** — see [compliance.md](./compliance.md).
- **Interface:** [`src/interfaces/IPropertyShareToken.sol`](../src/interfaces/IPropertyShareToken.sol) (REOC v1 §3).
- **Metadata schema:** [`schemas/reoc-metadata-v1.json`](./schemas/reoc-metadata-v1.json).
- **Factory event for indexers:** `PropertyShareCreated` — [`PropertyShareFactory.sol`](../src/PropertyShareFactory.sol).

## Implementation notes

| Topic | Location |
|--------|----------|
| ERC-20 + `propertyId` / `REGISTRY` / `metadataURI` / `supplyCap` | `PropertyShareToken.sol`, `RestrictedPropertyShareToken.sol` |
| Minting | `MINTER_ROLE`; cap enforced when `supplyCap > 0` |
| KYC-gated transfers | `RestrictedPropertyShareToken` + `ComplianceRegistry` (REOC L4 profile B) |

## Deprecated duplication

Older sections of this file that repeated MUST/SHOULD rules have been **consolidated into REOC v1**. If anything here conflicts with `reoc-v1.md`, **reoc-v1.md** wins.
