import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { keccak256, toHex } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { raffleCampaignAbi } from "@/lib/abi";
import { getCampaignAddress } from "@/lib/campaign";
import { explorerTxUrl } from "@/lib/explorer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { postAdminFunnelCounts } from "@/lib/admin-funnel-fns";
import { postEliasStaffConfirmPlan, postEliasStaffQueueSnapshot } from "@/lib/elias-fns";

export const Route = createFileRoute("/admin")({
  head: () =>
    pageHead({
      title: "Admin",
      description: "Internal BUILDCHAIN campaign tools — not for public indexing.",
      path: "/admin",
      noIndex: true,
    }),
  component: AdminPage,
});

function AdminPage() {
  const campaign = getCampaignAddress();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [secret, setSecret] = useState("");

  const { data: owner } = useReadContract({
    address: campaign,
    abi: raffleCampaignAbi,
    functionName: "owner",
    query: { enabled: !!campaign },
  });

  const { data: phase } = useReadContract({
    address: campaign,
    abi: raffleCampaignAbi,
    functionName: "phase",
    query: { enabled: !!campaign },
  });

  const { data: commitmentOnChain } = useReadContract({
    address: campaign,
    abi: raffleCampaignAbi,
    functionName: "drawCommitment",
    query: { enabled: !!campaign },
  });

  const isOwner = !!owner && !!address && owner.toLowerCase() === address.toLowerCase();

  const commitmentPreview = useMemo(() => {
    if (!secret.startsWith("0x") || secret.length !== 66) return "";
    try {
      return keccak256(secret as `0x${string}`);
    } catch {
      return "";
    }
  }, [secret]);

  const { writeContract, data: txHash, error, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (error) toast.error(error.message.slice(0, 140));
  }, [error]);

  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success(
        <a
          href={explorerTxUrl(chainId, txHash)}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Transaction confirmed
        </a>,
      );
    }
  }, [isSuccess, txHash, chainId]);

  function genSecret() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    setSecret(toHex(bytes));
  }

  function close() {
    if (!campaign) return;
    writeContract({
      address: campaign,
      abi: raffleCampaignAbi,
      functionName: "close",
    });
  }

  function commit() {
    if (!campaign || !commitmentPreview) return;
    writeContract({
      address: campaign,
      abi: raffleCampaignAbi,
      functionName: "commitDraw",
      args: [commitmentPreview as `0x${string}`],
    });
  }

  function reveal() {
    if (!campaign || !secret || secret.length !== 66) return;
    writeContract({
      address: campaign,
      abi: raffleCampaignAbi,
      functionName: "revealDraw",
      args: [secret as `0x${string}`],
    });
  }

  if (!campaign) {
    return (
      <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-lg mx-auto space-y-4">
        <h1 className="font-heading text-xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground">Set VITE_RAFFLE_CAMPAIGN_ADDRESS first.</p>
        <Link to="/" className="text-neon underline text-sm">
          Home
        </Link>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-lg mx-auto space-y-4">
        <h1 className="font-heading text-xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground">Connect the owner wallet.</p>
        <Link to="/" className="text-neon underline text-sm">
          Home
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-lg mx-auto space-y-4">
        <h1 className="font-heading text-xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Connected wallet is not the campaign owner. Owner:{" "}
          <span className="font-mono text-xs">{owner ?? "…"}</span>
        </p>
        <Link to="/profile" className="text-neon underline text-sm">
          Profile
        </Link>
      </div>
    );
  }

  const phaseNum = phase !== undefined ? Number(phase) : 0;

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-lg mx-auto space-y-6">
      <h1 className="font-heading text-xl font-bold">Campaign admin</h1>
      <p className="text-xs text-muted-foreground font-mono break-all">{campaign}</p>

      <div className="glass rounded-xl p-4 space-y-2 text-sm">
        <p>
          Phase:{" "}
          <span className="font-semibold text-neon">
            {phaseNum === 0 ? "Active" : phaseNum === 1 ? "Closed (draw)" : "Drawn"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground break-all">
          On-chain commitment:{" "}
          {commitmentOnChain &&
          commitmentOnChain !== "0x0000000000000000000000000000000000000000000000000000000000000000"
            ? String(commitmentOnChain)
            : "—"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Commit–reveal: generate a random 32-byte secret, publish its hash with{" "}
          <code className="text-foreground">commitDraw</code>, then call{" "}
          <code className="text-foreground">revealDraw</code> with the same secret.
        </p>
        <Button type="button" variant="secondary" className="w-full" onClick={genSecret}>
          Generate random secret (bytes32)
        </Button>
        <Input
          className="font-mono text-xs"
          placeholder="0x… secret (32 bytes)"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        {commitmentPreview && (
          <p className="text-[10px] font-mono break-all text-muted-foreground">
            Commitment keccak: {commitmentPreview}
          </p>
        )}
      </div>

      {address ? <AdminFunnelPanel wallet={address} /> : null}

      <EliasStaffTools />

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={phaseNum !== 0 || isPending || confirming}
          onClick={close}
        >
          Close mint
        </Button>
        <Button
          type="button"
          disabled={phaseNum !== 1 || isPending || confirming || !commitmentPreview}
          onClick={commit}
        >
          Commit draw hash
        </Button>
        <Button
          type="button"
          disabled={phaseNum !== 1 || isPending || confirming || secret.length !== 66}
          onClick={reveal}
        >
          Reveal & pick winner
        </Button>
      </div>

      <Link to="/" className="text-sm text-neon underline block">
        ← Home
      </Link>
    </div>
  );
}

