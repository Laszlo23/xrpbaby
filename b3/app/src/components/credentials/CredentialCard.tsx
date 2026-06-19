import {
  Bot,
  Building2,
  Crown,
  Hammer,
  Shield,
  Shirt,
  Sprout,
  type LucideIcon,
} from "lucide-react";

import type { CredentialCatalogEntry } from "@/lib/credentials/credential-catalog";

const ICONS: Record<CredentialCatalogEntry["icon"], LucideIcon> = {
  hammer: Hammer,
  seedling: Sprout,
  crown: Crown,
  shield: Shield,
  bot: Bot,
  building: Building2,
  shirt: Shirt,
};

export type CredentialCardStatus = "locked" | "eligible" | "earned" | "expired";

export type CredentialCardProps = {
  slug: string;
  name: string;
  description: string;
  purpose?: string;
  unlocks?: string[];
  earnSummary?: string;
  icon?: string;
  accent?: string;
  status: CredentialCardStatus;
  reason?: string;
  evidenceLine?: string;
  onClaim?: () => void;
  claimPending?: boolean;
};

export function CredentialCard({
  name,
  description,
  purpose,
  unlocks = [],
  earnSummary,
  icon = "shield",
  accent = "#C5FF41",
  status,
  reason,
  evidenceLine,
  onClaim,
  claimPending,
}: CredentialCardProps) {
  const Icon = ICONS[icon as CredentialCatalogEntry["icon"]] ?? Shield;

  const statusLabel: Record<CredentialCardStatus, string> = {
    locked: "Locked",
    eligible: "Eligible",
    earned: "Earned",
    expired: "Expired",
  };

  const statusStyles: Record<CredentialCardStatus, string> = {
    locked: "border-zinc-700/50 bg-zinc-900/40 text-zinc-500",
    eligible: "border-emerald-500/40 bg-emerald-950/30 text-emerald-200",
    earned: "border-[#C5FF41]/40 bg-[#C5FF41]/10 text-[#C5FF41]",
    expired: "border-amber-500/30 bg-amber-950/20 text-amber-200",
  };

  return (
    <article className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
          style={{ color: accent }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusStyles[status]}`}
        >
          {statusLabel[status]}
        </span>
      </div>

      <h3 className="mt-4 font-heading text-lg font-semibold text-white">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{description}</p>

      {purpose ? (
        <p className="mt-3 text-xs text-zinc-500">
          <span className="text-zinc-600">Purpose: </span>
          {purpose}
        </p>
      ) : null}

      {unlocks.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-zinc-500">
          {unlocks.slice(0, 3).map((u) => (
            <li key={u}>· Unlocks: {u}</li>
          ))}
        </ul>
      ) : null}

      {earnSummary && status !== "earned" ? (
        <p className="mt-3 text-xs text-zinc-600">
          <span className="text-zinc-500">Earn: </span>
          {earnSummary}
        </p>
      ) : null}

      {reason ? <p className="mt-3 text-xs text-zinc-500">{reason}</p> : null}

      {evidenceLine && status === "earned" ? (
        <p className="mt-2 font-mono text-xs text-[#C5FF41]/90">{evidenceLine}</p>
      ) : null}

      {status === "eligible" && onClaim ? (
        <button
          type="button"
          disabled={claimPending}
          onClick={onClaim}
          className="mt-4 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {claimPending ? "Claiming…" : "Claim credential"}
        </button>
      ) : null}
    </article>
  );
}
