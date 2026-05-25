# REOC v1 — Real Estate On Chain

**Version:** 1.0.0  
**Status:** Normative (this repository)  
**Scope:** Technical interoperability for **fractional economic exposure** to a registered property via an EVM **property share token**. This is **not** legal title to real estate and **not** securities advice; see [compliance.md](../compliance.md).

---

## 1. Document map

| Layer | Topic | Sections |
|-------|--------|----------|
| **L1** | Property identity and registry commitments | §2 |
| **L2** | Property share token (on-chain interface + events) | §3 |
| **L3** | Off-chain metadata JSON | §4, [JSON Schema](../schemas/reoc-metadata-v1.json) |
| **L4** | Compliance and transfer profiles (optional) | §5 |

**Solidity:** [`IPropertyShareToken`](../../src/interfaces/IPropertyShareToken.sol), [`PropertyShareFactory`](../../src/PropertyShareFactory.sol).  
**Examples:** [`../examples/reoc-metadata-v1-valid.json`](../examples/reoc-metadata-v1-valid.json), [`../examples/reoc-metadata-v1-invalid.json`](../examples/reoc-metadata-v1-invalid.json).

---

## 2. L1 — Identifiers and registry

### 2.1 Canonical property identity

A **REOC property instance** is identified by:

| Field | Type | Rule |
|-------|------|------|
| `chainId` | EIP-155 integer | Network where the registry lives (e.g. `16602` for 0G Galileo testnet). |
| `registry` | `address` | `PropertyRegistry` (or compatible) contract. MUST be checksummed in JSON. |
| `propertyId` | `uint256` | MUST exist in `registry` before a share token is created for that property. |

### 2.2 External reference (optional)

| Field | Type | Rule |
|-------|------|------|
| `externalRefHash` | `bytes32` | `keccak256` of a jurisdiction-specific opaque string (e.g. county + APN). Plaintext parcel IDs MUST NOT be stored on-chain in REOC L1-compliant registries that follow this profile. |

### 2.3 Document commitments

Large blobs (PDFs, imagery) live off-chain (IPFS, HTTPS, object storage, 0G Storage). **Commitments** to those blobs MAY be stored on-chain as `bytes32` roots or via registry document APIs. Human-readable document kinds in app code SHOULD map to stable `bytes32` labels (e.g. `keccak256("DEED")`). The chain stores opaque hashes; semantics are in metadata and off-chain policy.

---

## 3. L2 — Property share token

### 3.1 Purpose

A **REOC v1 property share token** is an **ERC-20** that represents **fractional exposure** to economics tied to one registry row. It MUST be usable with standard wallets, approvals, and DEX routers unless an L4 profile restricts transfers.

### 3.2 Required interface

Implementations MUST expose **ERC-20** (`IERC20`) and the following (see [`IPropertyShareToken`](../../src/interfaces/IPropertyShareToken.sol)):

| Function | Rule |
|----------|------|
| `propertyId()` | Returns the `uint256` property id; immutable after deploy. |
| `REGISTRY()` | Returns the immutable registry `address` for this deployment. |
| `metadataURI()` | Returns a URI for REOC L3 JSON (may be updatable per implementation; document in deployment notes). |
| `supplyCap()` | `0` = uncapped; else `totalSupply() <= supplyCap` at all times. |

### 3.3 Required event (deployment)

On construction, implementations MUST emit:

```text
PropertyShareDeployed(uint256 indexed propertyId, address indexed token, address indexed registry, string metadataURI, uint256 supplyCap)
```

### 3.4 Factory discovery (indexing)

Factories SHOULD emit a single event so indexers can map `propertyId` → `token` without tracing bytecode:

```text
PropertyShareCreated(uint256 indexed propertyId, address indexed token, address indexed registry, string metadataURI, uint256 supplyCap)
```

Subgraph or indexer SHOULD index: `chainId`, `registry`, `propertyId`, `token`, `metadataURI`, `supplyCap`.

### 3.5 Minting

Implementations MAY use OpenZeppelin `AccessControl` with **MINTER_ROLE** (or equivalent). Minted amount MUST respect `supplyCap` when non-zero.

---

## 4. L3 — Metadata JSON

### 4.1 URI

`metadataURI()` MUST resolve to a document that validates against [**reoc-metadata-v1.json**](../schemas/reoc-metadata-v1.json) when the issuer claims REOC v1 conformance.

### 4.2 Required fields

See the schema. Minimum concepts:

- `reocVersion`: `"1.0.0"`
- `title`, `propertyId` (string decimal), `registry`, `chainId`
- `jurisdiction` (ISO-like region code, e.g. `US-CA` or national scheme agreed off-chain)
- `documents[]` with `kind` and `uri` and/or `storageRoot`

### 4.3 Privacy

MUST NOT place PII or full legal descriptions required to be private into **public** unencrypted metadata. Prefer hashes and gated storage URIs where appropriate.

---

## 5. L4 — Compliance and transfer profiles

REOC v1 **does not** mandate a single compliance engine. Conformant deployments declare one of:

| Profile | Description |
|---------|-------------|
| **A — Open** | ERC-20 transfers unrestricted (subject to local law off-chain). |
| **B — Restricted** | Transfers gated by an on-chain **ComplianceRegistry** (or equivalent); see [`RestrictedPropertyShareToken`](../../src/RestrictedPropertyShareToken.sol) in this repo. |
| **C — Wrapper / security token** | Underlying REOC-compatible token wrapped by ERC-3643-style or custom module; wrapper MUST preserve discoverability of `propertyId` / `REGISTRY` via interface or registry. |
| **D — Chainlink ACE** | Profile D: uRWA surface, `IComplianceBackend`, DTA subscribe/redeem, NAV + PoR feeds — see [chainlink-alignment-v1.md](./chainlink-alignment-v1.md). |

---

## 6. Multi-chain

The same **logical** property MAY be referenced on multiple chains only by **explicit** bridging policy (not defined here). Metadata MUST include `chainId` and `registry` for the deployment it describes. Indexers MUST NOT assume cross-chain `propertyId` equality without a declared bridge mapping.

---

## 7. Conformance checklist

Implementers claiming **REOC v1** conformance MUST:

- [ ] Deploy share tokens only for `propertyId` that exist in the declared `REGISTRY`.
- [ ] Implement L2 interface and `PropertyShareDeployed` (and factory `PropertyShareCreated` if using a factory).
- [ ] Provide L3 metadata validating against `reoc-metadata-v1.json` at `metadataURI` when the token is marketed as REOC v1.
- [ ] Document L4 profile (A/B/C) for transfers.
- [ ] Avoid claiming legal title or guaranteed returns in technical specs; link [compliance.md](../compliance.md) in issuer-facing docs.

---

## 8. Governance of this spec

- **Maintainers:** This repository’s maintainers; changes via pull request to `docs/standards/`.
- **Versioning:** **SemVer** for REOC (`MAJOR.MINOR.PATCH`). Breaking L2 or L3 shape → major bump. New optional metadata fields → minor.
- **EIP track:** An informational Ethereum draft may mirror L2/L3; see [eip-draft-reoc-informational.md](./eip-draft-reoc-informational.md).

---

## 9. Relationship to existing docs

- **[token-standard.md](../token-standard.md)** — Implementation name **og-RE-share**; defers normative rules to this document.
- **[domain-model.md](../domain-model.md)** — Storage and escrow narrative; L1 aligns with §2 here.
- **[compliance.md](../compliance.md)** — Legal and operational checklist; referenced by §0 and §7.
