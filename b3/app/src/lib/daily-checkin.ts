import type { Address } from "viem";
import { resolveDailyCheckInAddress } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

/** Matches `DailyCheckIn.sol`: `block.timestamp / 1 days` (UTC day index). */
export function utcCheckInDayIndex(nowSec = Math.floor(Date.now() / 1000)): bigint {
  return BigInt(Math.floor(nowSec / 86_400));
}

export function getDailyCheckInAddress(): Address | undefined {
  return resolveDailyCheckInAddress(getDefaultChain().id, env());
}
