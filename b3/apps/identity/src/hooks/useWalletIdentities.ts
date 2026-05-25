import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { fetchWalletIdentities } from "@/lib/chain/walletIdentities";

export function useWalletIdentities() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["walletIdentities", address],
    queryFn: () => fetchWalletIdentities(address!),
    enabled: Boolean(isConnected && address),
    staleTime: 60_000,
  });
}
