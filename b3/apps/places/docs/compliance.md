# Compliance and identity (pre-mainnet checklist)

On-chain code does **not** satisfy real-estate, securities, or privacy law by itself. Use this checklist before exposing **mainnet** contracts to retail users or handling regulated data.

## Jurisdiction and legal title

- **Land registry / deed validity** is defined by local law. This MVP stores **cryptographic commitments** and application-level **record owner** fields; it does **not** replace a government land record unless you have explicit legal integration.
- **Tokenizing** equity or rental cash flows may trigger **securities** rules (e.g. Howey test in the US). Engage counsel for each target market.

## KYC / AML

- Decide whether buyers/sellers must be **identified** before they can fund escrows or hold registry roles.
- If yes, implement **off-chain** KYC (or third-party provider) and only store **minimal** on-chain data (e.g. hashed credentials, attestations, or soulbound “verified” flags from a compliant issuer).
- **Testing:** `ComplianceRegistry` may expose `kycBypass` so pilots can run without per-wallet verification; turn it off before production.
- **Demo UI:** Illustrative listings may assume ~**$1,000** minimum notional per whole token and seed scripts may cap supply at **110% of property value ÷ $1,000** — the DEX **does not** enforce a per-token dollar floor without oracles.

## PII and data protection

- Avoid putting **names, government IDs, or full addresses** in plaintext on-chain or in public Storage blobs.
- Prefer **client-side or envelope encryption** before upload to 0G Storage; store only keys or access policies off-chain or with a KMS/HSM as appropriate for your threat model.

## Sanctions and geoblocking

- Screen wallet addresses and counterparties against applicable **sanctions lists** where required.
- Consider **geoblocking** or terms-of-use restrictions for jurisdictions where the product is not licensed.

## Audit and operations

- Plan **smart contract audits** before high-value TVL.
- Define **admin key** custody, multisig, and incident response for role changes in `PropertyRegistry` (`REGISTRAR_ROLE`, `DEFAULT_ADMIN_ROLE`).

## Prediction markets

The included `BinaryPredictionMarket` resolves outcomes via **`DEFAULT_ADMIN_ROLE`** (centralized). That is appropriate for testnets only; production betting or forecasting requires licensed operators, dispute rules, and oracle design — not provided here.

## Disclaimer

This file is **not legal advice**. Engage qualified counsel in each jurisdiction where you operate.

For **grant submissions** and scope boundaries (testnet vs production), see [grants.md](grants.md).
