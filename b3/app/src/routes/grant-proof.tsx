import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import type { GrantVerificationPayload, GrantCheckStatus } from "@/server/grant-verification";
import { OG_HACKATHON_REPO } from "@/lib/og-hackathon";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/grant-proof")({
  head: () =>
    pageHead({
      title: "Grant verification — Building Culture",
      description:
        "Live verification for grant reviewers, ecosystem programs, and investors: production checks, on-chain addresses, and downloadable proof JSON.",
      path: "/grant-proof",
      keywords: ["grant", "verification", "Base", "0G", "RWA", "Building Culture", "due diligence"],
    }),
  component: GrantProofPage,
});

function statusStyles(status: GrantCheckStatus) {
  if (status === "pass") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  if (status === "warn") return "border-amber-500/40 bg-amber-500/10 text-amber-200";
  return "border-red-500/40 bg-red-500/10 text-red-200";
}

function GrantProofPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["grant-verification"],
    queryFn: async () => {
      const res = await fetch("/api/grant/verification");
      if (!res.ok) throw new Error(`verification_http_${res.status}`);
      return (await res.json()) as GrantVerificationPayload;
    },
    staleTime: 60_000,
  });

  const downloadJson = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grant-verification-${data.generatedAt.replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const baseContracts = useMemo(() => {
    const net = data?.addresses?.networks?.["8453"];
    if (!net) return [];
    const explorer = net.explorer || "https://basescan.org";
    const rows: { name: string; address: string; href: string }[] = [];
    const push = (name: string, addr?: string) => {
      if (!addr || addr === "0x0000000000000000000000000000000000000000") return;
      rows.push({ name, address: addr, href: `${explorer}/address/${addr}` });
    };
    push("CultureLayerIdentity", net.identity?.CultureLayerIdentity);
    push("BCC", net.bcc?.BCC || net.culture?.BuildingCultureDollar);
    push("GenesisVaultPass Phase0", net.genesisVault?.GenesisVaultPassPhase0);
    push("PropertyRegistry", net.places?.PropertyRegistry);
    push("PropertyShareFactory", net.places?.PropertyShareFactory);
    push("ComplianceRegistry", net.places?.ComplianceRegistry);
    push("CulturePulseAnchor", net.culture?.CulturePulseAnchor);
    return rows;
  }, [data]);

  return (
    <MarketingShell
      eyebrow="Grant & investor verification"
      tone="purple"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          Culture on-chain —{" "}
          <span className="bg-gradient-to-r from-white via-[rgb(0_82_255/90%)] to-emerald-300/90 bg-clip-text text-transparent">
            verified, not claimed
          </span>
        </>
      }
      subtitle="Live production checks for ecosystem grants (Base, 0G, Chainlink), social-impact programs, and angel due diligence. Social micro-rewards powered by Quidli (BCC tips to X, Farcaster, Telegram). Warnings are shown honestly — not hidden."
      actions={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {isFetching ? "Refreshing…" : "Refresh checks"}
          </button>
          <button
            type="button"
            onClick={downloadJson}
            disabled={!data}
            className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] disabled:opacity-50"
          >
            Download JSON
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-10 md:gap-12">
        {isLoading && <p className="text-center text-zinc-500">Loading verification payload…</p>}
        {isError && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            Could not load verification API. Try refresh or run{" "}
            <code className="text-sm">npm run grant:proof</code> locally.
          </p>
        )}

        {data && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-3xl font-semibold text-white">{data.overallScore}%</p>
                <p className="mt-1 text-sm text-zinc-500">Hard checks passing</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-3xl font-semibold text-emerald-300">
                  {data.checks.filter((c) => c.status === "pass").length}
                </p>
                <p className="mt-1 text-sm text-zinc-500">Pass</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-3xl font-semibold text-amber-300">
                  {data.checks.filter((c) => c.status === "warn").length}
                </p>
                <p className="mt-1 text-sm text-zinc-500">Warn (known gaps)</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
                Audit program (local / CI)
              </h2>
              <p className="text-sm text-zinc-500">
                Rows from <code className="text-zinc-400">npm run audit:gate</code> when{" "}
                <code className="text-zinc-400">GRANT_VERIFY_MATRIX_PATH</code> is set on the
                server.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {data.checks
                  .filter((c) =>
                    [
                      "forge_all",
                      "app_unit",
                      "app_e2e",
                      "backtest_suite",
                      "security_scan",
                      "slither",
                      "flow_tests",
                    ].includes(c.id),
                  )
                  .map((check) => (
                    <li
                      key={check.id}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-sm",
                        statusStyles(check.status),
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium">{check.label}</span>
                        <span className="shrink-0 uppercase text-xs opacity-80">
                          {check.status}
                        </span>
                      </div>
                      {check.detail && <p className="mt-1 text-xs opacity-80">{check.detail}</p>}
                    </li>
                  ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
                Live checks
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {data.checks.map((check) => (
                  <li
                    key={check.id}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm",
                      statusStyles(check.status),
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{check.label}</span>
                      <span className="shrink-0 uppercase text-xs opacity-80">{check.status}</span>
                    </div>
                    {check.detail && <p className="mt-1 text-xs opacity-80">{check.detail}</p>}
                    {check.url && (
                      <a
                        href={check.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs underline underline-offset-2 opacity-90"
                      >
                        Open
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
                Base mainnet contracts
              </h2>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Contract</th>
                      <th className="px-4 py-3 font-medium">Explorer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baseContracts.map((row) => (
                      <tr key={row.name} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-zinc-200">{row.name}</td>
                        <td className="px-4 py-3">
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-zinc-400 underline-offset-2 hover:text-white hover:underline"
                          >
                            {row.address}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                0G AgentId:{" "}
                <Link to="/0g/agentid" className="text-zinc-200 underline underline-offset-4">
                  live proof page
                </Link>
              </p>
            </section>

            <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h2 className="font-heading text-lg font-semibold text-white">Scope boundaries</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-400">
                <li>{data.scopeBoundaries.econLive}</li>
                <li>{data.scopeBoundaries.tradingAgent}</li>
                <li>{data.scopeBoundaries.groveSocial}</li>
                <li>{data.scopeBoundaries.notLegalAdvice}</li>
              </ul>
            </section>

            <section className="space-y-2 text-sm">
              <h2 className="font-heading text-lg font-semibold text-white">For operators</h2>
              <p>
                Full gate bundle: <code>npm run grant:proof</code> from the b3 repo. Documentation:{" "}
                <a
                  href={`${OG_HACKATHON_REPO}/blob/main/b3/docs/GRANT_READINESS_PACK.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-200 underline underline-offset-4"
                >
                  GRANT_READINESS_PACK.md
                </a>
                . Investor overview:{" "}
                <Link to="/investors" className="text-zinc-200 underline underline-offset-4">
                  /investors
                </Link>
                .
              </p>
              <p className="text-xs text-zinc-500">
                Generated {new Date(data.generatedAt).toLocaleString()} · {data.origin}
              </p>
            </section>
          </>
        )}
      </div>
    </MarketingShell>
  );
}
