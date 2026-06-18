"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import bs58 from "bs58";

import { getClaimNonce } from "@/lib/api/builder.functions";
import { claimMissionReward } from "@/lib/api/rewards.functions";
import { buildClaimMessage } from "@/lib/solana/claim-message";

export function useClaimReward(walletAddress: string | undefined) {
  const { signMessage } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionSlug: string) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      if (!signMessage) throw new Error("Wallet does not support message signing");

      const { nonce } = await getClaimNonce({
        data: { walletAddress, missionSlug },
      });

      const message = buildClaimMessage(walletAddress, missionSlug, nonce);
      const encoded = new TextEncoder().encode(message);
      const signature = await signMessage(encoded);

      return claimMissionReward({
        data: {
          walletAddress,
          missionSlug,
          nonce,
          signature: bs58.encode(signature),
        },
      });
    },
    onSuccess: () => {
      if (walletAddress) {
        queryClient.invalidateQueries({ queryKey: ["dashboard", walletAddress] });
        queryClient.invalidateQueries({ queryKey: ["achievements", walletAddress] });
        queryClient.invalidateQueries({ queryKey: ["bcc-balance", walletAddress] });
      }
    },
  });
}
