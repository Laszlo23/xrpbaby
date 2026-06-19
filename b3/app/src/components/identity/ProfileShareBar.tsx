import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

import { shareNative } from "@/lib/campaign-share";

type ProfileShareBarProps = {
  shareUrl: string;
  title: string;
  text?: string;
};

export function ProfileShareBar({ shareUrl, title, text }: ProfileShareBarProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function handleShare() {
    const shared = await shareNative({
      title,
      text: text ?? title,
      url: shareUrl,
    });
    if (!shared) void handleCopy();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-[11px] text-zinc-400">
        <Link2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{shareUrl.replace(/^https?:\/\//, "")}</span>
      </span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/25 hover:text-white"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[#C5FF41]" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1.5 text-xs font-medium text-[#00E5FF] hover:bg-[#00E5FF]/20"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
    </div>
  );
}
