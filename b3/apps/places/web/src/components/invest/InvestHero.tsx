import Link from "next/link";

export function InvestHero() {
  return (
    <header className="space-y-4 text-center sm:text-left">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Invest</p>
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Invest in cultural real estate</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
        Own fractional exposure to curated properties through on-chain shares. Primary issuance uses{" "}
        <strong className="text-zinc-200">whole shares</strong> when a sale contract is configured — minimum{" "}
        <strong className="text-zinc-200">one whole share</strong> per purchase. Settlement is typically USDC on the listings
        chain (e.g. Base). Nothing here is an offer or suitability advice — see{" "}
        <Link href="/legal/risk" className="text-brand hover:underline">
          risks &amp; disclaimer
        </Link>
        .
      </p>
    </header>
  );
}
