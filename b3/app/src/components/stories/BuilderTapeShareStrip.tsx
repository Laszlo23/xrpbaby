"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import type { BuilderTape } from "@/content/builder-tapes";
import { getPublicAppOrigin } from "@/lib/app-origin";
import { warpcastComposeUrl } from "@/lib/campaign-share";
import { twitterIntentUrl } from "@/lib/campaign-share";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BuilderTapeShareStripProps = {
  tape: BuilderTape;
  className?: string;
  onShared?: () => void;
};

export function BuilderTapeShareStrip({ tape, className, onShared }: BuilderTapeShareStripProps) {
  const [copied, setCopied] = useState(false);
  const origin = getPublicAppOrigin().replace(/\/$/, "");
  const episodeUrl = `${origin}/stories/tapes/${tape.slug}`;
  const composeText = `${tape.shareText} ${episodeUrl}`;

  function copyLink() {
    void navigator.clipboard?.writeText(episodeUrl).then(() => {
      setCopied(true);
      toast.success("Episode link copied");
      setTimeout(() => setCopied(false), 2000);
      onShared?.();
    });
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-[#00E5FF]/20 bg-gradient-to-br from-[#00E5FF]/5 via-black/40 to-transparent p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00E5FF]">
            Share this tape
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Spread the moment — daily share quests accept episode links with effort-based Culture
            Value.
          </p>
        </div>
        <Share2 className="h-6 w-6 shrink-0 text-[#00E5FF]/60" aria-hidden />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-full" asChild>
          <a href={warpcastComposeUrl(composeText)} target="_blank" rel="noreferrer">
            Compose on Farcaster
          </a>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <a href={twitterIntentUrl(composeText, episodeUrl)} target="_blank" rel="noreferrer">
            Compose on X
          </a>
        </Button>
        <Button type="button" variant="secondary" className="rounded-full" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </section>
  );
}
