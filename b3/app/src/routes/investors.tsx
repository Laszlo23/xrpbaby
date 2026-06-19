import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { DisclaimerBanner } from "@/components/investors/DisclaimerBanner";
import { ChainlinkComplianceStrip } from "@/components/investors/ChainlinkComplianceStrip";
import { InvestorCapitalRails } from "@/components/investors/InvestorCapitalRails";
import { InvestorLiveTraction } from "@/components/investors/InvestorLiveTraction";
import { InvestorTreasuryBalances } from "@/components/investors/InvestorTreasuryBalances";
import { ProductMap } from "@/components/investors/ProductMap";
import { TreasuryEntityArchitecture } from "@/components/investors/TreasuryEntityArchitecture";
import { XrplTestnetIntakePanel } from "@/components/investors/XrplTestnetIntakePanel";
import { TREASURY_REVENUE_RULES } from "@/lib/treasury-revenue-rules";

export const Route = createFileRoute("/investors")({
  head: () =>
    pageHead({
      title: "Investors — Building Culture Capital",
      description:
        "Investor overview: Building Culture Capital, BUILDCHAIN surfaces, BCC narrative, illustrative economics — not an offer or financial advice.",
      path: "/investors",
      keywords: [
        "Building Culture Capital",
        "BUILDCHAIN",
        "investors",
        "BCC",
        "treasury",
        "RWA",
        "Delaware LLC",
      ],
    }),
  component: InvestorsPage,
});

