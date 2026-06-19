import type { Address } from "viem";
import {
  deploymentAddresses8453,
  getDeploymentAddress,
  type DeploymentContractName,
} from "./generated/addresses.js";

export type EnvLike = Record<string, string | undefined>;

function parseAddr(v: string | undefined): Address | undefined {
  if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

/** Base mainnet chain id (canonical deployment file `8453.json`). */
export const BASE_MAINNET_CHAIN_ID = 8453;

/** Base Sepolia testnet (`84532.json`). */
export const BASE_SEPOLIA_CHAIN_ID = 84532;

/** Canonical BCC (Building Culture Coin) on Base mainnet — fair launch ERC-20. */
export const BCC_TOKEN_ADDRESS_MAINNET = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;

/** thirdweb Marketplace V3 on Base mainnet — see docs/ADDRESSES.json marketplace.thirdwebMarketplaceV3 */
export const THIRDWEB_MARKETPLACE_V3_BASE_MAINNET =
  "0x3af9EB7784C1843BD8385D1F41dE78d4B83AEcf4" as const;

export function resolveBcdTokenAddress(chainId: number, env: EnvLike): Address | undefined {
  const fromBcc = parseAddr(env.VITE_BCC_TOKEN_ADDRESS);
  if (fromBcc) return fromBcc;
  const fromBcd = parseAddr(env.VITE_BCD_TOKEN_ADDRESS);
  if (fromBcd) return fromBcd;
  if (chainId === BASE_MAINNET_CHAIN_ID) return BCC_TOKEN_ADDRESS_MAINNET;
  return getDeploymentAddress("BuildingCultureDollar", chainId);
}

export function resolveBcdGenesisClaimAddress(chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_BCD_GENESIS_CLAIM_ADDRESS) ?? getDeploymentAddress("BCDGenesisClaim", chainId);
}

export function resolveBcdSaleAddress(chainId: number, env: EnvLike): Address | undefined {
  const fromEnv = parseAddr(env.VITE_BCD_SALE_ADDRESS);
  if (fromEnv) return fromEnv;
  const listed = getDeploymentAddress("BCDFixedPriceSale" as DeploymentContractName, chainId);
  if (listed) return listed;
  if (chainId === BASE_MAINNET_CHAIN_ID) {
    const book = deploymentAddresses8453 as Record<string, `0x${string}` | undefined>;
    const legacy = book["BCDFixedPriceSale"];
    return legacy ? (legacy.toLowerCase() as Address) : undefined;
  }
  return undefined;
}

export function resolveRaffleCampaignAddress(chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_RAFFLE_CAMPAIGN_ADDRESS) ?? getDeploymentAddress("RaffleTicketCampaign", chainId);
}

export function resolveAgentShareCampaignAddress(chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_AGENT_SHARE_CAMPAIGN_ADDRESS) ?? getDeploymentAddress("AgentShareCampaign", chainId);
}

/** DailyCheckIn — env only until listed in deployments JSON. */
export function resolveDailyCheckInAddress(_chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_DAILY_CHECKIN_ADDRESS) ?? parseAddr(env.DAILY_CHECKIN_CONTRACT_ADDRESS);
}

/** PanicSwitchAttestation — env only until listed in deployments JSON. */
export function resolvePanicSwitchAttestationAddress(_chainId: number, env: EnvLike): Address | undefined {
  return (
    parseAddr(env.VITE_PANIC_SWITCH_ATTESTATION_ADDRESS) ??
    parseAddr(env.PANIC_SWITCH_ATTESTATION_ADDRESS)
  );
}

export function resolveGenesisVaultPassPhase0Address(chainId: number, env: EnvLike): Address | undefined {
  return (
    parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE0) ??
    parseAddr(env.VITE_GENESIS_DISTRICT_CONTRACT) ??
    getDeploymentAddress("GenesisVaultPassPhase0" as DeploymentContractName, chainId)
  );
}

export function resolveGenesisVaultPassPhase1Address(chainId: number, env: EnvLike): Address | undefined {
  return (
    parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE1) ??
    getDeploymentAddress("GenesisVaultPassPhase1" as DeploymentContractName, chainId)
  );
}

export function resolveGenesisVaultPassPhase2Address(chainId: number, env: EnvLike): Address | undefined {
  return (
    parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE2) ??
    getDeploymentAddress("GenesisVaultPassPhase2" as DeploymentContractName, chainId)
  );
}

export function resolveDistinctLegacyGenesisDistrictAddress(_chainId: number, env: EnvLike): Address | undefined {
  const p0 = parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE0);
  const leg = parseAddr(env.VITE_GENESIS_DISTRICT_CONTRACT);
  if (!p0 || !leg) return undefined;
  if (p0.toLowerCase() === leg.toLowerCase()) return undefined;
  return leg;
}

export function resolveMarketplaceContractAddress(chainId: number, env: EnvLike): Address | undefined {
  const fromEnv =
    parseAddr(env.VITE_MARKETPLACE_CONTRACT_ADDRESS) ??
    parseAddr(env.THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS) ??
    parseAddr(env.MARKETPLACE_CONTRACT_ADDRESS);
  if (fromEnv) return fromEnv;
  if (chainId === BASE_MAINNET_CHAIN_ID) return THIRDWEB_MARKETPLACE_V3_BASE_MAINNET;
  return undefined;
}

export function resolvePitNftContractAddress(_chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_PIT_NFT_CONTRACT_ADDRESS) ?? parseAddr(env.VITE_BASE_PRIMARY_CONTRACT_ADDRESS);
}

export function resolveCultureChroniclesAddress(chainId: number, env: EnvLike): Address | undefined {
  return (
    parseAddr(env.VITE_CULTURE_CHRONICLES_ADDRESS) ??
    getDeploymentAddress("CultureChronicles1155" as DeploymentContractName, chainId)
  );
}

/** CultureSpinningWell — env only until listed in deployments JSON. */
export function resolveCultureSpinningWellAddress(_chainId: number, env: EnvLike): Address | undefined {
  return (
    parseAddr(env.VITE_CULTURE_SPINNING_WELL_ADDRESS) ??
    parseAddr(env.CULTURE_SPINNING_WELL_CONTRACT_ADDRESS)
  );
}
