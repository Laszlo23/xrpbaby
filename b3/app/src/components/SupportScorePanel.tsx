import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Shield } from "lucide-react";

type MemberSocial = {
  farcaster?: { fid: number; username: string | null } | null;
  neynarScore?: number | null;
  supportScore?: number;
  verifiedSocials?: Array<{ platform: string; handle: string }>;
};

export function SupportScorePanel({ className = "" }: { className?: string }) {
  const { address } = useAccount();
  const [data, setData] = useState<MemberSocial | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }
    void fetch(`/api/member/me?address=${address}`)
      .then((r) => r.json())
      .then((json: { member?: MemberSocial | null }) => setData(json.member ?? null))
      .catch(() => setData(null));
  }, [address]);

  if (!address || !data) return null;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
        <Shield className="h-3.5 w-3.5" aria-hidden />
        Support score
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
        {data.supportScore ?? 0}
      </p>
      {data.neynarScore != null ? (
        <p className="mt-1 text-xs text-zinc-400">
          Neynar quality: {(data.neynarScore * 100).toFixed(0)}%
        </p>
      ) : null}
      {data.farcaster ? (
        <p className="mt-2 text-sm text-violet-200">
          @{data.farcaster.username ?? data.farcaster.fid}
        </p>
      ) : null}
      {data.verifiedSocials && data.verifiedSocials.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {data.verifiedSocials.map((s) => (
            <li
              key={`${s.platform}-${s.handle}`}
              className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400"
            >
              {s.platform} · {s.handle}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