function InvestorsPage() {
  return (
    <MarketingShell
      eyebrow="Building Culture Capital"
      tone="purple"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          Culture on-chain —{" "}
          <span className="bg-gradient-to-r from-white via-[rgb(0_82_255/90%)] to-emerald-300/90 bg-clip-text text-transparent">
            receipts, not vibes
          </span>
        </>
      }
      subtitle="Published treasury labels, live Base balances, and a simpler stablecoin-first capital story. Live ops metrics below; scenario sliders on /plan are illustrative—see disclaimers."
      actions={
        <Link
          to="/places"
          className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]"
        >
          Start investing now
        </Link>
      }
    >
      <div className="flex flex-col gap-14 md:gap-16">
        <DisclaimerBanner />
        <section className="rounded-2xl border border-[rgb(0_82_255/25%)] bg-[rgb(0_82_255/8%)] px-5 py-4 text-sm text-zinc-300">
          <strong className="font-medium text-white">Live verification for due diligence:</strong>{" "}
          automated production checks, on-chain addresses, and downloadable JSON on{" "}
          <Link to="/grant-proof" className="text-white underline underline-offset-4">
            /grant-proof
          </Link>
          . Full seed narrative (native content, no slide images) on{" "}
          <Link to="/plan" className="text-white underline underline-offset-4">
            /plan
          </Link>
          . Operators run <code className="text-zinc-200">npm run grant:proof</code> before
          submissions.
        </section>
        <ChainlinkComplianceStrip />

        <InvestorCapitalRails />
        <InvestorTreasuryBalances />
        <XrplTestnetIntakePanel />

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-heading text-lg font-semibold text-white">Infrastructure rails</h2>
          <p className="text-sm text-zinc-400">
            <strong className="font-medium text-zinc-200">Base</strong> is the live social and
            execution layer — Culture ID, Agent OS, and BCC settlement today.{" "}
            <strong className="font-medium text-zinc-200">BCC</strong> is the chain-agnostic
            economic layer. <strong className="font-medium text-zinc-200">XRPL</strong> is optional
            trust and treasury infrastructure under Culture ID (testnet demo only — not a pivot to
            XRP). <strong className="font-medium text-zinc-200">Agents</strong> are the workforce
            layer for research, grants, and revenue workflows.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Thesis (for discussion)
          </h2>
          <p>
            Collectors and travelers already chase culture — but odds and fulfillment are too often
            opaque. We combine{" "}
            <strong className="font-medium text-zinc-200">fair, inspectable drops</strong> with an
            app layer that makes participation legible: wallets, marketplace, missions, and XP tied
            to <strong className="font-medium text-zinc-200">Building Culture Coin ($BCC)</strong>{" "}
            as the in-app economic story—without claiming guaranteed returns on any token.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Where product lives
          </h2>
          <p>
            Three entry points, one narrative: the Capital umbrella, the live app experience, and
            the BUILDCHAIN game loop.
          </p>
          <ProductMap />
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            $BCC + BUILDCHAIN (accurate constraints)
          </h2>
          <p>
            $BCC is how we discuss value inside the product: balances, “Get $BCC” previews, and
            mission-driven storytelling. Where configured, the UI can read an ERC20 balance; where
            not, we label demo balances honestly.
          </p>
          <p>
            <strong className="font-medium text-zinc-200">Settlement today</strong> follows the
            deployed raffle path in the chain’s native gas token unless and until contracts accept
            $BCC for mints—we say that loudly so expectations stay aligned (
            <Link to="/faq" className="text-zinc-200 underline">
              FAQ
            </Link>
            ).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Why this can compound
          </h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-400 marker:text-zinc-600">
            <li>On-chain receipts for tickets and campaigns reduce “trust me” moments.</li>
            <li>
              Marketplace + campaign surfaces create repeatable fee opportunities when volume
              follows.
            </li>
            <li>
              Social distribution is wired but early: Grove auto-post requires credentials; pulse
              ingestion shows real post counts in the traction table — often zero until streams run.
            </li>
            <li>
              Optional Strapi-backed community content lets partners ship stories without
              redeploying the core app.
            </li>
          </ul>
        </section>

        <InvestorLiveTraction />

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Business model (directional)
          </h2>
          <p>
            Revenue can mirror how culture platforms already monetize—primary mint fees, marketplace
            fees, sponsored experiences, and eventually premium APIs — while keeping disclosures
            honest when drops settle in native tokens today.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Line</th>
                  <th className="px-4 py-3 font-medium">Notes (fill with finance)</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Marketplace / protocol fees</td>
                  <td className="px-4 py-3 text-zinc-500">
                    thirdweb marketplace live on Base (
                    <code className="text-zinc-400">0x3af9…AEcf4</code>); platform fee bps set per
                    env when published
                  </td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">BCC commerce discount</td>
                  <td className="px-4 py-3 text-zinc-500">
                    11.11% pack discount (1111 bps) when{" "}
                    <code className="text-zinc-400">VITE_BCC_DISCOUNT_BPS</code> is configured
                  </td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Campaign & mint fees</td>
                  <td className="px-4 py-3 text-zinc-500">
                    On-chain raffle / art hub contracts on Base — see{" "}
                    <Link to="/grant-proof" className="text-zinc-300 underline underline-offset-4">
                      grant-proof
                    </Link>{" "}
                    bytecode audit
                  </td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Sponsored drops & experiences</td>
                  <td className="px-4 py-3 text-zinc-500">
                    Partnership pipeline — not disclosed publicly
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">API / infra (e.g. x402-style)</td>
                  <td className="px-4 py-3 text-zinc-500">
                    Rentable trading agent + x402 routes — worker optional (
                    <code className="text-zinc-400">/api/trading/health</code>)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="roi" className="scroll-mt-24 space-y-6">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Economics & fundraising (what we publish)
          </h2>
          <p>
            Angels typically underwrite{" "}
            <strong className="font-medium text-zinc-200">category creation</strong>, distribution,
            and execution—not pre-filled spreadsheet sliders. This page shows{" "}
            <strong className="font-medium text-zinc-200">audited live metrics</strong> above; it
            does <em>not</em> state an open round size, post-money valuation, or ownership slice.
          </p>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] px-5 py-4 text-sm text-amber-100/90">
            <strong className="font-medium text-amber-50">Not on this page:</strong> raise amount,
            valuation, cap table %, GMV forecasts, or fee-revenue projections. Those belong in
            counsel-approved materials and direct conversations—not a public URL that could read
            like an offering.
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Public stance</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Round size / valuation</td>
                  <td className="px-4 py-3 text-zinc-500">Not disclosed here — NDA + term sheet</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Cap table / ownership %</td>
                  <td className="px-4 py-3 text-zinc-500">Not disclosed here — NDA + term sheet</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Live ops & on-chain proof</td>
                  <td className="px-4 py-3">
                    <Link to="/grant-proof" className="text-zinc-300 underline underline-offset-4">
                      /grant-proof
                    </Link>{" "}
                    + traction table on this page
                  </td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Long-horizon scenario deck</td>
                  <td className="px-4 py-3">
                    <Link to="/plan" className="text-zinc-300 underline underline-offset-4">
                      /plan
                    </Link>{" "}
                    — labeled illustrative models only, not current traction
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-zinc-300">Live-call scenario sliders</td>
                  <td className="px-4 py-3">
                    <Link
                      to="/investors/workshop"
                      className="text-zinc-300 underline underline-offset-4"
                    >
                      /investors/workshop
                    </Link>{" "}
                    — password-gated, noindex; shared privately on advisor calls
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              How we talk about outcomes (qualitative)
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-zinc-400 marker:text-zinc-600">
              <li>
                <span className="text-zinc-300">Execution focus:</span> ship inspectable drops,
                wallet UX, and marketplace rails before scaling marketing claims.
              </li>
              <li>
                <span className="text-zinc-300">Upside path:</span> repeatable campaigns + partners
                if volume follows — not assumed in public numbers.
              </li>
              <li>
                <span className="text-zinc-300">Downside risks:</span> regulatory scrutiny,
                fulfillment ops, chain/custody dependencies — see risks below.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Use of funds (directional outline)
          </h2>
          <p className="text-sm text-zinc-500">
            Categories we discuss with investors in private materials — not a public ask size or
            instrument (SAFE vs priced equity vs token) on this site.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Bucket</th>
                  <th className="px-4 py-3 font-medium">Share (discussion)</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Product engineering</td>
                  <td className="px-4 py-3 font-mono">~40%</td>
                  <td className="px-4 py-3 text-zinc-500">
                    Marketplace, wallet UX, trust layer, Agent OS
                  </td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Growth & community</td>
                  <td className="px-4 py-3 font-mono">~25%</td>
                  <td className="px-4 py-3 text-zinc-500">
                    Creator partnerships, drops, distribution
                  </td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Compliance & ops</td>
                  <td className="px-4 py-3 font-mono">~15%</td>
                  <td className="px-4 py-3 text-zinc-500">Counsel, fulfillment, accounting</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 text-zinc-300">Infrastructure</td>
                  <td className="px-4 py-3 font-mono">~10%</td>
                  <td className="px-4 py-3 text-zinc-500">
                    RPC, indexing, observability, security reviews
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-zinc-300">Reserve / runway buffer</td>
                  <td className="px-4 py-3 font-mono">~10%</td>
                  <td className="px-4 py-3 text-zinc-500">Treasury Safe reserves on Base</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              On-chain fee routing (when fees flow)
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {TREASURY_REVENUE_RULES.map((b) => (
                <li key={b.id} className="text-sm text-zinc-400">
                  <span className="font-mono text-zinc-300">{b.percent}%</span> {b.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="treasury-architecture-appendix" className="scroll-mt-24 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Appendix — institutional wrappers (when scale requires)
          </h2>
          <p className="text-sm text-zinc-500">
            Default angel and partner flow uses stablecoin rails on Base (and XRPL testnet demos).
            The entity stack below is for large checks and counsel-approved structures — not the
            everyday path.
          </p>
          <TreasuryEntityArchitecture embedded />
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Risks & mitigations
          </h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-400 marker:text-zinc-600">
            <li>
              <strong className="font-medium text-zinc-300">Regulatory:</strong> promotions and
              token mechanics vary by region — run campaigns only with appropriate licenses and
              disclosures.
            </li>
            <li>
              <strong className="font-medium text-zinc-300">Execution:</strong> real-world
              fulfillment is operationally heavy — invest in partner SLAs and player support.
            </li>
            <li>
              <strong className="font-medium text-zinc-300">Market:</strong> crypto UX friction and
              volatility — mitigate with clear settlement messaging and chain choices aligned with
              users.
            </li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Appendix — deeper dives
          </h2>
          <ul className="flex flex-col gap-3 text-zinc-400">
            <li>
              <a
                href="#capital-rails"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                Capital rails & live balances
              </a>{" "}
              — Base treasury + XRPL testnet demo.
            </li>
            <li>
              <a
                href="#treasury-architecture-appendix"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                Institutional entity architecture
              </a>{" "}
              — Delaware gateway, Swiss layer, SPV isolation (discussion only).
            </li>
            <li>
              <Link
                to="/mission"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                Mission ($BCC)
              </Link>{" "}
              — treasury narrative, genesis claim context.
            </li>
            <li>
              <Link
                to="/about"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                About
              </Link>{" "}
              — product thesis and loop.
            </li>
            <li>
              <Link
                to="/faq"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                FAQ
              </Link>{" "}
              — mechanics, disclaimers, “what is BUILDCHAIN”.
            </li>
            <li>
              <Link
                to="/roadmap"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                Roadmap
              </Link>{" "}
              — what ships next.
            </li>
          </ul>
        </section>

        <DisclaimerBanner dense />
      </div>
    </MarketingShell>
  );
}
