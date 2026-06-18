# BCC multichain expansion

## EVM chains (Polygon, Arbitrum, Optimism)

Same economics as BSC:

1. Deploy `WrappedBCC` (or LayerZero OFT peer) on target chain
2. Extend `BccBridgeVault` destination chain IDs OR use LZ mesh from Base adapter
3. Relayer watches `Locked` with `dstChainId` → mint on target
4. Registry: `contracts/deployments/bcc-{chainId}.json`

No new canonical BCC mint authority on satellite chains.

## Sui (non-EVM)

Separate wrapped asset + Wormhole/CCTP-style bridge. Out of current EVM scope; document intent only.

## Supply invariant

```
canonical_BCC.totalSupply() == circulating + vault_locked + burned + treasury + staked (approx)
wBCC.totalSupply() <= vault_locked (1:1 backing)
```

Dashboard: `/bcc/dashboard` · API: `GET /api/bcc/metrics`
