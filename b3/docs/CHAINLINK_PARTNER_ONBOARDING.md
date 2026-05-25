# Chainlink partner onboarding (ACE / DTA / NAVLink / PoR)

Parallel track to engineering adapters in `apps/places/`. Production ACE/DTA requires Chainlink engagement.

## Use case summary

**Building Culture Places** — fractional real-estate share tokens (REOC v1 profile D) on **Base mainnet**, distributed via **buildingculture.capital** and unified app **app.buildingcultureid.space**.

- Token: `RestrictedPropertyShareToken` with uRWA + compliance backend
- Primary: `PropertyShareDTA` (subscribe/redeem)
- Attestation: `PropertyReserveFeed` (mint caps)
- Unified app: shared eligibility API; NFT marketplace stays separate from securities

## Requests for Chainlink

1. **ACE sandbox** — permissioned ERC-20 policy templates (KYC tier, sanctions, transfer limits, jurisdiction)
2. **DTA technical standard** pilot — property share subscribe/redeem (not mutual fund) with audit events
3. **NAVLink / custom feeds** — per-property NAV; hybrid issuer appraisal + onchain feed adapter
4. **Proof of Reserve** — SPV/custodian attestation → `PropertyReserveFeed` update pipeline
5. **CCIP testnet** — Base ↔ one L2 for share token pilot (ACE-gated transfers)

## Engineering artifacts ready for integration

| Artifact | Path |
|----------|------|
| ACE adapter stub | `apps/places/src/compliance/ChainlinkAceAdapter.sol` |
| Registry fallback | `apps/places/src/compliance/ComplianceRegistryAdapter.sol` |
| CCID webhook hook | `apps/places/web/src/lib/ccid-credential.ts` |
| Compliance matrix | `docs/CHAINLINK_RWA_COMPLIANCE.md` |
| CCIP pilot addresses | `apps/places/deployments/ccip-pilot.json` |

## Pilot property testnet demo (acceptance)

1. Deploy profile D stack on Base Sepolia
2. Configure ACE policies in sandbox (or registry adapter fallback)
3. One property: PoR cap → DTA subscribe → restricted secondary swap on OgRouter
4. KYC webhook → verified wallet → successful transfer
5. Publish updated compliance matrix with testnet tx hashes

## Contacts / next steps

- Assign internal owner for Chainlink partnership (BD + engineering)
- Prepare 2-page deck: REOC, Base addresses, TVL targets, jurisdiction
- Schedule ACE sandbox access; wire `CHAINLINK_ACE_COMPLIANCE_ADDRESS` env when provided
