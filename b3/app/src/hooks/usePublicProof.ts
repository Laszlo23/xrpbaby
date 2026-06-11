import { useQuery } from "@tanstack/react-query";

import type { PublicProofStats } from "@/server/public/proof";

type ProofResponse = { ok: boolean; proof?: PublicProofStats; error?: string };

export function usePublicProof() {
  return useQuery({
    queryKey: ["public", "proof"],
    queryFn: async () => {
      const res = await fetch("/api/investors/traction?view=proof");
      if (!res.ok) throw new Error("proof_failed");
      const data = (await res.json()) as ProofResponse;
      if (!data.ok || !data.proof) throw new Error(data.error ?? "proof_failed");
      return data.proof;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
