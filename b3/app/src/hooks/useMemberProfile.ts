import { useQuery } from "@tanstack/react-query";

export type MemberProfile = {
  id: string;
  walletAddress: string;
  displayName: string | null;
  intent: string | null;
  supporterTier: string | null;
  forestStage: string | null;
  culturePoints: number;
};

async function fetchMemberProfile(address: string): Promise<MemberProfile | null> {
  const res = await fetch(`/api/member/me?address=${encodeURIComponent(address)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { ok?: boolean; member?: MemberProfile | null };
  return data.member ?? null;
}

export function useMemberProfile(address: string | undefined) {
  return useQuery({
    queryKey: ["member-profile", address?.toLowerCase()],
    queryFn: () => fetchMemberProfile(address!),
    enabled: Boolean(address),
    staleTime: 30_000,
  });
}
