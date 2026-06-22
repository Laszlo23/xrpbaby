import { useAccount } from "wagmi";

import { privyEnabled } from "@/lib/privy-env";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";

/** Active wallet address — Privy auth or legacy wagmi connect. */
export function useLinkedWalletAddress(): string | undefined {
  const privyAddress = usePrivyWalletAddress();
  const { address, isConnected } = useAccount();

  if (privyEnabled) return privyAddress ?? (isConnected ? address : undefined);
  return isConnected ? address : undefined;
}
