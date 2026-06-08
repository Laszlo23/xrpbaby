# Panic Switch Hidden Voucher NFT

This runbook documents the hidden-track riddle flow in the Panic Switch overlay and the voucher NFT mint path.

## Product behavior

- Panic Switch now narrates each active cycle as a chapter.
- A hidden riddle track unlocks after three clue fragments are earned:
  - `signal`: at least 3 successful resets
  - `timing`: high precision run (>= 620 score) by late active cycles
  - `patience`: endurance tab-visible time of at least 11 minutes
- Once unlocked, users can submit a riddle answer.
- Valid answer + SIWE + qualified daily Panic completion triggers a voucher NFT claim attempt.

## Eligibility policy

- Wallet ownership is proven with SIWE.
- Minimum precision for voucher path is currently `640`.
- User must have completed `panic-switch-bcc-daily` for the same UTC day with at least `600` precision metadata.
- Voucher is lifetime one-per-wallet (`PanicVoucherClaim.walletId` unique).

## Smart contract

- Contract: `contracts/src/PanicSwitchVoucher.sol`
- Deploy script: `contracts/script/DeployPanicSwitchVoucher.s.sol`
- Mint method: `mintVoucher(address to, bytes32 claimDigest)` (owner-only)
- Replay guard: `claimDigestUsed` mapping in contract

## Server mint pipeline

- API entrypoint: `postClaimPanicSwitchVoucherNft` in `app/src/lib/points-fns.ts`
- Minter helper: `app/src/server/wallet/panic-voucher-mint.ts`
- Persistence: `PanicVoucherClaim` Prisma model + migration
- Observability: `ActivityEvent` with type `panic:voucher_nft_claimed`

## Required env vars

Server-side:

- `PANIC_VOUCHER_NFT_ONCHAIN=1` to enable on-chain minting
- `PANIC_VOUCHER_NFT_PRIVATE_KEY=0x...` owner wallet key
- `PANIC_VOUCHER_NFT_CONTRACT_ADDRESS=0x...`
- `PANIC_VOUCHER_NFT_CHAIN_ID=8453` (Base mainnet default)
- `PANIC_VOUCHER_NFT_RPC_URL=...` (optional if `BASE_RPC_URL` already set)
- `PANIC_VOUCHER_RIDDLE_ANSWER_SHA256=...` (optional override)

## Operations checklist

1. Deploy voucher contract on Base with owner set to treasury/operator wallet.
2. Update app env vars and restart server.
3. Confirm `PANIC_VOUCHER_NFT_ONCHAIN=1` only after contract and key are verified.
4. Run one test claim on staging wallet and verify:
   - `PanicVoucherClaim` row stored
   - tx hash and token id captured
   - `panic:voucher_nft_claimed` activity event emitted
5. If minting fails, claim is stored with `pending` status and can be retried manually by ops.

