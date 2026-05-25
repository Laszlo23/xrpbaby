# Mainnet readiness checklist

Use this as an operational gate before production deployment. It does not replace legal review.

## Keys & custody

- Deploy admin keys through a multisig (e.g. Gnosis Safe) for `PropertyRegistry`, `PropertyShareFactory`, `ComplianceRegistry`, and oracle admin.
- Compliance updates (`setWalletStatus`, `setSystemContract`) should not use a single hot key in production; prefer multisig batches or a timelocked relayer with rate limits.
- Store `RELAYER_PRIVATE_KEY` and webhook secrets in a vault; rotate on incident.

## Contracts

- External audit of `ComplianceRegistry`, `RestrictedPropertyShareToken`, `OgRouter` (including `removeLiquidity` / `removeLiquidityETH`), and factory wiring.
- For each new `OgPair`, call `ComplianceRegistry.setSystemContract(pair, true)` before users trade restricted shares through that pool.
- Verify oracle configuration for any `SimpleLendingPool`; replace `MockPriceOracle` with a robust feed for production.

## Monitoring

- Index pairs, large swaps, compliance events (`WalletStatusChanged`, `SystemContractChanged`), and lending health factors.
- Alert on failed relay transactions, webhook signature failures, and unusual TVL moves.

## Product & legal

- Publish Terms of Service and risk disclosures (see web `/legal` as a starting point).
- Confirm securities and real-estate law posture with counsel; geoblock or restrict where required.

## Incident response

- Document pause/revocation policy via compliance registry (`Revoked` status) and communication channels for holders.
