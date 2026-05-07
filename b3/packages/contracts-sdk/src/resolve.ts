import type { Address } from "viem";
import { deploymentAddresses8453, getDeploymentAddress } from "./generated/addresses.js";

export type EnvLike = Record<string, string | undefined>;

function parseAddr(v: string | undefined): Address | undefined {
  if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

/** Base mainnet chain id (canonical deployment file `8453.json`). */
export const BASE_MAINNET_CHAIN_ID = 8453;

export function resolveBcdTokenAddress(chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_BCD_TOKEN_ADDRESS) ?? getDeploymentAddress("BuildingCultureDollar", chainId);
}

export function resolveBcdGenesisClaimAddress(chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_BCD_GENESIS_CLAIM_ADDRESS) ?? getDeploymentAddress("BCDGenesisClaim", chainId);
}

export function resolveBcdSaleAddress(chainId: number, env: EnvLike): Address | undefined {
  const fromEnv = parseAddr(env.VITE_BCD_SALE_ADDRESS);
  if (fromEnv) return fromEnv;
  if (chainId !== BASE_MAINNET_CHAIN_ID) return undefined;
  const book = deploymentAddresses8453 as Record<string, `0x${string}` | undefined>;
  const listed = book["BCDFixedPriceSale"];
  return listed ? (listed.toLowerCase() as Address) : undefined;
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

export function resolveGenesisVaultPassPhase0Address(_chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE0) ?? parseAddr(env.VITE_GENESIS_DISTRICT_CONTRACT);
}

export function resolveGenesisVaultPassPhase1Address(_chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE1);
}

export function resolveGenesisVaultPassPhase2Address(_chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE2);
}

export function resolveDistinctLegacyGenesisDistrictAddress(_chainId: number, env: EnvLike): Address | undefined {
  const p0 = parseAddr(env.VITE_GENESIS_VAULT_PASS_PHASE0);
  const leg = parseAddr(env.VITE_GENESIS_DISTRICT_CONTRACT);
  if (!p0 || !leg) return undefined;
  if (p0.toLowerCase() === leg.toLowerCase()) return undefined;
  return leg;
}

export function resolveMarketplaceContractAddress(_chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_MARKETPLACE_CONTRACT_ADDRESS);
}

export function resolvePitNftContractAddress(_chainId: number, env: EnvLike): Address | undefined {
  return parseAddr(env.VITE_PIT_NFT_CONTRACT_ADDRESS) ?? parseAddr(env.VITE_BASE_PRIMARY_CONTRACT_ADDRESS);
}
