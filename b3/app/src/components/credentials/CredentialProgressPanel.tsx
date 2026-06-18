import { Link } from "@tanstack/react-router";
import type { CredentialSlug } from "@/lib/credentials/credential-catalog";

export type CredentialProgressItem = {
  slug: CredentialSlug;
  name: string;
  eligible: boolean;
  earned: boolean;
  reason: string;
  progress: number;
  progressLabel: string;
  ctaHref: string;
  ctaLabel: string;
};

const THRESHOLDS: Record<
  Exclude<CredentialSlug, "trusted-agent" | "verified-project">,
  { target: number; unit: string; ctaHref: string; ctaLabel: string }
> = {
  builder: { target: 1, unit: "Studio project", ctaHref: "/studio", ctaLabel: "Ship in Studio" },
  contributor: {
    target: 500,
    unit: "Culture Points",
    ctaHref: "/forest/quests",
    ctaLabel: "Complete quests",
  },
  "community-leader": {
    target: 5,
    unit: "referrals",
    ctaHref: "/forest",
    ctaLabel: "Grow the forest",
  },
  "verified-human": {
    target: 1,
    unit: "human attestation",
    ctaHref: "/pass",
    ctaLabel: "Link attestation",
  },
};

export function buildCredentialProgressItems(input: {
  catalog: Array<{ slug: CredentialSlug; name: string }>;
  eligibility: Array<{ slug: string; eligible: boolean; earned: boolean; reason: string }>;
  pointsTotal?: number;
  questCount?: number;
  studioProjectCount?: number;
  referralCount?: number;
  hasHumanAttestation?: boolean;
}): CredentialProgressItem[] {
  return input.catalog
    .filter((c) => c.slug !== "trusted-agent" && c.slug !== "verified-project")
    .map((item) => {
      const row = input.eligibility.find((e) => e.slug === item.slug);
      const meta = THRESHOLDS[item.slug as keyof typeof THRESHOLDS];
      let current = 0;
      let progress = 0;
      if (item.slug === "builder") {
        const studio = input.studioProjectCount ?? 0;
        const builds = input.questCount ?? 0;
        if (studio >= 1 || builds >= 3) {
          progress = 100;
        } else {
          progress = Math.max(
            Math.round((studio / 1) * 100),
            Math.round((builds / 3) * 100),
          );
        }
        current = studio >= 1 ? 1 : builds;
      } else if (item.slug === "contributor") {
        const pts = input.pointsTotal ?? 0;
        const quests = input.questCount ?? 0;
        if (pts >= 500 || quests >= 10) progress = 100;
        else progress = Math.max(Math.round((pts / 500) * 100), Math.round((quests / 10) * 100));
        current = pts >= 500 ? 500 : quests >= 10 ? 10 : pts;
      } else if (item.slug === "community-leader") {
        current = input.referralCount ?? 0;
        progress = Math.min(100, Math.round((current / meta.target) * 100));
      } else if (item.slug === "verified-human") {
        current = input.hasHumanAttestation ? 1 : 0;
        progress = current * 100;
      }
      return {
        slug: item.slug,
        name: item.name,
        eligible: row?.eligible ?? false,
        earned: row?.earned ?? false,
        reason: row?.reason ?? "",
        progress: row?.earned ? 100 : progress,
        progressLabel: row?.earned
          ? "Earned"
          : `${Math.min(current, meta.target)} / ${meta.target} ${meta.unit}`,
        ctaHref: meta.ctaHref,
        ctaLabel: meta.ctaLabel,
      };
    });
}

type CredentialProgressPanelProps = {
  items: CredentialProgressItem[];
  hasCultureIdentity?: boolean;
};

export function CredentialProgressPanel({
  items,
  hasCultureIdentity = false,
}: CredentialProgressPanelProps) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
      <h2 className="font-heading text-xl font-semibold text-white">Unlock progress</h2>
      {!hasCultureIdentity ? (
        <p className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Mint your Culture ID first — credentials attach to your `.culture` name.{" "}
          <Link to="/pass" className="font-semibold text-[#C5FF41] underline-offset-2 hover:underline">
            Claim pass →
          </Link>
        </p>
      ) : null}
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item.slug} className="rounded-xl border border-white/[0.06] px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-100">{item.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{item.reason || item.progressLabel}</p>
              </div>
              {!item.earned && !item.eligible ? (
                <Link
                  to={item.ctaHref}
                  className="text-xs font-semibold text-[#C5FF41] hover:text-white"
                >
                  {item.ctaLabel} →
                </Link>
              ) : item.eligible && !item.earned ? (
                <span className="text-xs font-semibold text-emerald-400">Ready to claim</span>
              ) : item.earned ? (
                <span className="text-xs font-semibold text-[#C5FF41]">Earned</span>
              ) : null}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C5FF41]/80 to-emerald-400/80 transition-all duration-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">{item.progressLabel}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
