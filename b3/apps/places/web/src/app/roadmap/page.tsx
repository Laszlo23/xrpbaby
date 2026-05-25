import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Roadmap — Building Culture",
  description:
    "Strategic direction: a purpose-built appchain and a clear standard for tokenized real estate—plus milestones on audits, liquidity, and interoperability. Partner- and regulator-dependent; not a delivery guarantee.",
};

/**
 * Ordered journey for capital and distributions — reference sequence, not a binding schedule.
 * Actual timing is issuer-, jurisdiction-, and offering-specific; see legal disclosures.
 */
const mainnetFundsJourney = [
  {
    step: "1",
    title: "Mainnet deployment",
    when: "After audited contracts are deployed and addresses are published",
    detail:
      "The protocol and property share contracts are deployed on Base mainnet for production traffic. Verify you are on Base (chain id 8453) in your wallet before sending funds.",
  },
  {
    step: "2",
    title: "Offering & eligibility",
    when: "When an issuer opens a round (if applicable)",
    detail:
      "Each property or programme may have subscription documents, minimums, and caps. You only become eligible to send funds after you accept disclosures and meet issuer criteria for that offering.",
  },
  {
    step: "3",
    title: "KYC / AML complete",
    when: "Before your wallet can receive restricted tokens or certain payouts",
    detail:
      "ComplianceRegistry (or the issuer’s provider) must mark your wallet as verified where regulation requires it. Fulfilling KYC does not by itself obligate any transfer — it unlocks permitted flows per issuer rules.",
  },
  {
    step: "4",
    title: "Capital deployed",
    when: "After subscription clears and settlement completes",
    detail:
      "Funds move per the offering’s instructions (e.g. swap into share tokens, escrow release). Settlement timing is issuer- and bank-rail-dependent — not instant by default.",
  },
  {
    step: "5",
    title: "Ongoing distributions",
    when: "Per issuer schedule and smart-contract rules post-closing",
    detail:
      "Rental income, fees, or other cash flows — if and when declared — are distributed according to the SPV / issuer waterfall and on-chain logic. Past behaviour on any network is not a forecast of future returns.",
  },
];

