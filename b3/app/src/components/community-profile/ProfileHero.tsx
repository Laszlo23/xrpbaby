import { strapiMediaUrl } from "@/lib/community-profile/strapi-url";
import type { CommunityProfile } from "@/lib/community-profile/types";
import { SocialQuickLinks } from "@/components/community-profile/SocialQuickLinks";

function bioExcerpt(bio: string | null | undefined, max = 260): string | null {
  if (!bio?.trim()) return null;
  const t = bio.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function ProfileHero({
  profile,
  shareUrl,
}: {
  profile: CommunityProfile;
  shareUrl?: string;
}) {
  const cover = strapiMediaUrl(profile.cover ?? undefined);
  const avatar = strapiMediaUrl(profile.avatar ?? undefined);
  const excerpt = bioExcerpt(profile.bio);
  const showSocialStrip = profile.visibility?.showSocialLinks !== false;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02]">
      <div className="aspect-[21/9] w-full bg-zinc-900">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover opacity-90" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1a1025] via-zinc-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      </div>

      <div className="relative px-5 pb-8 pt-0 md:px-10">
        <div className="-mt-14 flex flex-col gap-4 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-[0_20px_60px_-20px_rgb(0_0_0/80%)] md:h-32 md:w-32">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--b3-purple)] to-[var(--base-blue-midnight)] font-heading text-3xl font-bold text-white">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2 pb-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                @{profile.slug}
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {profile.displayName}
              </h1>
              {profile.headline ? (
                <p className="max-w-xl text-base text-zinc-400 md:text-lg">{profile.headline}</p>
              ) : null}
              {excerpt ? (
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-base">
                  {excerpt}
                </p>
              ) : null}
              {showSocialStrip && profile.socialLinks?.length ? (
                <SocialQuickLinks links={profile.socialLinks} />
              ) : null}
              {profile.ownerMasked ? (
                <p className="font-mono text-xs text-zinc-600">Owner {profile.ownerMasked}</p>
              ) : null}
            </div>
          </div>
          {shareUrl ? (
            <button
              type="button"
              className="shrink-0 self-start rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-300 transition hover:bg-white/[0.08]"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
              }}
            >
              Copy link
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
