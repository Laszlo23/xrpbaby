import { useAccount, useChainId, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

/** SIWE for points-ledger server functions (tasks, daily chain check-in, proofs). */
export function usePointsSiweSign() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();

  async function signSiwe(): Promise<{ prepared: string; signature: string } | undefined> {
    if (!address || !chainId) return undefined;
    const message = new SiweMessage({
      domain: typeof window !== "undefined" ? window.location.host : "localhost",
      address,
      statement: `Sign in to ${BRAND_DISPLAY_NAME} points ledger.`,
      uri: typeof window !== "undefined" ? window.location.origin : "",
      version: "1",
      chainId,
      nonce: crypto.randomUUID(),
    });
    const prepared = message.prepareMessage();
    const signature = await signMessageAsync({ message: prepared });
    return { prepared, signature };
  }

  return { signSiwe, signing };
}
