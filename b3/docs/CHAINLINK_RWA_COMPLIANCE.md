# Chainlink RWA compliance matrix (full ecosystem)

Living audit for Building Culture tokenized real estate and related RWA surfaces.  
Normative Places extension: [apps/places/docs/standards/chainlink-alignment-v1.md](../apps/places/docs/standards/chainlink-alignment-v1.md).

**Last reviewed:** 2026-05-23  
**Target:** Chainlink DTA + ACE + NAV/oracles + Proof of Reserve + CCIP (institutional RWA stack)

---

## Executive summary

| Pillar | Status | Notes |
|--------|--------|-------|
| uRWA (ERC-7943 surface) | In progress | `IuRWA` on `RestrictedPropertyShareToken` |
| ACE compliance | Adapter ready | `ChainlinkAceAdapter` + `ComplianceRegistryAdapter`; platform policies pending partner |
| DTA subscribe/redeem | Module shipped | `PropertyShareDTA.sol` (NAV-priced) |
| NAV / price feeds | Adapter shipped | `ChainlinkPriceOracle.sol`; mainnet mock deprecated in runbook |
| Proof of Reserve | Feed shipped | `PropertyReserveFeed.sol` gates mint/supply |
| VRF (fair draws) | Module shipped | `RaffleTicketCampaignVrf.sol` on Base |
| CCIP | Pilot config | `docs/CHAINLINK_PARTNER_ONBOARDING.md` |
| KYC → onchain | Restored | Veriff webhook → relayer → `ComplianceRegistry` (+ CCID hook) |

---

## Requirement matrix

| Requirement | Surface | Owner | Status | Blocker |
|-------------|---------|-------|--------|---------|
| Permissioned transfers | Places REOC | Engineering | Partial | ACE policies not on platform yet |
| uRWA `canSend`/`canReceive`/`canTransfer` | `RestrictedPropertyShareToken` | Engineering | Implemented | Audit |
| Primary subscribe @ NAV | `PropertyShareDTA` | Engineering | Implemented | NAVLink feed per property |
| Redemption queue | `PropertyShareDTA` | Engineering | Implemented | Transfer agent ops |
| PoR mint cap | `PropertyReserveFeed` | Engineering | Implemented | Custodian attestation source |
| Chainlink price feed | Lending/AMM | Engineering | Adapter ready | Replace mainnet `MockPriceOracle` |
| ACE PolicyEngine | All share transfers | Partner + Eng | Adapter stub | Chainlink ACE sandbox |
| CCID credentials | KYC webhook | Partner + Eng | Hook ready | ACE Platform |
| CCIP cross-chain | Places shares | Partner | Config only | CCIP testnet access |
| NFT marketplace ≠ RE shares | `app/marketplace` | Product | Documented | Keep separate |
| Play RWA drops fairness | `RaffleTicketCampaignVrf` | Engineering | VRF module | Deploy + fund subscription |
| KYC webhook live | Places `/api/webhooks/kyc` | Engineering | Restored | `RELAYER_PRIVATE_KEY` on prod |
| `kycBypass` off mainnet | `ComplianceRegistry` | Ops | Runbook | Multisig batch |
| External audit | Places + DTA + ACE adapter | Ops | Open | Budget / firm |
| Securities counsel | All investor copy | Legal | Open | Not engineering |

---

## REOC L4 → Chainlink mapping

| REOC profile | Chainlink alignment |
|--------------|---------------------|
| A — Open | No ACE (not recommended for RE) |
| B — Restricted | `ComplianceRegistryAdapter` → migrate to ACE |
| C — Wrapper | ERC-3643 + ACE connector |
| **D — Chainlink ACE** | `IComplianceBackend` + ACE PolicyEngine (see chainlink-alignment-v1.md) |

---

## Marketing claims guide

### OK to say (when component is deployed + configured)

- "Property share transfers are permissioned and checked on-chain before settlement."
- "Primary subscription uses oracle-referenced NAV when a feed is configured."
- "Reserve-backed mint caps pause issuance when on-chain supply exceeds attested backing."
- "Raffle winner selection uses Chainlink VRF on Base" — **only after** `RaffleTicketCampaignVrf` is live.

### Do NOT say (until matrix row is green + counsel)

- "Chainlink ACE certified" / "fully DTA compliant" — requires partner + audit evidence.
- "Proof of Reserve guarantees legal title" — PoR attests declared backing, not land registry.
- "Provably fair" for legacy `RaffleTicketCampaign` (blockhash entropy).
- Play `/play` RWA drops = tokenized real-estate securities (they are experience/raffle lanes).

### Copy locations to keep honest

| Page | Path |
|------|------|
| Investors | `app/src/routes/investors.tsx`, `ChainlinkComplianceStrip` |
| Play | `app/src/routes/play.tsx` |
| Places transparency | `apps/places/web/src/app/transparency/page.tsx` |
| Unified Places hub | `app/src/routes/places/index.tsx` |

---

## Code map

| Component | Path |
|-----------|------|
| uRWA interface | `apps/places/src/interfaces/IuRWA.sol` |
| Compliance backend | `apps/places/src/compliance/` |
| NAV oracle | `apps/places/src/defi/ChainlinkPriceOracle.sol` |
| DTA module | `apps/places/src/dta/PropertyShareDTA.sol` |
| PoR feed | `apps/places/src/reserve/PropertyReserveFeed.sol` |
| VRF raffle | `contracts/src/RaffleTicketCampaignVrf.sol` |
| Shared eligibility API | `app/src/routes/api/compliance/eligibility.tsx` |
| Mock oracle deprecation | `apps/places/docs/oracle-migration-mainnet.md` |
| Partner onboarding | `docs/CHAINLINK_PARTNER_ONBOARDING.md` |

---

## Ops gates (mainnet)

1. Replace `MockPriceOracle` (`0x8443…`) per [oracle-migration-mainnet.md](../apps/places/docs/oracle-migration-mainnet.md).
2. Call `ComplianceRegistry.setKycBypass(false)` via multisig.
3. Do **not** deploy `SimpleLendingPool` until NAV + PoR green.
4. Run Foundry suite: `cd apps/places && forge test --match-path 'test/chainlink/*'`.
