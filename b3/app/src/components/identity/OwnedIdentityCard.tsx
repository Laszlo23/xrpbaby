import { Link } from "@tanstack/react-router";
import { Fingerprint, Settings } from "lucide-react";

import { useWalletCultureIdentity } from "@/hooks/useWalletCultureIdentity";

type OwnedIdentityCardProps = {
  /** Show link to mint another name (founders / power users). */
  allowExtraMint?: boolean;
};

export function OwnedIdentityCard({ allowExtraMint = false }: OwnedIdentityCardProps) {
  const { primaryName, isLoading } = useWalletCultureIdentity();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-zinc-500">
        Verifying your Culture ID…
      </div>
    );
  }

  if (!primaryName) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-[#C5FF41]/25 bg-gradient-to-br from-[#C5FF41]/10 to-transparent p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C5FF41]/40 bg-black/40">
        <Fingerprint className="h-7 w-7 text-[#C5FF41]" strokeWidth={1.75} />
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        Your Culture ID
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{primaryName}</p>
      <p className="mt-2 text-sm text-zinc-400">
        You already own an identity. No need to mint again — grow your legacy from your profile.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/id/$name"
          params={{ name: primaryName }}
          className="inline-flex items-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
        >
          View profile →
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white hover:border-white/30"
        >
          <Settings className="h-4 w-4" />
          Dashboard
        </Link>
        {allowExtraMint ? (
          <Link
            to="/pass"
            search={{ manage: "1" }}
            className="text-xs text-zinc-500 underline hover:text-zinc-300"
          >
            Claim another name
          </Link>
        ) : null}
      </div>
    </div>
  );
}
