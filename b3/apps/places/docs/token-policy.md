# Platform settlement token policy

The **platform settlement token** is an ERC-20 deployed on Base for **integrated checkout** (primary share sales and escrow priced in one asset). It is **not** a substitute for property share tokens, which carry asset-level economics per issuer disclosure.

## Supply (reference implementation)

[`PlatformSettlementToken`](../src/PlatformSettlementToken.sol):

- **Fixed supply** minted once in the constructor to a designated receiver (typically a multisig treasury). No `mint()` after deployment.
- **ERC20Permit** for better wallet UX (`permit` + transfer in fewer steps).

Deployment parameters are set at deploy time (`name`, `symbol`, `initialSupply`, `receiver`).

## Bridges

This repo does **not** include a bridge. If you bridge to other chains, treat bridged supply as **custodial/wrapped** and disclose bridge operator risk.

## Renunciation

After deployment, there is **no owner** role on `PlatformSettlementToken` — the reference contract uses only OpenZeppelin `ERC20` + `ERC20Permit` with a constructor mint. Verify on Basescan before users rely on it.
