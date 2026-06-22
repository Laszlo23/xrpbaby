import {
  BCC_ADDRESS,
  BCC_BURN_ADDRESS,
  BCC_CHAIN_ID,
  bridgeVaultAbi,
  erc20Abi,
  wbccAbi,
} from "@bc/bcc-kit";
import { createPublicClient, http, type Address, type PublicClient } from "viem";
import { base, bsc } from "viem/chains";
import { getBccBridgeConfigServer } from "@/lib/bcc-bridge-config";
import { BCC_ROOTS_STAKING_ABI } from "@/lib/roots-abi";

const erc20SupplyAbi = [
  ...erc20Abi,
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const TREASURY_SAFE = "0x0D106D512Ac28cc29E625b22C6628989013c4C6B" as const;

export type BccMetricsSnapshot = {
  ok: boolean;
  updatedAt: string;
  bridgeMode: string;
  canonical: {
    chainId: number;
    address: string;
    totalSupplyWei: string;
    lockedInVaultWei: string;
    treasuryBalanceWei: string;
    burnedWei: string;
    circulatingEstimateWei: string;
  };
  wrapped: {
    chainId: number;
    address: string | null;
    totalSupplyWei: string;
    totalMintedWei: string;
    totalBurnedWei: string;
  };
  staking: {
    base: { configured: boolean; address: string | null; totalStakedWei: string };
    bsc: { configured: boolean; address: string | null; totalStakedWei: string };
  };
  bridge: {
    vaultAddress: string | null;
    totalLockedWei: string;
    totalUnlockedWei: string;
    lockNonce: string;
  };
  liquidityNote: string;
};

function env(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

function baseRpc(): string {
  return env("BCC_TREASURY_RPC_URL") || env("BASE_RPC_URL") || "https://mainnet.base.org";
}

function bscRpc(): string {
  return env("BSC_RPC_URL") || "https://bsc-dataseed.binance.org";
}

async function readBalance(client: PublicClient, token: Address, holder: Address): Promise<bigint> {
  try {
    return await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [holder],
    });
  } catch {
    return 0n;
  }
}

async function sumRootsStaked(client: PublicClient, staking: Address): Promise<bigint> {
  let total = 0n;
  for (let poolId = 0; poolId < 3; poolId++) {
    try {
      const [raw] = await client.readContract({
        address: staking,
        abi: BCC_ROOTS_STAKING_ABI,
        functionName: "totalStaked",
        args: [BigInt(poolId)],
      });
      total += raw;
    } catch {
      /* pool may not exist */
    }
  }
  return total;
}

export async function fetchBccMetrics(): Promise<BccMetricsSnapshot> {
  const bridgeConfig = getBccBridgeConfigServer();
  const baseClient = createPublicClient({
    chain: base,
    transport: http(baseRpc()),
  }) as PublicClient;
  const bscClient = createPublicClient({ chain: bsc, transport: http(bscRpc()) }) as PublicClient;

  const bcc = BCC_ADDRESS as Address;
  const burn = BCC_BURN_ADDRESS as Address;
  const treasury = TREASURY_SAFE as Address;

  const [totalSupply, lockedVaultBal, treasuryBal, burnedBal] = await Promise.all([
    baseClient
      .readContract({ address: bcc, abi: erc20SupplyAbi, functionName: "totalSupply" })
      .catch(() => 0n),
    bridgeConfig.baseBridgeVault
      ? readBalance(baseClient, bcc, bridgeConfig.baseBridgeVault as Address)
      : Promise.resolve(0n),
    readBalance(baseClient, bcc, treasury),
    readBalance(baseClient, bcc, burn),
  ]);

  let totalLocked = 0n;
  let totalUnlocked = 0n;
  let lockNonce = 0n;
  if (bridgeConfig.baseBridgeVault) {
    const vault = bridgeConfig.baseBridgeVault as Address;
    try {
      [totalLocked, totalUnlocked, lockNonce] = await Promise.all([
        baseClient.readContract({
          address: vault,
          abi: bridgeVaultAbi,
          functionName: "totalLocked",
        }),
        baseClient.readContract({
          address: vault,
          abi: bridgeVaultAbi,
          functionName: "totalUnlocked",
        }),
        baseClient.readContract({ address: vault, abi: bridgeVaultAbi, functionName: "lockNonce" }),
      ]);
    } catch {
      /* vault not deployed */
    }
  }

  let wbccSupply = 0n;
  let wbccMinted = 0n;
  let wbccBurned = 0n;
  if (bridgeConfig.wbccBsc) {
    const wbcc = bridgeConfig.wbccBsc as Address;
    try {
      [wbccSupply, wbccMinted, wbccBurned] = await Promise.all([
        bscClient.readContract({ address: wbcc, abi: erc20SupplyAbi, functionName: "totalSupply" }),
        bscClient.readContract({ address: wbcc, abi: wbccAbi, functionName: "totalMinted" }),
        bscClient.readContract({ address: wbcc, abi: wbccAbi, functionName: "totalBurned" }),
      ]);
    } catch {
      /* wBCC not deployed */
    }
  }

  const baseStakingAddr =
    env("VITE_BCC_ROOTS_STAKING_ADDRESS") || env("BCC_ROOTS_STAKING_ADDRESS") || null;
  const bscStakingAddr =
    env("VITE_WBCC_ROOTS_STAKING_ADDRESS") || env("WBCC_ROOTS_STAKING_ADDRESS") || null;

  let baseStaked = 0n;
  if (baseStakingAddr && /^0x[a-fA-F0-9]{40}$/.test(baseStakingAddr)) {
    baseStaked = await sumRootsStaked(baseClient, baseStakingAddr as Address);
  }

  let bscStaked = 0n;
  if (bscStakingAddr && /^0x[a-fA-F0-9]{40}$/.test(bscStakingAddr)) {
    bscStaked = await sumRootsStaked(bscClient, bscStakingAddr as Address);
  }

  const supply = typeof totalSupply === "bigint" ? totalSupply : BigInt(totalSupply || 0);
  const circulating = supply - lockedVaultBal - burnedBal;

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    bridgeMode: bridgeConfig.mode,
    canonical: {
      chainId: BCC_CHAIN_ID,
      address: bcc,
      totalSupplyWei: supply.toString(),
      lockedInVaultWei: lockedVaultBal.toString(),
      treasuryBalanceWei: treasuryBal.toString(),
      burnedWei: burnedBal.toString(),
      circulatingEstimateWei: circulating.toString(),
    },
    wrapped: {
      chainId: bridgeConfig.bscChainId,
      address: bridgeConfig.wbccBsc || null,
      totalSupplyWei: wbccSupply.toString(),
      totalMintedWei: wbccMinted.toString(),
      totalBurnedWei: wbccBurned.toString(),
    },
    staking: {
      base: {
        configured: Boolean(baseStakingAddr),
        address: baseStakingAddr,
        totalStakedWei: baseStaked.toString(),
      },
      bsc: {
        configured: Boolean(bscStakingAddr),
        address: bscStakingAddr,
        totalStakedWei: bscStaked.toString(),
      },
    },
    bridge: {
      vaultAddress: bridgeConfig.baseBridgeVault || null,
      totalLockedWei: totalLocked.toString(),
      totalUnlockedWei: totalUnlocked.toString(),
      lockNonce: lockNonce.toString(),
    },
    liquidityNote: "DEX liquidity from /api/market/bcc — see bcc-pools.ts",
  };
}
