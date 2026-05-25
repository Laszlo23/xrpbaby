import { Link } from "@tanstack/react-router";
import { useGenesisVaultHighestTier } from "@/hooks/useGenesisVaultHighestTier";

/** Hero primary CTAs + optional hint when no Genesis vault pass detected. */
export function HeroVaultCtas(props: { onBeginJourney?: () => void }) {
  const { holdsAny, isPending } = useGenesisVaultHighestTier();
  const onBegin = props.onBeginJourney;

  return (
    <div className="mt-4 flex flex-col gap-2 sm:mt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2.5">
        <a
          href="#vault"
          className="cta-vault-glow inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]"
        >
          Enter vault
        </a>
        <a
          href="#drops"
          className="inline-flex items-center justify-center rounded-full border border-[rgb(212_175_55/0.35)] bg-white/[0.06] px-7 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-[rgb(212_175_55/0.5)] hover:bg-white/[0.1] active:scale-[0.98]"
        >
          View live drops
        </a>
        {onBegin ? (
          <button
            type="button"
            onClick={onBegin}
            className="inline-flex items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-7 py-3 text-sm font-medium text-emerald-50 backdrop-blur-md transition hover:bg-emerald-500/18 active:scale-[0.98]"
          >
            Find my path
          </button>
        ) : null}
      </div>
      {!isPending && !holdsAny ? (
        <p className="max-w-xl text-[11px] leading-snug text-zinc-500 md:text-xs">
          Want early positioning?{" "}
          <Link
            to="/genesis-district"
            className="text-zinc-300 underline underline-offset-2 hover:text-white"
          >
            Unlock vault access
          </Link>{" "}
          (Genesis vault pass — optional).
        </p>
      ) : null}
    </div>
  );
}
