import { useAccount, useChainId, useSignMessage } from "wagmi";

import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";

/** SIWE for points-ledger server functions (tasks, daily chain check-in, proofs). */
export function usePointsSiweSign() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();

  async function signSiwe(): Promise<{ prepared: string; signature: string; address: string } | undefined> {
    if (!address || !chainId) return undefined;
    const { prepared } = await buildPlatformSiweMessage(
      address,
      chainId,
      `Sign in to ${BRAND_DISPLAY_NAME} points ledger.`,
    );
    const signature = await signMessageAsync({ message: prepared });
    return { prepared, signature, address };
  }

  return { signSiwe, signing };
}
