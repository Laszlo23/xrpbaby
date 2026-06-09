import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { BuilderChronicle } from "@/components/story/BuilderChronicle";
import { BUILDER_PROFILE, shortWallet } from "@/content/builder-chronicle";
import { pageHead } from "@/lib/seo";
import { trackLandingEvent } from "@/lib/landing-api";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/story")({
  head: () =>
    pageHead({
      title: `Builder Chronicle — ${BRAND_DISPLAY_NAME}`,
      description:
        "From Web2 builder to Building Culture — IT since 1996, essays on Paragraph, and the long-horizon arc behind the culture economy on Base.",
      path: "/story",
      keywords: ["Building Culture", "founder", "Paragraph", "builder", "story", "0xLeonardo"],
    }),
  component: StoryPage,
});

function StoryPage() {
  return (
    <MarketingShell
      eyebrow="Builder chronicle"
      tone="cyan"
      title={
        <>
          From Web2 builder to{" "}
          <span className="bg-gradient-to-r from-white via-[#67e8f9] to-[#a78bfa] bg-clip-text text-transparent">
            Building Culture
          </span>
        </>
      }
      subtitle={`${BUILDER_PROFILE.legalName} (${BUILDER_PROFILE.displayName}) — decades of craft, proof-first culture on Base, and essays published on Paragraph.`}
      actions={
        <>
          <a
            href={BUILDER_PROFILE.paragraphUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              void trackLandingEvent("builder_chronicle_click", "story_hero", {
                target: "profile",
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]"
          >
            Paragraph · {shortWallet(BUILDER_PROFILE.wallet)}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
          <Link
            to="/team"
            className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-7 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1] active:scale-[0.98]"
          >
            Meet the team
          </Link>
        </>
      }
    >
      <BuilderChronicle />
    </MarketingShell>
  );
}
