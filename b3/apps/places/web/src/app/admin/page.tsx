"use client";

import { useCallback, useEffect, useState } from "react";
import { isAddress, zeroAddress } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ComplianceStatus } from "@/components/ComplianceStatus";
import { TrustStrip } from "@/components/TrustStrip";
import { accessControlAbi, complianceAdminAbi, registryAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";
import { COMPLIANCE_ADMIN_ROLE, REGISTRAR_ROLE } from "@/lib/roles";

const STATUS_LABELS = ["None", "Pending", "Verified", "Revoked"] as const;

function AddrRow({
  label,
  addr,
  explorer,
}: {
  label: string;
  addr: `0x${string}`;
  explorer: string;
}) {
  const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  const unset = addr === zeroAddress;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] py-2 text-sm last:border-0">
      <span className="text-zinc-500">{label}</span>
      {unset ? (
        <span className="font-mono text-xs text-zinc-600">not set</span>
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

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const preview = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === "1";
  const [walletInput, setWalletInput] = useState("");
  const [statusIdx, setStatusIdx] = useState(2);
  const {
    registry,
    shareFactory,
    compliance,
    weth,
    router,
    predictionMarket,
    proofNft,
    staking,
    explorer: explorerBase,
  } = useProtocolAddresses();

  const rolesEnabled =
    !!address && registry !== zeroAddress && compliance !== zeroAddress;

  const roleAccount = address ?? zeroAddress;

  const { data: registrarRole, refetch: refetchRegistrarRole } = useReadContract({
    address: registry,
    abi: accessControlAbi,
    functionName: "hasRole",
    args: [REGISTRAR_ROLE, roleAccount],
    query: { enabled: rolesEnabled },
  });

  const { data: complianceRole, refetch: refetchComplianceRole } = useReadContract({
    address: compliance,
    abi: accessControlAbi,
    functionName: "hasRole",
    args: [COMPLIANCE_ADMIN_ROLE, roleAccount],
    query: { enabled: rolesEnabled },
  });

  const isRegistrar = registrarRole === true;
  const isComplianceAdmin = complianceRole === true;

  const refetchRoles = useCallback(() => {
    void refetchRegistrarRole();
    void refetchComplianceRole();
  }, [refetchRegistrarRole, refetchComplianceRole]);

  const showRegistrar = preview || isRegistrar;
  const showCompliance = preview || isComplianceAdmin;
  const showAnySection = showRegistrar || showCompliance;

  const { data: nextPropertyId } = useReadContract({
    address: registry,
    abi: registryAbi,
    functionName: "nextPropertyId",
    query: { enabled: registry !== zeroAddress },
  });

  const { writeContract, data: txHash, isPending, error: writeErr } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (confirmed) void refetchRoles();
  }, [confirmed, refetchRoles]);

  function submitCompliance() {
    if (compliance === zeroAddress) return;
    const w = walletInput.trim() as `0x${string}`;
    if (!isAddress(w)) return;
    writeContract({
      address: compliance,
      abi: complianceAdminAbi,
      functionName: "setWalletStatus",
      args: [w, statusIdx],
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-500/80">Operators</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Admin</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Read deployment health and use on-chain roles for registrar and compliance actions. Keys should use a
          multisig in production — this panel is testnet-oriented.
        </p>
      </header>
      <ComplianceStatus />
      <TrustStrip />

      {preview && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Preview mode: sections visible without role checks. Disable{" "}
          <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_ADMIN_PREVIEW</code> for real gating.
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="text-sm font-medium text-white">Deployment</h2>
        <p className="mt-1 text-xs text-zinc-500">Addresses from environment (sync via scripts/sync_web_env.py).</p>
        <div className="mt-3">
          <AddrRow label="PropertyRegistry" addr={registry} explorer={explorerBase} />
          <AddrRow label="PropertyShareFactory" addr={shareFactory} explorer={explorerBase} />
          <AddrRow label="ComplianceRegistry" addr={compliance} explorer={explorerBase} />
          <AddrRow label="OgRouter" addr={router} explorer={explorerBase} />
          <AddrRow label="WETH9" addr={weth} explorer={explorerBase} />
          <AddrRow label="BinaryPredictionMarket" addr={predictionMarket} explorer={explorerBase} />
          <AddrRow label="PropertyShareProof" addr={proofNft} explorer={explorerBase} />
          <AddrRow label="OgStaking" addr={staking} explorer={explorerBase} />
        </div>
        <p className="mt-4 text-[11px] text-zinc-500">
          Explorer:{" "}
          <a href={explorerBase} target="_blank" rel="noreferrer" className="text-gold-400 hover:underline">
            {explorerBase}
          </a>
        </p>
      </div>

      {!isConnected && !preview && (
        <p className="text-center text-sm text-zinc-500">Connect a wallet that holds a registrar or compliance role.</p>
      )}

      {(isConnected || preview) && !showAnySection && !preview && (
        <p className="text-center text-sm text-zinc-500">
          No registrar or compliance admin role detected for this wallet.
        </p>
      )}

      {(isConnected || preview) && showRegistrar && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-medium text-white">Registrar</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Next property id (monotonic counter). Register and seed via Foundry scripts — see deployments/README.md.
          </p>
          <p className="mt-3 font-mono text-lg text-gold-200/90">
            nextPropertyId:{" "}
            {nextPropertyId !== undefined ? nextPropertyId.toString() : registry === zeroAddress ? "—" : "…"}
          </p>
        </div>
      )}

      {(isConnected || preview) && showCompliance && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-medium text-white">Compliance</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Set KYC status for a wallet on ComplianceRegistry. Server-side relayers can also call{" "}
            <code className="rounded bg-black/30 px-1">setWalletStatus</code> — see web README and compliance-relay.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block text-xs text-zinc-500">
              Wallet
              <input
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="0x…"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:border-gold-500/40"
              />
            </label>
            <label className="block text-xs text-zinc-500">
              Status
              <select
                value={statusIdx}
                onChange={(e) => setStatusIdx(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold-500/40"
              >
                {STATUS_LABELS.map((l, i) => (
                  <option key={l} value={i}>
                    {l} ({i})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={
                !isConnected ||
                isPending ||
                confirming ||
                compliance === zeroAddress ||
                !isAddress(walletInput.trim())
              }
              onClick={submitCompliance}
              className="rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
            >
              {isPending || confirming ? "Confirm…" : "Submit transaction"}
            </button>
            {writeErr && <p className="text-xs text-red-400/90">{writeErr.message}</p>}
            {txHash && (
              <a
                href={`${explorerBase}/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-gold-400 hover:underline"
              >
                View transaction →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
