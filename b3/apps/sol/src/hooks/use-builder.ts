"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { getDashboard, getOrCreateBuilder } from "@/lib/api/builder.functions";

export function useBuilder() {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async (address: string) => getOrCreateBuilder({ data: { walletAddress: address } }),
    onSuccess: () => {
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ["dashboard", walletAddress] });
      }
    },
  });

  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (connected && walletAddress && lastSynced.current !== walletAddress) {
      lastSynced.current = walletAddress;
      syncMutation.mutate(walletAddress);
    }
    if (!connected) {
      lastSynced.current = null;
    }
  }, [connected, walletAddress, syncMutation]);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      return getDashboard({ data: { walletAddress } });
    },
    enabled: !!walletAddress && connected,
  });

  return {
    walletAddress,
    connected,
    builder: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading || syncMutation.isPending,
    refetch: dashboardQuery.refetch,
  };
}
