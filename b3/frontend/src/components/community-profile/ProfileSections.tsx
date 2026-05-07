import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import type { CommunityProfile } from "@/lib/community-profile/types";
import { strapiMediaUrl } from "@/lib/community-profile/strapi-url";
import { SOCIAL_PLATFORM_LABEL } from "@/lib/community-profile/social-labels";
import { OnchainSummarySection } from "./OnchainSummarySection";
import { ContactGateway } from "./ContactGateway";

export function ProfileSections({ profile }: { profile: CommunityProfile }) {
  const showWallets = profile.visibility?.showWallets !== false;
  const showActivity = profile.visibility?.showActivity !== false;
  const showSocialLinks = profile.visibility?.showSocialLinks !== false;

  const walletTargets = useMemo(
    () => profile.walletLinks?.map((w) => ({ chain: w.chain, address: w.address })) ?? [],
    [profile.walletLinks],
  );

  const tags =
    profile.focusTags
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 pb-nav-safe pt-6 md:px-8 md:pt-10">
      {tags.length > 0 ? (
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">Focus</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-zinc-300"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {profile.bio ? (
        <section className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">About</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{profile.bio}</p>
        </section>
      ) : null}

      <ContactGateway profile={profile} />

      {profile.gallery && profile.gallery.length > 0 ? (
        <section className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">Gallery</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {profile.gallery.map((g, i) => {
              const url = strapiMediaUrl(g);
              if (!url) return null;
              return (
                <div
                  key={g.id ?? i}
                  className="aspect-square overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {showSocialLinks && profile.socialLinks && profile.socialLinks.length > 0 ? (
        <section className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
            Social & links
          </p>
          <div className="flex flex-col gap-2">
            {profile.socialLinks.map((s, i) => (
              <a
                key={`${s.platform}-${i}`}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/[0.05]"
              >
                <span>
                  {SOCIAL_PLATFORM_LABEL[s.platform]}
                  {s.label ? <span className="text-zinc-500"> · {s.label}</span> : null}
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-zinc-600" />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {showWallets && walletTargets.length > 0 ? (
        <section className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">Wallets</p>
          <div className="space-y-2">
            {profile.walletLinks?.map((w, i) => (
              <div
                key={`${w.chain}-${w.address}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    {w.chain}
                    {w.verifiedAt ? (
                      <span className="ml-2 text-emerald-400/90">verified</span>
                    ) : (
                      <span className="ml-2 text-zinc-500">unverified</span>
                    )}
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-300 break-all">{w.address}</p>
                  {w.label ? <p className="mt-1 text-xs text-zinc-500">{w.label}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
          On-chain snapshot
        </p>
        <p className="text-xs text-zinc-600">
          Phase A: balances and simple counters from public RPCs (no indexer).
        </p>
        <OnchainSummarySection wallets={walletTargets} enabled={showActivity} />
      </section>
    </div>
  );
}
