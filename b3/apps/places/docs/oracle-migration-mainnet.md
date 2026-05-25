# Mainnet oracle migration (MockPriceOracle → Chainlink)

**Current mainnet mock:** `0x84431A9e5c0dEb8160Ab5D03aC2A9BCDb79Cc6Ff` ([base-mainnet.json](../deployments/base-mainnet.json))

`MockPriceOracle` is **non-production**. UI must label it as test/pilot only until migrated.

## Target

Deploy [`ChainlinkPriceOracle`](../src/defi/ChainlinkPriceOracle.sol) with:

- Base ETH/USD feed: `0x71041dddad3595F3159a3D0E6f41B6e0d4c4C8C` (verify on [docs.chain.link](https://docs.chain.link/data-feeds/price-feeds/addresses) before deploy)
- Per-property NAV feeds added via `setTokenFeed(token, aggregator)` as NAVLink/custom feeds become available

## Migration steps

1. Deploy `ChainlinkPriceOracle` via multisig admin.
2. For each collateral share token used in lending (future): `setTokenFeed(token, navFeed)`.
3. Update deployment JSON; point new lending deploys at `ChainlinkPriceOracle`.
4. **Do not** deploy `SimpleLendingPool` on mainnet until PoR + NAV rows are green in [CHAINLINK_RWA_COMPLIANCE.md](../../../docs/CHAINLINK_RWA_COMPLIANCE.md).
5. Mark `MockPriceOracle` deprecated in Places `/transparency` and `/contracts` pages.

## Rollback

Keep mock address in JSON under `deprecated.MockPriceOracle` for indexer history; do not use for new pricing.
