import type { Address } from "viem";
import { resolveCultureChroniclesAddress } from "@bc/contracts-sdk";
import { parseBcdChainId } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

export function getCultureChroniclesAddress(): Address | undefined {
  return resolveCultureChroniclesAddress(parseBcdChainId(), env());
}

/** Skip key price — matches contract SKIP_KEY_PRICE_WEI. */
export const CHRONICLE_SKIP_KEY_PRICE_WEI = 550_000_000_000_000n;

export const CHRONICLE_LAUNCH_EDITION_IDS = [1, 2, 3] as const;
