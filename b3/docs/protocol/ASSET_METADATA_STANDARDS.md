# BCID Asset Metadata Standards

Metadata schemas for Asset BCID types. Launch Month 5; standards defined Month 1.

Extends Places [`PropertyShareProof`](../../apps/places/src/PropertyShareProof.sol) patterns.

---

## Common envelope

All Asset BCIDs share:

```json
{
  "version": "1.0",
  "assetType": "house | car | watch | business | certificate",
  "bcidDid": "did:bcid:asset:{uuid}",
  "ownerBcidDid": "did:bcid:human:{uuid} | did:bcid:company:{uuid}",
  "title": "string",
  "description": "string",
  "images": ["ipfs://..."],
  "ownershipProof": {
    "type": "title_hash | oracle_attestation | nft_link",
    "ref": "string",
    "verifiedAt": "ISO8601"
  },
  "jurisdiction": "ISO3166-1 alpha-2",
  "createdAt": "ISO8601"
}
```

---

## House

```json
{
  "assetType": "house",
  "property": {
    "address": { "street": "", "city": "", "postalCode": "", "country": "" },
    "sqm": 120,
    "yearBuilt": 1990,
    "propertyId": "places:{id}"
  },
  "legal": {
    "titleDeedHash": "sha256:...",
    "lienStatus": "none | encumbered"
  },
  "placesLink": {
    "shareContract": "0x...",
    "proofNft": "PropertyShareProof tokenId"
  }
}
```

Aligns with Places REOC profile.

---

## Car

```json
{
  "assetType": "car",
  "vehicle": {
    "vinHash": "sha256:... (VIN never stored plaintext)",
    "make": "string",
    "model": "string",
    "year": 2024,
    "odometerKm": 15000
  },
  "registration": {
    "jurisdiction": "DE",
    "registrationHash": "sha256:..."
  }
}
```

---

## Watch

```json
{
  "assetType": "watch",
  "timepiece": {
    "brand": "string",
    "model": "string",
    "serialHash": "sha256:...",
    "manufactureYear": 2020,
    "certificateOfAuthenticityHash": "sha256:..."
  },
  "provenance": [
    { "event": "manufacture | sale | service", "date": "ISO8601", "ref": "string" }
  ]
}
```

---

## Business

```json
{
  "assetType": "business",
  "business": {
    "legalName": "encrypted or public per owner choice",
    "registrationNumberHash": "sha256:...",
    "industry": "NAICS code",
    "foundedYear": 2018,
    "website": "https://..."
  },
  "companyBcidDid": "did:bcid:company:{uuid}"
}
```

Links to Company BCID when both exist.

---

## Certificate

```json
{
  "assetType": "certificate",
  "certificate": {
    "issuerName": "string",
    "programName": "string",
    "issuedToHash": "sha256:... (name hash)",
    "issuedAt": "ISO8601",
    "expiresAt": "ISO8601 | null",
    "credentialHash": "sha256:... (document hash)"
  },
  "verification": {
    "issuerDid": "did:bcid:company:{uuid}",
    "easAttestationUid": "0x... optional"
  }
}
```

Immutable storage recommended: Arweave per [STORAGE_ARCHITECTURE.md](../architecture/STORAGE_ARCHITECTURE.md).

---

## Onchain tokenURI

Asset BCID NFT `tokenURI` returns IPFS/HTTPS JSON matching schema. Hash committed onchain for Ownership Proof.

---

## Validation rules

| Rule | Enforcement |
|------|-------------|
| `ownerBcidDid` must exist | API + contract |
| `ownershipProof.ref` required | Mint revert |
| PII hashes only (VIN, serial) | Schema lint |
| `jurisdiction` required | Mint revert |

---

## Month 1 status

- [x] Five asset type schemas defined
- [ ] JSON Schema files in `packages/bcid-schemas/` (Month 4)
- [ ] Asset BCID mint contract (Month 5)
