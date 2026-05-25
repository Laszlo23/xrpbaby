import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { DisclaimerBanner } from "@/components/investors/DisclaimerBanner";
import { ChainlinkComplianceStrip } from "@/components/investors/ChainlinkComplianceStrip";
import { ProductMap } from "@/components/investors/ProductMap";
import { RoiScenarioExplorer } from "@/components/investors/RoiScenarioExplorer";
import { TreasuryEntityArchitecture } from "@/components/investors/TreasuryEntityArchitecture";

export const Route = createFileRoute("/investors")({
  head: () =>
    pageHead({
      title: "Investors — Building Culture Capital",
      description:
        "Investor overview: Building Culture Capital, BUILDCHAIN surfaces, BCD narrative, illustrative economics — not an offer or financial advice.",
      path: "/investors",
      keywords: [
        "Building Culture Capital",
        "BUILDCHAIN",
        "investors",
        "BCD",
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
      subtitle="An angel-friendly map of our umbrella brand, product surfaces (app + game), and the Building Culture Dollar (BCD) story inside BUILDCHAIN. Illustrative numbers only—see disclaimers."
      actions={
        <a
          href="https://app.buildingcultureid.space/"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]"
        >
          Open app ↗
        </a>
      }
    >
      <div className="flex flex-col gap-14 md:gap-16">
        <DisclaimerBanner />
        <ChainlinkComplianceStrip />

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Thesis (for discussion)
          </h2>
          <p>
            Collectors and travelers already chase culture — but odds and fulfillment are too often
            opaque. We combine{" "}
            <strong className="font-medium text-zinc-200">fair, inspectable drops</strong> with an
            app layer that makes participation legible: wallets, marketplace, missions, and XP tied
            to <strong className="font-medium text-zinc-200">Building Culture Dollar (BCD)</strong>{" "}
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
            BCD + BUILDCHAIN (accurate constraints)
          </h2>
          <p>
            BCD is how we discuss value inside the product: balances, “Get BCD” previews, and
            mission-driven storytelling. Where configured, the UI can read an ERC20 balance; where
            not, we label demo balances honestly.
          </p>
          <p>
            <strong className="font-medium text-zinc-200">Settlement today</strong> follows the
            deployed raffle path in the chain’s native gas token unless and until contracts accept
            BCD for mints—we say that loudly so expectations stay aligned (
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
              Social distribution hooks (e.g. Farcaster / Warpcast flows where configured) can
              shorten acquisition loops for culture-native audiences.
            </li>
            <li>
              Optional Strapi-backed community content lets partners ship stories without
              redeploying the core app.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Traction (placeholders)
          </h2>
          <p className="text-sm text-zinc-500">
            Replace with counsel-approved metrics. Example labels only.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Signal</th>
                  <th className="px-4 py-3 font-medium">Example / TBD</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Monthly active wallets</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">—</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Secondary GMV (proxy)</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">—</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Campaign mint volume</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Brand / venue partners</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

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
                  <td className="px-4 py-3 text-zinc-500">TBD — attach take rate when stable</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Campaign & mint fees</td>
                  <td className="px-4 py-3 text-zinc-500">TBD — per deployment</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Sponsored drops & experiences</td>
                  <td className="px-4 py-3 text-zinc-500">TBD — partnership pipeline</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">API / infra (e.g. x402-style)</td>
                  <td className="px-4 py-3 text-zinc-500">TBD — optional premium tier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="roi" className="scroll-mt-24 space-y-6">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            ROI framing & illustrative economics
          </h2>
          <p>
            Angels typically underwrite{" "}
            <strong className="font-medium text-zinc-200">category creation</strong>, distribution,
            and execution speed—not a spreadsheet cell. Below is a qualitative band, placeholder cap
            table lines, then a toy scenario you can tune in conversation with advisors.
          </p>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Illustrative outcome bands (not predictions)
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-zinc-400 marker:text-zinc-600">
              <li>
                <span className="text-zinc-300">Base case story:</span> niche liquidity + steady
                drops → fees fund core team and infra; token narrative stays subservient to product.
              </li>
              <li>
                <span className="text-zinc-300">Upside story:</span> cultural moments spill into
                mainstream acquisition; marketplace + campaigns scale GMV; partnerships repeat.
              </li>
              <li>
                <span className="text-zinc-300">Downside risks:</span> regulatory scrutiny on
                promos, execution on fulfillment, chain / custody dependencies — see risks below.
              </li>
            </ul>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Cap table line</th>
                  <th className="px-4 py-3 font-medium">Placeholder</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Founders / early team</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">— %</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Seed / angel</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">— %</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">Option pool</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">— %</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Strategic / advisors</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">— %</td>
                </tr>
              </tbody>
            </table>
          </div>

          <RoiScenarioExplorer />
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Round & use of funds (outline)
          </h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-400 marker:text-zinc-600">
            <li>Product engineering: marketplace reliability, wallet UX, campaign tooling.</li>
            <li>Growth: creator partnerships, drops programming, community.</li>
            <li>Compliance & ops: counsel retainer, fulfillment playbooks, accounting.</li>
            <li>Infrastructure: RPC, indexing, observability, security reviews.</li>
          </ul>
          <p className="text-sm text-zinc-600">
            Instrumentation (SAFE vs priced round, jurisdiction, token vs equity) belongs in your
            term sheet — not on this page.
          </p>
        </section>

        <TreasuryEntityArchitecture />

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
                href="#treasury-architecture"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                Treasury & entity architecture
              </a>{" "}
              — Delaware gateway, Swiss layer, DAO signals, SPV isolation (discussion only).
            </li>
            <li>
              <Link
                to="/mission"
                className="font-medium text-zinc-200 underline-offset-4 hover:text-white"
              >
                Mission (BCD)
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
