import Link from "next/link";

const PARTNER_LINKS = {
  wien: "https://www.wien.gv.at/",
  cultureLand: "/culture-land",
} as const;

/**
 * Architecture, planning partners, and institutional collaborators.
 * Replace text tiles with approved logo SVGs in `public/partners/` when trademark clearance is obtained.
 */
export function EcosystemPartnersSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-0" aria-labelledby="eco-partners-heading">
      <div className="rounded-3xl border border-eco/20 bg-gradient-to-b from-forest/40 to-black/20 px-6 py-10 sm:px-10 sm:py-12">
        <h2
          id="eco-partners-heading"
          className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-eco-muted"
        >
          Architecture &amp; partners
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-zinc-400">
          Planning, revitalisation, and civic collaboration — alongside the on-chain stack. Project narratives and
          sustainability notes:{" "}
          <Link href={PARTNER_LINKS.cultureLand} className="font-medium text-gold-400 hover:underline">
            Culture Land portfolio
          </Link>
          .
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/25 px-4 py-8 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Architects &amp; planning</p>
            <p className="mt-3 text-sm font-semibold text-white">STIX · studio collaborators</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Weinviertel &amp; Vienna programmes — façades, reuse, and village-scale design.
            </p>
            <Link
              href={PARTNER_LINKS.cultureLand}
              className="mt-4 text-xs font-medium text-eco-light hover:underline"
            >
              View portfolio →
            </Link>
          </div>

          <a
            href={PARTNER_LINKS.wien}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/25 px-4 py-8 text-center transition hover:border-eco/40 hover:bg-black/40"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Civic</p>
            <p className="mt-3 font-semibold tracking-tight text-white group-hover:text-eco-light">City of Vienna</p>
            <p className="mt-2 text-xs text-zinc-500">Stadt Wien — programmes &amp; urban context (link out).</p>
            <span className="mt-4 text-xs text-eco-light/90 group-hover:underline">wien.gv.at →</span>
          </a>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/15 px-4 py-8 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Logo slot</p>
            <p className="mt-3 text-sm text-zinc-500">Drop approved SVG/PNG into</p>
            <code className="mt-2 rounded bg-black/40 px-2 py-1 text-[10px] text-zinc-400">public/partners/</code>
          </div>
        </div>
      </div>
    </section>
  );
}
