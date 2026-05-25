"use client";

import Link from "next/link";
import { zeroAddress } from "viem";
import { base } from "viem/chains";
import { useChainId } from "wagmi";
import { FOUNDER_VS_PROTOCOL, PROTOCOL_FEES, TREASURY_POLICY } from "@/lib/protocol-fees";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";

function ExplorerLink({
  explorer,
  addr,
  label,
}: {
  explorer: string;
  addr: `0x${string}`;
  label: string;
}) {
  const unset = addr === zeroAddress;
  const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] py-2.5 text-sm last:border-0">
      <span className="text-zinc-400">{label}</span>
      {unset ? (
        <span className="font-mono text-xs text-zinc-600">Not deployed / not configured</span>
      ) : (
        <a
          href={`${explorer}/address/${addr}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-gold-400 hover:underline"
        >
          {short}
        </a>
      )}
    </div>
  );
}

export default function TransparencyPage() {
  const chainId = useChainId();
  const onBase = chainId === base.id;
  const {
    explorer,
    registry,
    shareFactory,
    compliance,
    weth,
    router,
    lendingPool,
    predictionMarket,
    proofNft,
    staking,
    guestbook,
    platformToken,
    purchaseEscrowErc20,
    governanceSafe,
  } = useProtocolAddresses();

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-eco-light">Protocol</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Transparency</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Fees, treasury policy, and Base contract addresses. Property-level economics follow separate offering documents.
          Liquidity programmes and trading hooks are disclosed per deployment; AI-assisted operations (where enabled) follow human-defined
          guardrails and audit trails. Full risk context in Legal.
        </p>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-6">
        <h2 className="text-lg font-semibold text-white">Your wallet</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Connected chain id: <span className="font-mono text-zinc-200">{chainId}</span>
          {onBase ? (
            <span className="text-eco-light"> · Base mainnet</span>
          ) : (
            <span className="text-amber-200/90"> · Switch to Base for production deployment addresses below.</span>
          )}
        </p>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="text-lg font-semibold text-white">Chainlink RWA alignment</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Property shares target REOC profile D: uRWA transfer checks, DTA-style subscribe/redeem, NAV oracles, and
          Proof-of-Reserve mint caps. See{" "}
          <code className="text-xs text-zinc-300">docs/CHAINLINK_RWA_COMPLIANCE.md</code> in the monorepo.
        </p>
        <p className="mt-3 text-xs text-amber-200/80">
          Mainnet <span className="font-mono">MockPriceOracle</span> is non-production — migrate per{" "}
          <span className="font-mono">oracle-migration-mainnet.md</span>. SimpleLendingPool is not deployed on mainnet
          until NAV + PoR gates pass.
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-6">
        <h2 className="text-lg font-semibold text-white">Fee schedule (reference)</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Published caps and defaults for disclosures. Actual on-chain fees must match deployed router / offering terms.
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-white/[0.04] py-2">
            <dt className="text-zinc-500">Primary issuance (max / default bps)</dt>
            <dd className="font-mono text-zinc-200">
              {PROTOCOL_FEES.primaryIssuanceBpsMax} / {PROTOCOL_FEES.primaryIssuanceBpsDefault}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/[0.04] py-2">
            <dt className="text-zinc-500">Secondary trading (max / default bps)</dt>
            <dd className="font-mono text-zinc-200">
              {PROTOCOL_FEES.secondaryTradingBpsMax} / {PROTOCOL_FEES.secondaryTradingBpsDefault}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/[0.04] py-2">
            <dt className="text-zinc-500">Fee change notice (days)</dt>
            <dd className="font-mono text-zinc-200">{PROTOCOL_FEES.feeChangeNoticeDays}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-6">
        <h2 className="text-lg font-semibold text-white">Treasury & founders</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{TREASURY_POLICY.timelockDescription}</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          <span className="text-zinc-300">Custody:</span> {TREASURY_POLICY.recommendedCustody}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          <span className="font-medium text-zinc-300">Company vs protocol:</span> {FOUNDER_VS_PROTOCOL.companyEquity}{" "}
          {FOUNDER_VS_PROTOCOL.protocolRevenue}
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-6">
        <h2 className="text-lg font-semibold text-white">Base contracts (env-configured)</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Addresses follow your active chain in the wallet. For Base mainnet, connect to Base (chain id {base.id}) to match
          deployment.
        </p>
        <div className="mt-4">
          <ExplorerLink explorer={explorer} addr={registry} label="PropertyRegistry" />
          <ExplorerLink explorer={explorer} addr={shareFactory} label="PropertyShareFactory" />
          <ExplorerLink explorer={explorer} addr={compliance} label="ComplianceRegistry" />
          <ExplorerLink explorer={explorer} addr={weth} label="WETH9" />
          <ExplorerLink explorer={explorer} addr={router} label="OgRouter" />
          <ExplorerLink explorer={explorer} addr={lendingPool} label="SimpleLendingPool" />
          <ExplorerLink explorer={explorer} addr={predictionMarket} label="BinaryPredictionMarket" />
          <ExplorerLink explorer={explorer} addr={proofNft} label="PropertyShareProof" />
          <ExplorerLink explorer={explorer} addr={staking} label="OgStaking" />
          <ExplorerLink explorer={explorer} addr={guestbook} label="Guestbook (optional)" />
          <ExplorerLink explorer={explorer} addr={platformToken} label="Platform settlement token" />
          <ExplorerLink explorer={explorer} addr={purchaseEscrowErc20} label="PurchaseEscrow (ERC-20)" />
          <ExplorerLink explorer={explorer} addr={governanceSafe} label="Governance / treasury Safe" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-6">
        <h2 className="text-lg font-semibold text-white">Roles</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Issuer and compliance roles live on <span className="font-mono text-zinc-300">PropertyRegistry</span> and{" "}
          <span className="font-mono text-zinc-300">ComplianceRegistry</span>. Use Basescan “Read contract” →{" "}
          <span className="font-mono">hasRole</span>, or open the{" "}
          <Link href="/admin" className="text-gold-400 hover:underline">
            Admin
          </Link>{" "}
          tools if your wallet is authorized.
        </p>
      </section>

      <section className="rounded-2xl border border-eco/20 bg-eco/5 p-6">
        <h2 className="text-lg font-semibold text-white">Legal layering</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          How protocol equity, settlement tokens, and property SPVs differ — see the offerings overview.
        </p>
        <Link
          href="/legal/offerings"
          className="mt-4 inline-flex text-sm font-medium text-gold-400 hover:underline"
        >
          Offerings & structure →
        </Link>
      </section>
    </div>
  );
}
