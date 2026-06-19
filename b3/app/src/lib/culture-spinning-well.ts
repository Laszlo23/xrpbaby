import type { Address } from "viem";
import { resolveCultureSpinningWellAddress } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

export function getCultureSpinningWellAddress(): Address | undefined {
  return resolveCultureSpinningWellAddress(getDefaultChain().id, env());
}
