"use client";

import Link from "next/link";
import { zeroAddress } from "viem";
import { CopyAddressButton } from "@/components/CopyAddressButton";
import { baseAddresses, baseExplorerBase, isBaseConfigured } from "@/lib/base-addresses";
import { getBaseGovernanceSafeInfo } from "@/lib/governance-safe";
import { getProtocolAddresses } from "@/lib/protocol-addresses";
import { usePropertyShareList } from "@/lib/usePropertyShareList";

type Row = { label: string; key: string; address: `0x${string}` };

function explorerUrl(base: string, addr: string) {
  return `${base}/address/${addr}`;
}

function AddressTable({
  title,
  subtitle,
  explorer,
  rows,
}: {
  title: string;
  subtitle?: string;
  explorer: string;
  rows: Row[];
}) {
  const configured = rows.filter((r) => r.address !== zeroAddress);
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {configured.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-sm text-zinc-500">
          No contract addresses configured. Set the relevant <code className="text-zinc-400">NEXT_PUBLIC_*</code>{" "}
          variables in <code className="text-zinc-400">web/.env.local</code>.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">Contract</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configured.map((r) => (
                <tr key={r.key} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3 text-zinc-300">{r.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{r.address}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <CopyAddressButton address={r.address} />
                      <a
                        href={explorerUrl(explorer, r.address)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-brand hover:bg-brand/10"
                      >
                        Explorer
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PropertyShareTokens() {
  const { explorer: listingsExplorer, registry } = getProtocolAddresses();
  const { chainRows: rows, loading } = usePropertyShareList();

  if (registry === zeroAddress) {
    return (
      <p className="text-sm text-zinc-500">
        Registry not configured — property share tokens cannot be listed.
      </p>
    );
  }

  if (loading && rows.length === 0) {
    return <p className="animate-pulse text-sm text-zinc-500">Loading property tokens…</p>;
  }

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">No property share tokens registered yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-4 py-3 font-medium">Property</th>
            <th className="px-4 py-3 font-medium">Symbol</th>
            <th className="px-4 py-3 font-medium">Token</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.tokenAddress} className="border-b border-white/[0.04] last:border-0">
              <td className="px-4 py-3 text-zinc-300">{r.demo?.headline ?? r.name}</td>
              <td className="px-4 py-3 font-mono text-zinc-400">{r.symbol}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">{r.tokenAddress}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <CopyAddressButton address={r.tokenAddress} />
                  <a
                    href={explorerUrl(listingsExplorer, r.tokenAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-brand hover:bg-brand/10"
                  >
                    Explorer
                  </a>
                  <Link
                    href={`/properties/${r.id.toString()}`}
                    className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 hover:text-white"
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const baseRows: Row[] = [
  { label: "Property registry", key: "base-registry", address: baseAddresses.registry },
  { label: "Property share factory", key: "base-shareFactory", address: baseAddresses.shareFactory },
  { label: "Compliance registry", key: "base-compliance", address: baseAddresses.compliance },
  { label: "Platform settlement token (BCULT)", key: "base-platform", address: baseAddresses.platformToken },
  { label: "Purchase escrow (ERC-20)", key: "base-escrow20", address: baseAddresses.purchaseEscrowErc20 },
  { label: "WETH (wrapped native)", key: "base-weth", address: baseAddresses.weth },
  { label: "Router (AMM)", key: "base-router", address: baseAddresses.router },
  { label: "Lending pool", key: "base-lendingPool", address: baseAddresses.lendingPool },
  { label: "Prediction market", key: "base-predictionMarket", address: baseAddresses.predictionMarket },
  { label: "Proof NFT", key: "base-proofNft", address: baseAddresses.proofNft },
  { label: "Staking", key: "base-staking", address: baseAddresses.staking },
];

function GovernanceSafeCard() {
  const gov = getBaseGovernanceSafeInfo();
  if (!gov) return null;

  return (
    <section className="space-y-4 rounded-xl border border-eco/25 bg-eco/[0.06] p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Governance (Base Safe)</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Protocol admin actions on Base (access control, compliance updates, treasury-aligned operations) are intended to run
          through this <strong className="text-zinc-300">Safe multisig</strong>. This is{" "}
          <strong className="text-zinc-300">not</strong> a wallet you connect to buy shares — use your own wallet for
          investing and trading.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-zinc-300">{gov.address}</span>
        <CopyAddressButton address={gov.address} />
        <a
          href={gov.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-brand hover:bg-brand/10"
        >
          Basescan
        </a>
        <a
          href={gov.safeAppUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-eco-light hover:bg-eco/10"
        >
          Safe app
        </a>
      </div>
    </section>
  );
}

export function ContractsPageClient() {
  const baseOk = isBaseConfigured();

  return (
    <div className="space-y-14 pb-16">
      {baseOk ? (
        <>
          <AddressTable
            title="Base mainnet (production)"
            subtitle={`Explorer: ${baseExplorerBase}`}
            explorer={baseExplorerBase}
            rows={baseRows}
          />
          <GovernanceSafeCard />
        </>
      ) : (
        <section className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-6">
          <h2 className="text-lg font-semibold text-white">Base mainnet</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Set <code className="text-zinc-300">NEXT_PUBLIC_BASE_REGISTRY</code>,{" "}
            <code className="text-zinc-300">NEXT_PUBLIC_BASE_SHARE_FACTORY</code>, and other{" "}
            <code className="text-zinc-300">NEXT_PUBLIC_BASE_*</code> variables for production verification.
          </p>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Property share tokens</h2>
        <p className="text-sm text-zinc-500">
          ERC-20 tokens minted per property on{" "}
          <strong className="text-zinc-400">Base</strong>{" "}
          — verify balances and transfers on-chain.
        </p>
        <PropertyShareTokens />
      </section>
    </div>
  );
}
