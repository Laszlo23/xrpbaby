import Link from "next/link";
import { GuideChat } from "@/components/GuideChat";
import { baseExplorerBase } from "@/lib/base-addresses";

const steps = [
  {
    title: "Gas & settlement",
    body: "Listings use Base: hold ETH for gas and USDC (or the issuer's quoted token) for trades and primary sales where configured.",
    href: "https://www.base.org",
  },
  {
    title: "Deploy contracts",
    body: "From the repo root run DeployAll, then SeedSevenProperties (or SeedThreeProperties + SeedFourMoreProperties) with PROPERTY_REGISTRY and PROPERTY_SHARE_FACTORY set. See deployments/README.md.",
    href: "/",
  },
  {
    title: "Configure the web app",
    body: "Copy deployments/base-mainnet.json fields into web/.env.local, or run scripts/sync_web_env.py deployments/base-mainnet.json.",
    href: "/",
  },
  {
    title: "Connect wallet",
    body: "Use an injected wallet (e.g. MetaMask) on Base mainnet (chain id 8453).",
    href: "/properties",
  },
  {
    title: "Explore",
    body: "Open Basescan to verify registerProperty, createPropertyShare, and pool transactions.",
    href: baseExplorerBase,
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Network guide</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          <strong className="text-zinc-300">End users:</strong> read{" "}
          <Link href="/how-it-works" className="text-brand hover:underline">
            How it works
          </Link>{" "}
          for a plain-language investor flow. This page is for <strong className="text-zinc-300">operators</strong>: deploy
          contracts, configure env, and verify transactions.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          This deployment supports up to seven seeded properties when configured on-chain. Tokens represent programmed
          economic interests, not legal title; read <code className="text-zinc-400">docs/compliance.md</code> in the repository.
        </p>
      </div>

      <section id="tokenization" className="scroll-mt-8 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">How tokenization, buying shares, and your platform vision connect</h2>

        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <div>
            <h3 className="mb-1 font-medium text-emerald-400/90">What “tokenized” means here</h3>
            <p>
              Each registered property can have one <strong className="text-zinc-300">PropertyShareToken</strong> (ERC-20)
              minted through <code className="text-zinc-500">PropertyShareFactory</code>. The token is bound to a single{" "}
              <code className="text-zinc-500">propertyId</code> in <code className="text-zinc-500">PropertyRegistry</code>.
              That is <strong className="text-zinc-300">fractional exposure as a crypto asset</strong>, not an automatic
              replacement for land title or securities compliance — real offerings need legal structure, disclosures,
              and often KYC (see repo <code className="text-zinc-500">docs/compliance.md</code>). Early deployments may pause
              provider KYC — use registry bypass or admin verification instead.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-medium text-emerald-400/90">How someone gets (or buys) shares today</h3>
            <ul className="list-inside list-disc space-y-1.5 pl-1">
              <li>
                <strong className="text-zinc-300">Primary / direct:</strong> whoever holds{" "}
                <code className="text-zinc-500">MINTER_ROLE</code> or existing balances can transfer shares to buyers
                (wallet-to-wallet), same as any ERC-20.
              </li>
              <li>
                <strong className="text-zinc-300">Secondary / “market price”:</strong> this stack includes{" "}
                <code className="text-zinc-500">OgRouter</code> + pairs for swaps against wrapped gas (WOG). For a{" "}
                <strong className="text-zinc-300">liquid market</strong>, someone must create a pool (share token / WOG)
                and add liquidity (similar to Uniswap-style AMM). Then users swap on the{" "}
                <Link href="/trade" className="text-emerald-500 hover:underline">
                  Trade
                </Link>{" "}
                page (approve router → swap).{" "}
                <strong className="text-zinc-300">If there is no pool, there is nothing to “buy” via the DEX yet</strong>{" "}
                except OTC transfers.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-1 font-medium text-emerald-400/90">Rent yield vs. price appreciation</h3>
            <p>
              <strong className="text-zinc-300">Automatic rent streaming is not implemented</strong> in these contracts.
              Distributing cash flow from tenants usually requires an off-chain SPV, legal agreements, and either
              periodic manual distributions or a future on-chain dividend contract.{" "}
              <strong className="text-zinc-300">Appreciation</strong> is reflected if secondary markets price the share
              token higher — again, only meaningful with liquidity and real economics behind the asset.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-medium text-emerald-400/90">Tokenize a property (issuer flow)</h3>
            <p>
              Today: <code className="text-zinc-500">registerProperty</code> on the registry (needs appropriate role),
              then <code className="text-zinc-500">createPropertyShare</code> on the factory with metadata URI, supply
              cap, and initial mint. A <strong className="text-zinc-300">full product</strong> would add onboarding UI,
              document upload, KYC, and legal templates — the contracts are the settlement layer.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-medium text-emerald-400/90">Raise money to build (financing)</h3>
            <p>
              The repo includes a <strong className="text-zinc-300">lending</strong> pattern (collateralize share
              tokens, borrow WOG) — see{" "}
              <Link href="/lend" className="text-emerald-500 hover:underline">
                Lend
              </Link>
              . That is <strong className="text-zinc-300">not</strong> a full construction-loan product; it is a DeFi
              primitive. Real “build a new property” financing typically combines equity (selling shares), debt, and
              licensed lenders — product and compliance work on top of these primitives.
            </p>
          </div>
        </div>
      </section>

      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-sm font-medium text-emerald-400">
              {i + 1}
            </span>
            <div>
              <h2 className="font-medium text-zinc-100">{s.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{s.body}</p>
              {s.href.startsWith("http") ? (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-emerald-500 hover:underline"
                >
                  Open link
                </a>
              ) : (
                <Link href={s.href} className="mt-2 inline-block text-sm text-emerald-500 hover:underline">
                  Go
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <GuideChat />
    </div>
  );
}
