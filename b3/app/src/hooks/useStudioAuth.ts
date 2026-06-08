import { usePrivy } from "@privy-io/react-auth";

import { usePrivyWalletAddress } from "@/lib/privy-wallet";

export function useStudioAuthPayload() {
  const address = usePrivyWalletAddress();
  const { authenticated, getAccessToken } = usePrivy();

  async function authPayload() {
    if (!address) throw new Error("Connect your wallet to use BC Studio.");
    const token = await getAccessToken().catch(() => null);
    if (authenticated && !token) {
      throw new Error("Session expired — sign out and sign in again.");
    }
    return {
      walletAddress: address,
      authorization: token ? `Bearer ${token}` : undefined,
    };
  }

  return { address, authenticated, authPayload };
}
