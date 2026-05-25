import Link from "next/link";

const steps = [
  {
    title: "Discover projects",
    body: "Browse community-owned places — imagery, categories, and reference economics — then open the detail page.",
    href: "/properties",
    Icon: () => (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Invest on-chain",
    body: "Connect a wallet, meet compliance rules for your deployment, and buy fractional shares when pools exist.",
    href: "/invest",
    Icon: () => (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Earn rental yield",
    body: "Yield is contract- and issuer-dependent — not guaranteed. See disclosures for each property.",
    href: "/legal/risk",
    Icon: () => (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function HomeHowItWorksSimple() {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">How it works</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Three steps</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        From discovery to position — like a Kickstarter for real estate, with on-chain settlement where deployed.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
        {steps.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group glass-card glass-card-interactive block rounded-2xl border border-eco/15 bg-forest/25 p-8 transition hover:border-eco/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-eco/30 bg-eco/10 text-eco-light transition group-hover:border-action/40 group-hover:text-action-light">
              <s.Icon />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-canvas">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
            <span className="mt-6 inline-flex text-sm font-medium text-action group-hover:underline">Learn more →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
