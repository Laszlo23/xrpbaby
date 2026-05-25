# REOC Chainlink alignment v1

**Version:** 1.0.0  
**Status:** Normative extension of [reoc-v1.md](./reoc-v1.md)  
**Scope:** Technical interoperability with Chainlink institutional RWA stack (ACE, DTA, NAV feeds, PoR, CCIP).

---

## 1. New L4 profile D — Chainlink ACE

REOC v1 §5 adds profile **D**:

| Profile | Description |
|---------|-------------|
| **D — Chainlink ACE** | Transfers and mints gated by `IComplianceBackend` (ACE PolicyEngine or registry adapter). Token exposes **uRWA** (`IuRWA`) views. Primary issuance via **DTA-shaped** `PropertyShareDTA`. Supply capped by **PoR feed** per `propertyId`. |

Implementations claiming profile D MUST:

- Implement `IuRWA` on restricted share tokens.
- Route compliance checks through `IComplianceBackend` (not hard-coded registry calls in token logic).
- Document NAV feed address(es) and PoR feed for each property offering.
- NOT claim full DTA/ACE certification without Chainlink partner evidence.

---

## 2. uRWA (ERC-7943-aligned surface)

Required on profile D tokens:

| Function | Rule |
|----------|------|
| `canSend(address)` | MUST NOT revert; returns whether account may send |
| `canReceive(address)` | MUST NOT revert; returns whether account may receive |
| `canTransfer(from, to, amount)` | MUST NOT revert; MUST check send + receive |
| `isFrozen(account)` | View freeze state |
| `forcedTransfer(from, to, amount)` | Admin-only; legal enforcement path |

See [`IuRWA.sol`](../../src/interfaces/IuRWA.sol).

---

## 3. DTA subscription / redemption

Profile D primary market SHOULD use [`PropertyShareDTA`](../../src/dta/PropertyShareDTA.sol):

- **Subscribe:** pay `paymentToken` at `navOracle` price → mint shares (ACE/PoR gated).
- **Redeem:** request burn → issuer settles offchain per transfer-agent policy.
- Emit audit events: `Subscribed`, `RedeemRequested`, `RedeemFulfilled`.

Fixed-price [`PrimaryShareSaleERC20`](../../src/PrimaryShareSaleERC20.sol) remains valid for profile B pilots only.

---

## 4. NAV and PoR

| Feed | Interface | Purpose |
|------|-----------|---------|
| NAV / collateral price | `IPriceOracle` / `ChainlinkPriceOracle` | DTA pricing, lending (when enabled) |
| Property reserve | `IPropertyReserveFeed` | Max mintable shares vs attested backing |

Mainnet MUST NOT use [`MockPriceOracle`](../../src/defi/MockPriceOracle.sol) for investor-facing pricing.

---

## 5. Cross-chain (CCIP)

REOC v1 §6 unchanged: bridging requires explicit policy. Profile D MAY add CCIP token pool addresses in deployment JSON; ACE must enforce cross-chain eligibility when enabled.

Pilot config: `apps/places/deployments/ccip-pilot.json`.

---

## 6. Conformance checklist (profile D)

- [ ] `RestrictedPropertyShareToken` implements `IuRWA` + `IComplianceBackend` injection
- [ ] `PropertyShareDTA` deployed with NAV feed for offering
- [ ] `PropertyReserveFeed` set for `propertyId` before public mint
- [ ] KYC webhook → relayer → compliance status (CCID when ACE live)
- [ ] `kycBypass == false` on production registry
- [ ] Transparency page lists oracle + PoR addresses
- [ ] Matrix in [CHAINLINK_RWA_COMPLIANCE.md](../../../../docs/CHAINLINK_RWA_COMPLIANCE.md) updated

---

## 7. Governance

Changes via PR to `docs/standards/`. Breaking interface changes → REOC minor/major bump coordinated with `reoc-v1.md` maintainers.
