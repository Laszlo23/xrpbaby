import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { usePlatformSiweSign } from "@/hooks/usePlatformSiweSign";

/** SIWE for points-ledger server functions (tasks, daily chain check-in, proofs). */
export function usePointsSiweSign() {
  const { signPlatformSiwe, signing } = usePlatformSiweSign();

  async function signSiwe(): Promise<
    { prepared: string; signature: string; address: string } | undefined
  > {
    return signPlatformSiwe(`Sign in to ${BRAND_DISPLAY_NAME} points ledger.`);
  }

  return { signSiwe, signing };
}