function EliasStaffTools() {
  const [secret, setSecret] = useState("");
  const [snapshotText, setSnapshotText] = useState("");
  const [planId, setPlanId] = useState("");
  const [busy, setBusy] = useState(false);
  const fetchSnap = useServerFn(postEliasStaffQueueSnapshot);
  const confirmPlan = useServerFn(postEliasStaffConfirmPlan);

  async function loadSnapshot() {
    setBusy(true);
    try {
      const r = await fetchSnap({ data: { secret } });
      if (!r.ok) {
        toast.error(r.reason === "unauthorized" ? "Bad secret" : "Could not load");
        setSnapshotText("");
        return;
      }
      setSnapshotText(JSON.stringify({ jobs: r.jobs, offers: r.offers }, null, 2));
      toast.success("Snapshot loaded");
    } finally {
      setBusy(false);
    }
  }

  async function markConfirmed() {
    if (!planId.trim()) {
      toast.error("Enter plan UUID");
      return;
    }
    setBusy(true);
    try {
      const r = await confirmPlan({ data: { secret, planId: planId.trim() } });
      if (!r.ok) toast.error(r.reason ?? "Failed");
      else toast.success("Plan marked confirmed — guest can claim XP if wallet linked.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-xl border border-white/[0.08] p-4 space-y-3 text-sm">
      <h2 className="font-heading text-base font-semibold">Elias concierge (staff)</h2>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Requires server <code className="text-zinc-300">ELIAS_ADMIN_SECRET</code> and Supabase. Load
        queued partner emails; mark a plan <span className="font-mono">confirmed</span> after
        partners reply so guests can claim <span className="font-mono">elias-plan-confirmed</span>{" "}
        XP.
      </p>
      <Input
        type="password"
        autoComplete="off"
        placeholder="ELIAS_ADMIN_SECRET"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => void loadSnapshot()}
        >
          Load outreach queue
        </Button>
      </div>
      {snapshotText ? (
        <pre className="max-h-48 overflow-auto rounded-lg border border-white/[0.06] bg-black/40 p-3 font-mono text-[10px] text-zinc-400">
          {snapshotText}
        </pre>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500">Plan UUID</label>
          <Input
            placeholder="Plan id (confirm with partners first)"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="font-mono text-xs"
          />
        </div>
        <Button type="button" size="sm" disabled={busy} onClick={() => void markConfirmed()}>
          Mark confirmed
        </Button>
      </div>
    </div>
  );
}

function AdminFunnelPanel({ wallet }: { wallet: `0x${string}` }) {
  const fetchFunnel = useServerFn(postAdminFunnelCounts);
  const { data, refetch, isFetching, isError } = useQuery({
    queryKey: ["admin-funnel", wallet],
    queryFn: async () => fetchFunnel({ data: { wallet } }),
    enabled: !!wallet,
    staleTime: 60_000,
  });

  return (
    <div className="glass rounded-xl border border-white/[0.08] p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-semibold">Funnel (24h)</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "…" : "Refresh"}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        PostHog event counts. Server needs{" "}
        <code className="text-zinc-300">POSTHOG_PERSONAL_API_KEY</code>,{" "}
        <code className="text-zinc-300">POSTHOG_PROJECT_ID</code>, optional{" "}
        <code className="text-zinc-300">POSTHOG_HOST</code>. Client needs{" "}
        <code className="text-zinc-300">VITE_POSTHOG_KEY</code>.
      </p>
      {isError ? (
        <p className="text-xs text-amber-600/90">Could not load funnel.</p>
      ) : !data ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : data.ok === false ? (
        <p className="text-xs text-muted-foreground">
          {data.reason === "forbidden"
            ? "Wallet is not campaign owner."
            : data.reason === "posthog_unconfigured"
              ? "PostHog server env not set or query failed."
              : data.reason === "no_campaign"
                ? "No campaign address."
                : "Unavailable."}
        </p>
      ) : (
        <ul className="grid gap-1 font-mono text-xs">
          {(
            [
              ["landing_view", data.counts.landing_view],
              ["wallet_connected", data.counts.wallet_connected],
              ["mint_clicked", data.counts.mint_clicked],
              ["mint_confirmed", data.counts.mint_confirmed],
              ["share_clicked", data.counts.share_clicked],
            ] as const
          ).map(([k, v]) => (
            <li key={k} className="flex justify-between gap-4 border-b border-white/[0.06] py-1">
              <span className="text-zinc-400">{k}</span>
              <span className="text-neon">{v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
