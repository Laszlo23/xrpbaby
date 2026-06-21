import type { Address } from "viem";

import { lpTierFromBalanceWei } from "@/lib/identity/culture-power";
import { isCulturePowerEnabledServer } from "@/lib/identity/culture-power";
import { walletHasBccLpProof } from "@/server/liquidity/lp-proof";
import { resolveStakingBoostPoolId } from "@/server/points/weekly-claim";

const ROOTS_WEIGHT_BY_POOL: Record<number, number> = {
  0: 1.0,
  1: 1.3,
  2: 1.5,
};

const ROOTS_LABEL_BY_POOL: Record<number, string> = {
  0: "Seedling",
  1: "Builder Grove",
  2: "Elder Canopy",
};

const OBSERVER_ROOTS_WEIGHT = 0.25;

export type DaoVotingWeightQuote = {
  ok: boolean;
  error?: string;
  address: string;
  counselRequired: boolean;
  governancePublic: boolean;
  voteWeight: number;
  components: {
    rootsPoolId: number;
    rootsLabel: string;
    rootsWeight: number;
    powerFactor: number;
    culturePowerScore: number | null;
    lpTier: number;
    lpFactor: number;
    lpBalanceWei: string | null;
    lpSource: string | null;
  };
  formula: string;
  docsUrl: string;
};

function lpFactorFromTier(lpTier: number): number {
  if (lpTier >= 2) return 1.1;
  return 1.0;
}

export async function computeDaoVotingWeight(address: string): Promise<DaoVotingWeightQuote> {
  const addr = address.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(addr)) {
    return {
      ok: false,
      error: "invalid_address",
      address: addr,
      counselRequired: true,
      governancePublic: false,
      voteWeight: 0,
      components: {
        rootsPoolId: 0,
        rootsLabel: "None",
        rootsWeight: 0,
        powerFactor: 1,
        culturePowerScore: null,
        lpTier: 0,
        lpFactor: 1,
        lpBalanceWei: null,
        lpSource: null,
      },
      formula: "voteWeight = rootsWeight × powerFactor × lpFactor",
      docsUrl: "/docs/BCC_DAO_GOVERNANCE.md",
    };
  }

  const wallet = addr as Address;
  const governancePublic = process.env.DAO_GOVERNANCE_PUBLIC === "1";
  const counselRequired = !governancePublic;

  const rootsPoolId = await resolveStakingBoostPoolId(wallet);
  const rootsWeight =
    rootsPoolId > 0 ? (ROOTS_WEIGHT_BY_POOL[rootsPoolId] ?? 1) : OBSERVER_ROOTS_WEIGHT;

  let powerFactor = 1;
  let culturePowerScore: number | null = null;
  if (isCulturePowerEnabledServer()) {
    const { getPrisma } = await import("@/server/db/prisma");
    const prisma = getPrisma();
    if (prisma) {
      const { getMemberPowerQuote } = await import("@/server/member/culture-power");
      const power = await getMemberPowerQuote(prisma, wallet);
      culturePowerScore = power.powerScore;
      powerFactor = power.effectiveMultiplierBps / 10_000;
    }
  }

  const lp = await walletHasBccLpProof(wallet);
  const lpBalanceWei = lp.balance ?? null;
  const lpTier =
    lp.ok && lpBalanceWei ? lpTierFromBalanceWei(BigInt(lpBalanceWei)) : 0;
  const lpFactor = lpFactorFromTier(lpTier);

  const voteWeight = Number((rootsWeight * powerFactor * lpFactor).toFixed(4));

  return {
    ok: true,
    address: addr,
    counselRequired,
    governancePublic,
    voteWeight,
    components: {
      rootsPoolId,
      rootsLabel: ROOTS_LABEL_BY_POOL[rootsPoolId] ?? "Observer",
      rootsWeight,
      powerFactor,
      culturePowerScore,
      lpTier,
      lpFactor,
      lpBalanceWei,
      lpSource: lp.source ?? null,
    },
    formula: "voteWeight = rootsWeight × powerFactor × lpFactor",
    docsUrl: "/docs/BCC_DAO_GOVERNANCE.md",
  };
}
