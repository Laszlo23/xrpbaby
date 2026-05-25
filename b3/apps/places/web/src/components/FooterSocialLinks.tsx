import { IconInstagram, IconLinkedIn, IconX } from "@/components/social/SocialIcons";
import { getSocialUrl, SOCIAL_HANDLE } from "@/lib/social-links";

const ring =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-zinc-300 transition hover:border-eco/40 hover:bg-eco/10 hover:text-eco-light";

export function FooterSocialLinks() {
  const items = [
    { platform: "x" as const, label: "X", Icon: IconX },
    { platform: "instagram" as const, label: "Instagram", Icon: IconInstagram },
    { platform: "linkedin" as const, label: "LinkedIn", Icon: IconLinkedIn },
  ];

  return (
    <div className="mt-8 rounded-xl border border-white/[0.08] bg-black/25 px-4 py-5 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-eco-muted">Community</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-300">
        Follow{" "}
        <a
          href={getSocialUrl("x")}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-eco-light underline-offset-4 transition hover:text-white hover:underline"
        >
          @{SOCIAL_HANDLE}
        </a>{" "}
        for Culture Land drops, launches, and behind-the-scenes — open the feed in a new tab anytime.
      </p>
      <nav className="mt-4 flex flex-wrap items-center gap-2.5" aria-label="Building Culture social profiles">
        {items.map(({ platform, label, Icon }) => (
          <a
            key={platform}
            href={getSocialUrl(platform)}
            target="_blank"
            rel="noopener noreferrer"
            className={ring}
            aria-label={`${label} (@${SOCIAL_HANDLE})`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        ))}
      </nav>
    </div>
  );
}
