"use client";

import { toast } from "sonner";
import { profileUrl } from "@/lib/seo/site";

export function ProfileActions({
  warpcastUrl,
  fullName,
}: {
  warpcastUrl: string | null;
  fullName: string;
}) {
  async function shareProfile() {
    const url = profileUrl(fullName);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="mt-10 flex flex-wrap gap-3">
      {warpcastUrl ? (
        <a
          href={warpcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-foreground px-5 py-2.5 font-display text-sm font-medium text-background transition hover:scale-[1.02]"
        >
          Follow on Warpcast
        </a>
      ) : (
        <a
          href="https://warpcast.com/~/link-wallet"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-foreground px-5 py-2.5 font-display text-sm font-medium text-background transition hover:scale-[1.02]"
        >
          Link Farcaster
        </a>
      )}
      <button
        type="button"
        onClick={() => void shareProfile()}
        className="glass rounded-full px-5 py-2.5 font-display text-sm transition hover:bg-surface-elevated"
      >
        Share profile
      </button>
    </div>
  );
}
