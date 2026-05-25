import { zeroAddress } from "viem";

/** Base mainnet governance multisig (Safe). Not a user wallet — protocol admin / treasury governance. */
export type BaseGovernanceSafeInfo = {
  address: `0x${string}`;
  explorerUrl: string;
  safeAppUrl: string;
};

function stripSlash(s: string) {
  return s.replace(/\/$/, "");
}

/** Returns null if unset or zero — see `NEXT_PUBLIC_BASE_GOVERNANCE_SAFE`. */
export function getBaseGovernanceSafeInfo(): BaseGovernanceSafeInfo | null {
  const raw = process.env.NEXT_PUBLIC_BASE_GOVERNANCE_SAFE?.trim();
  if (!raw || raw.toLowerCase() === zeroAddress.toLowerCase()) return null;
  const address = raw as `0x${string}`;
  const explorer = stripSlash(process.env.NEXT_PUBLIC_BASE_EXPLORER ?? "https://basescan.org");
  return {
    address,
    explorerUrl: `${explorer}/address/${address}`,
    safeAppUrl: `https://app.safe.global/home?safe=base:${address}`,
  };
}
