import { resolvePanicSwitchAttestationAddress, type EnvLike } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function env(): EnvLike {
  return import.meta.env as unknown as EnvLike;
}

export function getPanicSwitchAttestationAddress() {
  return resolvePanicSwitchAttestationAddress(getDefaultChain().id, env());
}

/** Matches `PanicSwitchAttestation.sol`: `block.timestamp / 1 days`. */
export function utcAttestDayIndex(now = new Date()): bigint {
  return BigInt(Math.floor(now.getTime() / 1000 / 86400));
}

/** Visible endurance seconds for on-chain attestation (integer seconds). */
export function panicHoldSecondsFromState(enduranceElapsedVisibleMs: number): number {
  return Math.min(5220, Math.max(0, Math.floor(enduranceElapsedVisibleMs / 1000)));
}
