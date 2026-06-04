import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Users } from "lucide-react";

type Suggestion = {
  address: string;
  farcasterUsername: string | null;
  supportScore: number;
  reason: string;
};

export function SupportSuggestions({ className = "" }: { className?: string }) {
  const { address } = useAccount();
  const [items, setItems] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!address) {
      setItems([]);
      return;
    }
    void fetch(`/api/social/suggestions?address=${address}&limit=6`)
      .then((r) => r.json())
      .then((json: { suggestions?: Suggestion[] }) => setItems(json.suggestions ?? []))
      .catch(() => setItems([]));
  }, [address]);

  if (!address || items.length === 0) return null;

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/35 p-4 ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
        <Users className="h-3.5 w-3.5" aria-hidden />
        Members to support
      </div>
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s.address} className="flex items-center justify-between text-sm text-zinc-300">
            <span>
              {s.farcasterUsername ? `@${s.farcasterUsername}` : `${s.address.slice(0, 8)}…`}
            </span>
            <span className="text-xs text-zinc-500">
              {s.reason === "mutual_supporter" ? "Mutual" : `Score ${s.supportScore}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