const phases = [
  {
    phase: "Direction",
    title: "Appchain & standards (longer arc)",
    items: [
      "Research and design toward a purpose-built appchain that can carry tokenized real estate with explicit rules and auditability",
      "Public-facing patterns for RWA share tokens: metadata, disclosures, and reference contracts—so wallets, indexers, and venues can integrate consistently where permitted",
      "Governance and transparency hooks aligned with community participation, subject to jurisdiction and issuer structure",
    ],
  },
  {
    phase: "Now",
    title: "Production on Base",
    items: [
      "Registry + share factory + AMM swap + staking + portfolio flows with published addresses",
      "Culture Land property metadata, funding UI, and transparency pages",
      "Operator runbooks and environment sync for reproducible deployments",
    ],
  },
  {
    phase: "Next",
    title: "Hardening",
    items: [
      "External audits and bug bounties before mainnet",
      "Indexer / subgraph for property and pool analytics",
      "Production KYC and issuer console",
    ],
  },
  {
    phase: "Then",
    title: "Liquidity & access",
    items: [
      "Deeper pools and clearer routing for property share tokens",
      "Secondary market / venue listings where permitted — issuer- and venue-dependent",
      "Liquidity incentives and routing improvements (roadmap; not guaranteed timelines)",
      "Issuer-approved disclosures linked from each property",
    ],
  },
  {
    phase: "Product layers",
    title: "Yield, pricing, and distribution (roadmap)",
    items: [
      "Rental or cash-flow yield distribution — contract- and issuer-dependent; not guaranteed returns",
      "Oracle-assisted or AI-assisted pricing signals — reference until audited; Legal for context",
    ],
  },
  {
    phase: "Parallel",
    title: "Cross-chain & bridges",
    items: [
      "Documented core contract addresses on Base (see contracts page)",
      "Optional bridge or liquidity routing — subject to security review and issuer policy",
    ],
  },
  {
    phase: "Longer term",
    title: "Community alignment",
    items: [
      "Governance experiments where regulation permits",
      "Education and transparency as first-class product features",
      "Clearer ownership rails so participation and capital formation are less dependent on opaque, concentrated gatekeeping",
    ],
  },
  {
    phase: "Ecosystem",
    title: "Interoperability (non-binding)",
    items: [
      "Document patterns so compatible share tokens can be supported by wallets, indexers, and venues that choose to list permitted instruments",
      "Explore collateral and credit use cases only with licensed partners — no guaranteed bank or CEX integration",
      "Where regulation allows, reduce single-point reliance on traditional bank-led credit and custody pipelines by offering verifiable alternatives",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-16">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Plan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Roadmap</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Honest milestones — not a promise of delivery dates. Priorities depend on audits, partners, and regulation.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
          Our long-term direction is infrastructure for tokenized real estate with explicit rules and interoperable
          patterns—toward a purpose-built appchain that embodies that standard. The aim is to broaden access to
          capital and ownership and to reduce excessive reliance on concentrated intermediation in legacy finance,
          while staying inside applicable law and issuer obligations.
        </p>
      </header>

      <section
        className="rounded-2xl border border-eco/25 bg-forest/25 p-6 sm:p-8"
        aria-labelledby="strategic-direction-heading"
      >
        <h2 id="strategic-direction-heading" className="text-xl font-semibold tracking-tight text-white">
          Strategic direction
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          We are building toward a dedicated chain layer and a practical standard for tokenized property so communities
          and investors can participate with transparent rails—ownership and liquidity aligned with{" "}
          <strong className="font-medium text-zinc-300">people</strong> and place, not opaque pipelines alone. Outcomes
          still depend on law, partners, audits, and market structure—not slogans.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-400">
          <li>
            <strong className="font-medium text-zinc-300">Appchain</strong> — a focused execution environment for RWA
            workflows, compliance hooks, and governance where permitted.
          </li>
          <li>
            <strong className="font-medium text-zinc-300">Standard</strong> — shared contracts, metadata, and disclosure
            patterns so tokenized real estate can be read and integrated consistently across wallets and venues.
          </li>
          <li>
            <strong className="font-medium text-zinc-300">Access</strong> — fewer choke points in how housing-linked
            capital is raised and settled, without pretending regulation or risk disappear.
          </li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          For risks and regulatory context, see{" "}
          <Link href="/legal/risk" className="text-action hover:underline">
            Risks &amp; disclaimer
          </Link>
          .
        </p>
      </section>

      <section
        className="rounded-2xl border border-eco/25 bg-forest/25 p-6 sm:p-8"
        aria-labelledby="funds-journey-heading"
      >
        <h2 id="funds-journey-heading" className="text-xl font-semibold tracking-tight text-white">
          Receiving funds after mainnet &amp; KYC
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Below is the <strong className="font-medium text-zinc-300">typical order of operations</strong> for investors.
          It is <strong className="font-medium text-zinc-300">not</strong> a guaranteed calendar — dates, gates, and
          payouts depend on each issuer, the offering documents, and applicable law.
        </p>
        <ol className="mt-6 space-y-5">
          {mainnetFundsJourney.map((row) => (
            <li
              key={row.step}
              className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-4 sm:px-5 sm:py-5"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs font-semibold text-action">{row.step}</span>
                <h3 className="text-base font-semibold text-white">{row.title}</h3>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-eco-muted/90">{row.when}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{row.detail}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs leading-relaxed text-zinc-500">
          Nothing here is investment, tax, or legal advice. KYC status and smart-contract permissions can change with
          issuer policy and regulation. See{" "}
          <Link href="/legal/risk" className="text-action hover:underline">
            Risks &amp; disclaimer
          </Link>
          .
        </p>
      </section>

      <ol className="relative space-y-8 border-l border-white/[0.08] pl-8">
        {phases.map((p) => (
          <li key={p.phase} className="relative">
            <span className="absolute -left-[39px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-eco/50 bg-[#030303] text-[10px] font-bold text-action">
              •
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-eco-muted">{p.phase}</p>
            <h2 className="mt-1 text-lg font-semibold text-white">{p.title}</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-400">
              {p.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="text-center text-sm text-zinc-500">
        Verify deployments on the{" "}
        <Link href="/contracts" className="text-action hover:underline">
          contracts page
        </Link>
        .
      </p>
    </div>
  );
}
