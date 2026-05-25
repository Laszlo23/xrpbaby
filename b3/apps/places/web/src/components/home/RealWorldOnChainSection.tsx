import Link from "next/link";

const pillars = [
  {
    title: "Real estate",
    body: "Underlying parcels and SPV structures vary by issuer — disclosures sit off-chain and on your Legal pages.",
    href: "/properties",
    cta: "Browse listings",
  },
  {
    title: "Smart contracts",
    body: "Property share tokens, AMM pools, and compliance hooks — verify bytecode and transactions on the explorer.",
    href: "/contracts",
    cta: "View contracts",
  },
  {
    title: "Community governance",
    body: "Where regulation permits, holders and issuers can align on upgrades and parameters — roadmap-dependent.",
    href: "/community",
    cta: "Community",
  },
  {
    title: "Rental revenue",
    body: "Cash flows are contract- and issuer-dependent; not guaranteed returns — see each offering’s documents.",
    href: "/legal/risk",
    cta: "Read risks",
  },
];

export function RealWorldOnChainSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Real world + on-chain</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Architecture you can inspect</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Physical assets meet programmable settlement — with compliance and issuer rules at the center.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="glass-card glass-card-interactive flex flex-col rounded-2xl border border-eco/15 bg-forest/25 p-6 transition hover:border-eco/35"
          >
            <h3 className="text-base font-semibold text-canvas">{p.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
            <Link href={p.href} className="mt-6 text-sm font-medium text-action hover:underline">
              {p.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
