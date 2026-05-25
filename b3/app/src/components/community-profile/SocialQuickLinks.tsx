import type { SocialLink } from "@/lib/community-profile/types";
import { SOCIAL_PLATFORM_LABEL } from "@/lib/community-profile/social-labels";

export function SocialQuickLinks({ links }: { links: SocialLink[] }) {
  const valid = links.filter((l) => l.url?.trim());
  if (valid.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {valid.map((s, i) => (
        <a
          key={`${s.platform}-${i}`}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-[var(--b3-purple)]/40 hover:bg-white/[0.08]"
        >
          {SOCIAL_PLATFORM_LABEL[s.platform] ?? s.platform}
        </a>
      ))}
    </div>
  );
}
