import Link from "next/link";

const ROADMAP_ITEMS = [
  "Tokenized property markets",
  "Real estate liquidity pools",
  "On-chain mortgages (roadmap; issuer- and regulator-dependent)",
  "AI / oracle valuation signals (reference; issuer filings govern)",
  "Global secondary markets where rules allow",
];

export function VisionSection() {
  return (
    <section className="glass-card border-eco/25 bg-forest/30 p-8 sm:p-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Vision</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Turning cities into community-owned assets.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        We&apos;re building infrastructure so community-led rounds can meet property-linked share tokens and transparent
        liquidity — a flagship ecosystem for culture-forward real estate, where regulation permits. Nothing here
        guarantees a listing, bank product, or loan program.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROADMAP_ITEMS.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-eco/15 bg-forest/40 px-4 py-3 text-sm text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-6">
        <Link href="/roadmap" className="text-sm font-semibold text-action hover:underline">
          Full roadmap →
        </Link>
        <Link href="/legal/risk" className="text-sm text-muted hover:text-canvas">
          Risks &amp; disclaimer →
        </Link>
      </div>
    </section>
  );
}
