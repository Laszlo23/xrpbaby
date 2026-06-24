import { Link } from "@tanstack/react-router";
import { Check, Fingerprint, Plus } from "lucide-react";

import { useWalletCultureIdentities } from "@/hooks/useWalletCultureIdentities";

type Props = {
  /** Show link to mint another name. */
  showMintAnother?: boolean;
  compact?: boolean;
};

export function WalletIdentitiesPanel({ showMintAnother = true, compact = false }: Props) {
  const { identities, activeName, setActiveName, isLoading, hasMultiple } =
    useWalletCultureIdentities();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-zinc-500">
        Loading your Culture IDs…
      </div>
    );
  }

  if (identities.length === 0) {
    return null;
  }

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-[#C5FF41]/20 bg-[#C5FF41]/5 px-4 py-4"
          : "rounded-3xl border border-[#C5FF41]/25 bg-gradient-to-br from-[#C5FF41]/10 to-transparent px-5 py-5 sm:px-6"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-[#C5FF41]" aria-hidden />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Your Culture IDs
            </p>
            <p className="mt-0.5 text-sm text-zinc-400">
              {hasMultiple
                ? "Choose which name you want active across the app."
                : "This is the name shown on your dashboard and profile."}
            </p>
          </div>
        </div>
        {showMintAnother ? (
          <Link
            to="/pass"
            search={{ manage: "1" }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:border-[#C5FF41]/40"
          >
            <Plus className="h-3.5 w-3.5" />
            Mint another
          </Link>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2">
        {identities.map((name) => {
          const isActive = name === activeName;
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => setActiveName(name)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#C5FF41]/50 bg-[#C5FF41]/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <span className="min-w-0 truncate font-display text-base font-semibold text-white sm:text-lg">
                  {name}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#C5FF41]">
                      <Check className="h-3.5 w-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      Use this
                    </span>
                  )}
                  <Link
                    to="/id/$name"
                    params={{ name }}
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-[10px] text-[#00E5FF] underline underline-offset-2 hover:text-[#00E5FF]/80"
                  >
                    Profile
                  </Link>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
