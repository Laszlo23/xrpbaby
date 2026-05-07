# B3 contracts (Foundry + Hardhat)

Solidity `0.8.24` under `src/`. Use **Foundry** as the primary compile/test/deploy path; **Hardhat** is wired for ecosystem tooling (e.g. verification) and uses [`@nomicfoundation/hardhat-foundry`](https://github.com/NomicFoundation/hardhat-foundry) to stay aligned with Forge output.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`, `anvil`)
- Node 20+ (for Hardhat / npm scripts in this folder)

## Environment

1. `cp .env.example .env`
2. Set at least: `PRIVATE_KEY`, `RPC_URL`, `TREASURY`, `LIQUIDITY_VAULT` (for agent campaign), `GENESIS_MERKLE_ROOT` (use zero root until a real tree is published).
3. Default metadata bases point at `https://0x.buildingculture.capital/...` — change when you host JSON elsewhere.
4. Optional: keep **Thirdweb** fields (`THIRDWEB_*`, `BSC_4EVERLAND_API_KEY`) in sync with `b3/frontend/.env` for a single place to copy keys when operating the stack. **Foundry only reads the deploy variables** at the top of `.env.example`—the Thirdweb block is for humans/scripts, not `forge script`.

Never commit `.env`. It is listed in `.gitignore`.

## Build and test (Foundry)

```sh
cd b3/contracts
forge build
forge test
```

Config: [`foundry.toml`](foundry.toml) — `solc` 0.8.24, optimizer 200, `via_ir = true` (avoids “stack too deep” in large script constructors). Remappings: [`remappings.txt`](remappings.txt).

## Deploy (recommended: `forge script`)

Multi-step flows (BCD + genesis claim wiring) and multi-argument ERC721s are **not** a good fit for raw `forge create` — use scripted deploys with `--broadcast`.

### One-shot: all subsystems

Uses [`script/DeployAll.s.sol`](script/DeployAll.s.sol). Set `DEPLOY_RAFFLE`, `DEPLOY_AGENT_SHARE`, or `DEPLOY_BCD` to `0` to skip a section (default `1` = deploy).

```sh
set -a && source .env && set +a
forge script script/DeployAll.s.sol:DeployAllScript \
  --rpc-url "$RPC_URL" \
  --broadcast \
  -vvvv
```

### Individual systems

```sh
set -a && source .env && set +a
forge script script/DeployRaffle.s.sol:DeployRaffleScript --rpc-url "$RPC_URL" --broadcast -vvvv
forge script script/DeployAgentShare.s.sol:DeployAgentShareScript --rpc-url "$RPC_URL" --broadcast -vvvv
forge script script/DeployBCD.s.sol:DeployBCDScript --rpc-url "$RPC_URL" --broadcast -vvvv
forge script script/DeployGenesisVaultPassAll.s.sol:DeployGenesisVaultPassAllScript --rpc-url "$RPC_URL" --broadcast -vvvv
```

### Genesis Vault Pass (three ERC-721 tiers)

[`GenesisVaultPass.sol`](src/GenesisVaultPass.sol) is deployed **three times** (Phase 0 / 1 / 2) via [`DeployGenesisVaultPassAll.s.sol`](script/DeployGenesisVaultPassAll.s.sol). Each tier has its own `mintPriceWei`, `maxSupply`, and metadata `baseURI` (JSON at `{base}{tokenId}.json`).

Set in `.env` before broadcast:

- **`TREASURY`** — receives mint proceeds.
- **`GVP_PHASE0_MINT_PRICE_WEI`**, **`GVP_PHASE1_MINT_PRICE_WEI`**, **`GVP_PHASE2_MINT_PRICE_WEI`** — optional; defaults `0.005`, `0.003`, `0.001` ether.
- **`GVP_PHASE0_MAX_SUPPLY`** … **`GVP_PHASE2_MAX_SUPPLY`** — optional; defaults `333`, `777`, `1500`.
- **`GVP_PHASE0_BASE_URI`** … **`GVP_PHASE2_BASE_URI`** — optional JSON bases (must end with `/`); defaults under `https://0x.buildingculture.capital/meta/genesis-vault-pass/phaseN/`.

Copy the three logged addresses into the frontend: `VITE_GENESIS_VAULT_PASS_PHASE0`, `PHASE1`, `PHASE2` (see `b3/frontend/.env.example`).

Simulate without sending: run the same `forge script` **without** `--broadcast` (script runs; no on-chain tx). Use a testnet first for end-to-end checks.

## Verify on a block explorer

After deploy, use the contract address and constructor args from the broadcast output.

- **Foundry:** `forge verify-contract <address> <path>:<ContractName> --chain <id> --etherscan-api-key $ETHERSCAN_API_KEY` (many L2s share the Etherscan v2 API key flow — check your chain’s docs).
- **Hardhat:** `npx hardhat verify --network <name> <address> ...` after configuring [`hardhat.config.ts`](hardhat.config.ts) and your API key in `.env`.

## `forge create` (advanced)

Use only for **single** contracts with a small constructor. Encode args with `cast abi-encode` or pass `--constructor-args` per the Foundry book. For this repo, prefer the scripts above.

## Hardhat (optional)

```sh
cd b3/contracts
npm install
npx hardhat compile   # uses Foundry output via hardhat-foundry
```

See [`package.json`](package.json) for scripts.

## Layout

| Path        | Role                                      |
|------------|-------------------------------------------|
| `src/`     | `BuildingCultureDollar`, `BCDGenesisClaim`, `AgentShareCampaign`, `RaffleTicketCampaign`, `GenesisVaultPass` |
| `script/`  | Deploy scripts + `DeployAll.s.sol`        |
| `test/`    | Forge tests                               |
| `lib/`     | `forge-std`, OpenZeppelin                 |

## Parent monorepo

From `b3/`, after `npm install` inside `b3/contracts` once:

```sh
npm run verify:contracts
```

Runs `forge test`, then `hardhat compile` (sanity check that the Hardhat config matches your contracts).
