# Safe multisig on Base — role migration

After `DeployAll`, the broadcasting **EOA** (`PRIVATE_KEY`) typically receives `DEFAULT_ADMIN_ROLE` and other roles on:

- `ComplianceRegistry`
- `PropertyRegistry`
- `PropertyShareFactory`
- `PropertyShareProof` (if proof NFT admin is separate per deployment)
- `OgStaking`
- Other contracts deployed in the same script

**Goal:** protocol control should live on a **Gnosis Safe** (or compatible multisig) on Base, not on a hot deployer key long term.

## Recommended sequence

1. **Create** a Safe on Base with your signing policy (e.g. 2-of-3 operators + cold key).
2. Set **`NEXT_PUBLIC_BASE_GOVERNANCE_SAFE`** to that Safe so the app links it from `/contracts` (display only — not for user deposits).
3. **Grant** each admin role the Safe needs using `AccessControl.grantRole(role, safeAddress)` from the current admin (deployer).
4. **Verify** on Basescan that the Safe holds the expected roles (`hasRole`).
5. **Revoke** the deployer’s roles once the Safe can operate alone.
6. Move **treasury** ETH/tokens intended for protocol ops from the deployer to the Safe where applicable.

## Cast examples (adjust addresses and RPC)

Replace placeholders; use your Base RPC via `--rpc-url`.

```bash
# Example: grant DEFAULT_ADMIN_ROLE on ComplianceRegistry (bytes32 hash from contract)
cast send <COMPLIANCE_REGISTRY> "grantRole(bytes32,address)" \
  0x...roleHash... \
  <SAFE_ADDRESS> \
  --rpc-url https://mainnet.base.org \
  --private-key "$PRIVATE_KEY"

# Example: revoke from deployer after Safe is confirmed
cast send <COMPLIANCE_REGISTRY> "revokeRole(bytes32,address)" \
  0x...roleHash... \
  <DEPLOYER_ADDRESS> \
  --rpc-url https://mainnet.base.org \
  --private-key "$PRIVATE_KEY"
```

Exact `role` bytes32 values are defined on each contract (OpenZeppelin `AccessControl` defaults: `DEFAULT_ADMIN_ROLE` is `0x0000...0000` per OZ docs). Prefer batching grants via **Safe Transaction Builder** so multiple contracts are updated in one reviewed bundle.

## Ops note

Day-to-day parameter changes (compliance settings, allowlisted pairs, reward notifications) should be executed **from the Safe** so signers share visibility and audit trail.
