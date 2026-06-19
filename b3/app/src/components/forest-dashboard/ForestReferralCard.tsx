import { useCallback, useMemo, useState } from "react";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";

import { sanitizeAgentRef } from "@/lib/agent-attribution";
import { getPublicAppOrigin } from "@/lib/app-origin";
import { communityTelegramUrl } from "@/lib/community-links";

type Props = {
  address: string;
};

function walletAgentRef(address: string): string {
  const raw = address.slice(2, 10).toLowerCase();
  return sanitizeAgentRef(raw) ?? raw;
}

export function ForestReferralCard({ address }: Props) {
  const [copied, setCopied] = useState(false);
  const agentRef = useMemo(() => walletAgentRef(address), [address]);
  const joinUrl = useMemo(() => {
    const origin = getPublicAppOrigin();
    const params = new URLSearchParams({
      agent_ref: agentRef,
      utm_source: "forest",
      utm_medium: "referral",
      utm_campaign: "dashboard",
    });
    return `${origin}/join?${params.toString()}`;
  }, [agentRef]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }, [joinUrl]);

  const shareText = encodeURIComponent(
    "Join me in Building Culture — earn Culture Points & climb the board 🌿",
  );
  const xShare = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(joinUrl)}`;
  const tgShare = `https://t.me/share/url?url=${encodeURIComponent(joinUrl)}&text=${shareText}`;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00E5FF]/15">
          <Users className="h-5 w-5 text-[#00E5FF]" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-white">Refer & earn</p>
          <p className="mt-1 text-xs text-zinc-400">Invite friends — attribution via your link</p>
        </div>
      </div>
      <div className="mt-4 flex-1 space-y-3">
        <div className="rounded-xl border border-zinc-800 bg-black/40 px-3 py-2">
          <p className="truncate font-mono text-[11px] text-zinc-400">{joinUrl}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#C5FF41] px-4 py-2 text-xs font-semibold text-black hover:bg-white"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={xShare}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-2 text-xs text-zinc-300 hover:border-white/30"
          >
            X
          </a>
          <a
            href={tgShare}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-2 text-xs text-zinc-300 hover:border-white/30"
          >
            Telegram
          </a>
          <a
            href={communityTelegramUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-2 text-xs text-zinc-300 hover:border-white/30"
          >
            Community
          </a>
        </div>
      </div>
    </div>
  );
}
