"use client";

import { IconInstagram, IconLinkedIn, IconX } from "@/components/social/SocialIcons";
import { getSocialUrl } from "@/lib/social-links";

const sizes = {
  default:
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/85 backdrop-blur-sm transition hover:border-white/35 hover:bg-white/10 hover:text-white",
  compact:
    "flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/90 backdrop-blur-md transition active:scale-95 hover:border-white/40 hover:bg-white/10 hover:text-white",
} as const;

const iconSizes = {
  default: "h-4 w-4",
  compact: "h-3.5 w-3.5",
} as const;

type Size = "default" | "compact";

export function ExperienceSocialLinks({ size = "default" }: { size?: Size }) {
  const items = [
    { platform: "x" as const, label: "X", Icon: IconX },
    { platform: "instagram" as const, label: "Instagram", Icon: IconInstagram },
    { platform: "linkedin" as const, label: "LinkedIn", Icon: IconLinkedIn },
  ];
  const linkClass = sizes[size];
  const iconClass = iconSizes[size];

  return (
    <nav
      className={`flex flex-wrap items-center justify-end ${size === "compact" ? "gap-1" : "gap-1.5 sm:gap-2"}`}
      aria-label="Social media"
    >
      {items.map(({ platform, label, Icon }) => (
        <a
          key={platform}
          href={getSocialUrl(platform)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label={`${label} (@buildingcultu3)`}
        >
          <Icon className={iconClass} />
        </a>
      ))}
    </nav>
  );
}
