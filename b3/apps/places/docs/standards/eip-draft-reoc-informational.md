# EIP-XXXX: Real Estate On Chain — Property Share Token (Informational)

**Status:** Draft (repository mirror; not submitted to Ethereum Magicians)  
**Type:** Informational  
**Author:** OG Chain maintainers  
**Created:** 2026-04-15

## Abstract

This EIP describes a **minimal on-chain interface** for an ERC-20 **property share token** bound to a single property record in a **registry** contract, plus conventions for **off-chain metadata** (REOC v1). It does **not** define legal ownership of real estate or securities compliance; those remain out of scope.

## Motivation

Wallets, explorers, and indexers need a **portable** way to recognize tokens that represent **fractional economic exposure** to a registered property and to discover **metadata** and **document commitments** without ad hoc per-project ABIs.

## Specification

Normative content is maintained in this repository as **REOC v1**:

- [reoc-v1.md](./reoc-v1.md) — full layered specification (L1–L4).
- [reoc-metadata-v1.json](../schemas/reoc-metadata-v1.json) — JSON Schema for metadata.

### On-chain (summary)

- Token MUST implement ERC-20 and expose `propertyId()`, `REGISTRY()`, `metadataURI()`, `supplyCap()`.
- Token MUST emit `PropertyShareDeployed` as defined in REOC v1 §3.3.
- Factories SHOULD emit `PropertyShareCreated` for indexing (REOC v1 §3.4).

### Off-chain (summary)

- Metadata at `metadataURI` SHOULD validate against REOC v1 L3 schema when conformance is claimed.

## Rationale

- **Immutability** of `propertyId` and `REGISTRY` prevents accidental rebinding after deployment.
- **supplyCap** with `0` = uncapped allows flexible tokenomics while supporting capped issuances.
- **Metadata URI** keeps heavy legal and media payloads off-chain while anchoring commitments on-chain where needed.

## Security considerations

- REOC does not guarantee **enforceable property rights** or **regulatory compliance**.
- Issuers MUST follow applicable law; see project [compliance.md](../compliance.md).

## Copyright

Copyright and related rights waived via CC0 1.0.

---

**Next steps for publication:** Post to [Ethereum Magicians](https://ethereum-magicians.org/) as an **Informational** EIP, assign a number after editor review, and link the canonical **JSON Schema** URI if hosted.
