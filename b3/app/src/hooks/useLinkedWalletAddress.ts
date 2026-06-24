import { useWalletSession } from "@/hooks/useWalletSession";

/** Active wallet address — Privy auth or legacy wagmi connect. */
export function useLinkedWalletAddress(): string | undefined {
  return useWalletSession().address;
}
