# BCC bridge security threat model

## Assets

| Asset | Chain | Risk |
|-------|-------|------|
| Canonical BCC | Base | Locked in `BccBridgeVault` |
| wBCC | BSC | Mint authority via `BRIDGE_ROLE` |
| Treasury BCC | Base | Gnosis Safe — off-chain ops |

## Trust boundaries

### Phase 1 — Custom relayer

- **Users** trust the relayer to mint wBCC after lock and unlock BCC after burn.
- **Relayer** holds hot wallet with `BRIDGE_ROLE` on vault + wBCC.
- **Mitigations:**
  - `registerBurn` attestation required before `unlock` (prevents unlock without burn nonce)
  - Nonce replay protection on unlock
  - `Pausable` on vault and wBCC
  - Rate limits + circuit breaker in relayer (operator config)
  - Multisig as `DEFAULT_ADMIN_ROLE`; timelock for `setBridge`

### Phase 2 — LayerZero

- Permissionless messaging replaces custom relayer.
- OFT Adapter locks BCC; OFT mints wBCC via LZ verification.

## Attack vectors

| Vector | Mitigation |
|--------|------------|
| Relayer mints wBCC without lock | Operational monitoring; pause; migrate to LZ |
| Relayer unlocks without burn | `registerBurn` + nonce checks on vault |
| Replay unlock | `processedUnlocks` mapping |
| Reentrancy on lock/unlock/mint | `ReentrancyGuard` |
| Admin key compromise | Multisig + timelock on admin functions |
| Sale inventory drain | Pre-funded wBCC only; no mint in sale contract |
| Pass reward double-claim | `claimed` mapping + merkle proof |

## Emergency procedures

1. Pause vault + wBCC + sale + staking via multisig
2. Stop relayer process
3. Communicate status; resume after root-cause fix

## Audit readiness

- OpenZeppelin primitives throughout
- Forge tests: `contracts/test/BccBridge.t.sol`
- NatSpec on public functions
