import { IDENTITY_LAUNCH_REFERRAL_CODE } from "@/lib/identity/referral-constants";
import { IDENTITY_MINT_BASE_USD, IDENTITY_MINT_TIER_SIZE } from "@/lib/identity/mint-ladder";

type Props = {
  mintsLeftInTier?: number;
  compact?: boolean;
};

export function MintFlowGuide({ mintsLeftInTier, compact = false }: Props) {
  const promoLine =
    mintsLeftInTier !== undefined && mintsLeftInTier > 0
      ? `${mintsLeftInTier} spots left at $${IDENTITY_MINT_BASE_USD.toFixed(2)}`
      : `First ${IDENTITY_MINT_TIER_SIZE} members mint at $${IDENTITY_MINT_BASE_USD.toFixed(2)}`;

  const steps = [
    "Connect wallet on Base Mainnet",
    "Pick a 4+ letter name (e.g. yourname.culture)",
    `Enter invite code ${IDENTITY_LAUNCH_REFERRAL_CODE}`,
    `Confirm mint — ${promoLine}`,
  ];

  if (compact) {
    return (
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-zinc-400">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--base-blue)]/25 bg-[var(--base-blue)]/5 px-5 py-4 text-left">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--base-blue)]">
        How minting works
      </p>
      <p className="mt-2 text-sm text-zinc-300">
        Culture IDs mint on <strong className="text-white">Base Mainnet</strong>. You pay a small
        amount of ETH — not BNB — and get a transferable profile at{" "}
        <code className="text-zinc-200">/id/yourname.culture</code>.
      </p>
      <ol className="mt-4 space-y-2">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm text-zinc-400">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-xs text-[#C5FF41]">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
