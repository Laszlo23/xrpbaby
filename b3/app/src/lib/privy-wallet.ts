import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

/** Privy login address — wagmi may lag behind embedded / linked wallets. */
export function usePrivyWalletAddress(): string | undefined {
  const { authenticated, user } = usePrivy();
  const { address } = useAccount();
  const { wallets } = useWallets();

  if (!authenticated) return undefined;

  if (address) return address;

  const linked = wallets.find((w) => w.address)?.address;
  if (linked) return linked;

  const embedded = user?.wallet?.address;
  if (embedded) return embedded;

  return undefined;
}
