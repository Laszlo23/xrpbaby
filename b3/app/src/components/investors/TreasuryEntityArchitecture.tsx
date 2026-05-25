import { ArrowDown, Landmark, Scale, ShieldAlert, Wallet } from "lucide-react";

const structureLayers = [
  "Liechtenstein Stiftung",
  "Swiss Holding AG",
  "Delaware LLC",
  "Token SPV / Treasury / Investor Gateway",
  "AT Property GmbHs / Canada Corps",
] as const;

export function TreasuryEntityArchitecture() {
  return (
    <section id="treasury-architecture" className="scroll-mt-24 space-y-10">
      <div className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
          Treasury & entity architecture (discussion outline)
        </h2>
        <p className="text-sm text-zinc-500">
          High-level institutional framing for diligence conversations only. Jurisdictions, labels,
          and flows must be confirmed with qualified tax and securities counsel before any paid
          marketing, onboarding, or capital movement.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <h3 className="font-heading text-lg font-medium text-zinc-100">
          When funds route through a Delaware entity
        </h3>
        <p className="text-zinc-400">
          Delaware works well when it is used for a narrow, well-documented purpose—not as a
          catch-all for every asset or operating role.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400/90">
              Strong fits
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-400 marker:text-emerald-600/80">
              <li>Funding gateway</li>
              <li>Investor onboarding vehicle</li>
              <li>Treasury coordination entity</li>
              <li>Token subscription vehicle (with counsel-approved terms)</li>
              <li>Optional trading entity (if licensed / permitted)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-rose-400/90">
              Poor fits
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-400 marker:text-rose-600/70">
              <li>Direct real estate owner (use SPVs)</li>
              <li>Global operating company</li>
              <li>Unmanaged DAO treasury (no legal counterparty clarity)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-zinc-100">
          Illustrative stack (not a commitment to current org chart)
        </h3>
        <div className="flex flex-col items-stretch gap-0 rounded-2xl border border-white/[0.08] bg-zinc-950/40 p-4 md:p-6">
          {structureLayers.map((label, i) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center text-sm font-medium text-zinc-200">
                {label}
              </div>
              {i < structureLayers.length - 1 ? (
                <ArrowDown className="my-1 h-5 w-5 shrink-0 text-zinc-600" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-zinc-100">
          Clean capital flow (example)
        </h3>
        <ol className="space-y-4">
          <li className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="font-mono text-xs text-zinc-500">01</span>
            <div>
              <p className="font-medium text-zinc-200">Investor intake</p>
              <p className="mt-1 text-sm text-zinc-400">
                Investors may contribute USDC, USD, or EUR into a Delaware gateway entity—only
                under counsel-approved subscription documents and bank / stablecoin rails.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="font-mono text-xs text-zinc-500">02</span>
            <div>
              <p className="font-medium text-zinc-200">Gateway operations</p>
              <p className="mt-1 text-sm text-zinc-400">
                The Delaware vehicle handles onboarding, subscription agreements, KYC / AML, and
                treasury intake—not discretionary marketing claims about trading performance.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="font-mono text-xs text-zinc-500">03</span>
            <div>
              <p className="font-medium text-zinc-200">Allocation downward</p>
              <p className="mt-1 text-sm text-zinc-400">
                Capital can be allocated to Swiss holding layers, token SPVs, property SPVs, and
                treasury reserves according to board / manager authority and governing documents.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="font-mono text-xs text-zinc-500">04</span>
            <div>
              <p className="font-medium text-zinc-200">Yield flows upward</p>
              <p className="mt-1 text-sm text-zinc-400">
                Rental income, exits, refinancing, and treasury profits can flow back through SPVs
                and holding companies with transparent waterfall logic—again, only as counsel
                approves.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-white/[0.08] p-6">
          <div className="flex items-center gap-2 text-zinc-200">
            <Landmark className="h-4 w-4 text-zinc-500" aria-hidden />
            <h3 className="font-heading text-base font-medium">Why Delaware is often chosen</h3>
          </div>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-400 marker:text-zinc-600">
            <li>Flexible investor and LLC agreement design (including web3-style mechanics).</li>
            <li>Often easier U.S. investor onboarding vs. some European operating companies alone.</li>
            <li>Familiar to crypto-native funds and U.S. angels.</li>
            <li>Room to embed DAO signals, treasury rights, and governance mechanics in contracts—if
              lawfully structured.</li>
          </ul>
        </div>

        <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
          <div className="flex items-center gap-2 text-amber-100/95">
            <ShieldAlert className="h-4 w-4 text-amber-400/90" aria-hidden />
            <h3 className="font-heading text-base font-medium">Material risks to diligence</h3>
          </div>
          <ul className="space-y-3 text-sm text-amber-100/85">
            <li>
              <strong className="font-medium text-amber-50">FATCA / CRS:</strong> international
              investors through a U.S. gateway can trigger reporting—plan for accounting, AML /
              KYC, investor registry, and tax reporting early.
            </li>
            <li>
              <strong className="font-medium text-amber-50">SEC / securities:</strong> if tokens
              look like profit rights, investors expect returns, there is broad secondary trading,
              or DAO governance resembles a pooled investment vehicle, regulators may treat the
              program as a securities offering. Positioning must be counsel-led—not marketing-led.
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 text-zinc-200">
          <Scale className="h-4 w-4 text-zinc-500" aria-hidden />
          <h3 className="font-heading text-base font-medium">Safer public framing (examples)</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          Avoid marketing lines like “send funds to Delaware and we trade them.” That pattern
          invites investment-company and securities scrutiny. Prefer counsel-approved narratives
          such as treasury management, reserve allocation, ecosystem treasury, and strategic
          liquidity—while real estate and operating businesses remain the documented core.
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          A Delaware LLC can be described as a private investment membership vehicle with defined
          rights—not a public crypto token issuer—when facts and documents support that distinction.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-zinc-100">
          DAO integration (enforceability pattern)
        </h3>
        <p className="text-zinc-400">
          A practical model: the DAO publishes governance signals; the Delaware operating agreement
          explicitly recognizes those signals; multisig or managers execute approved actions; a
          foundation or steward retains narrowly defined emergency powers. That stack aims for
          legal enforceability and operational clarity without pretending an on-chain vote replaces
          corporate law.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Delaware LLC",
            body: "Investor intake, subscriptions, treasury coordination at the gateway.",
          },
          {
            title: "Swiss holding",
            body: "Treasury management, SPV coordination, IP, and operating alignment where appropriate.",
          },
          {
            title: "DAO",
            body: "Voting, proposals, transparency, reputation, and treasury signaling.",
          },
          {
            title: "Foundation / steward",
            body: "Legal protection, emergency governance, and protocol integrity within charter limits.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/[0.08] bg-zinc-950/30 p-4"
          >
            <p className="font-medium text-zinc-200">{card.title}</p>
            <p className="mt-2 text-sm text-zinc-400">{card.body}</p>
          </div>
        ))}
      </div>

      <aside className="flex gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/[0.06] p-5 text-sm text-sky-100/90">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-sky-400/90" aria-hidden />
        <div className="space-y-2">
          <p className="font-medium text-sky-50">Wallet hygiene</p>
          <p className="text-sky-100/85">
            Keep treasury, trading, operating cash, investor subscriptions, property income, and DAO
            flows in separate wallets / multisigs with published labels. Mixing streams destroys
            auditability and complicates every regulator conversation.
          </p>
        </div>
      </aside>

      <div className="rounded-2xl border border-white/[0.08] p-6">
        <h3 className="font-heading text-lg font-medium text-zinc-100">
          Building Culture treasury system (conceptual map)
        </h3>
        <ul className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
          <li>
            <span className="text-zinc-300">Delaware</span> — investor gateway
          </li>
          <li>
            <span className="text-zinc-300">Switzerland</span> — treasury + institutional layer
          </li>
          <li>
            <span className="text-zinc-300">Liechtenstein</span> — governance / legal wrapper where used
          </li>
          <li>
            <span className="text-zinc-300">DAO</span> — community coordination
          </li>
          <li className="sm:col-span-2">
            <span className="text-zinc-300">SPVs</span> — property isolation and ring-fenced risk
          </li>
        </ul>
        <p className="mt-4 text-sm text-zinc-500">
          Long-term story: real estate as the stable foundation, treasury as a disciplined growth
          engine, DAO as coordination, token as ecosystem access and governance where lawfully
          designed—not a promise of yield by slogan.
        </p>
      </div>
    </section>
  );
}
