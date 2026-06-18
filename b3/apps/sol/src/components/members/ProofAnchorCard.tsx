"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Anchor, ExternalLink, Loader2 } from "lucide-react";
import bs58 from "bs58";
import { toast } from "sonner";

import { WalletConnectButton } from "@/components/solana/WalletConnectButton";
import {
  anchorProof,
  getProofStatus,
  linkMemberWallet,
  requestLinkWalletNonce,
  requestProofAnchorNonce,
} from "@/lib/api/proof.functions";
import { buildAnchorProofMessage, buildLinkMemberMessage } from "@/lib/solana/claim-message";
import { getSolanaExplorerTxUrl } from "@/lib/solana/explorer";
import { PROOF_SCORE_THRESHOLD, type ProofSignals } from "@/lib/proof-data";

type ProofSnapshotView = {
  id: string;
  periodKey: string;
  proofScore: number;
  threshold: number;
  status: "draft" | "eligible" | "anchored";
  signals: ProofSignals;
  contentHash: string;
  txSignature: string | null;
  walletAddress: string | null;
};

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-2 bg-border">
        <div className="h-full bg-signal transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ProofAnchorCard({ linkedWallet }: { linkedWallet: string | null }) {
  const { publicKey, signMessage, connected } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const router = useRouter();
  const queryClient = useQueryClient();

  const proof = useQuery({
    queryKey: ["proof-status"],
    queryFn: () => getProofStatus(),
  });

  const linkWallet = useMutation({
    mutationFn: async () => {
      if (!walletAddress || !signMessage) throw new Error("Connect a wallet that supports signing");
      const { nonce, email } = await requestLinkWalletNonce();
      const message = buildLinkMemberMessage(email, walletAddress, nonce);
      const signature = await signMessage(new TextEncoder().encode(message));
      return linkMemberWallet({
        data: { walletAddress, nonce, signature: bs58.encode(signature) },
      });
    },
    onSuccess: () => {
      toast.success("Wallet linked.");
      queryClient.invalidateQueries({ queryKey: ["proof-status"] });
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const anchor = useMutation({
    mutationFn: async (snapshot: ProofSnapshotView) => {
      if (!walletAddress || !signMessage) throw new Error("Connect a wallet that supports signing");
      const { nonce } = await requestProofAnchorNonce({ data: { snapshotId: snapshot.id } });
      const message = buildAnchorProofMessage(
        walletAddress,
        snapshot.periodKey,
        snapshot.contentHash,
        nonce,
      );
      const signature = await signMessage(new TextEncoder().encode(message));
      return anchorProof({
        data: { snapshotId: snapshot.id, signature: bs58.encode(signature) },
      });
    },
    onSuccess: () => {
      toast.success("Proof anchored on-chain.");
      queryClient.invalidateQueries({ queryKey: ["proof-status"] });
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const data = proof.data;
  const current = data?.current as ProofSnapshotView | null | undefined;
  const isLinked = Boolean(linkedWallet || data?.walletAddress);
  const walletMatches =
    !linkedWallet || !walletAddress || linkedWallet.toLowerCase() === walletAddress;

  if (proof.isLoading) {
    return (
      <div className="flex items-center gap-2 border border-border bg-surface p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Computing proof score...
      </div>
    );
  }

  if (!current) {
    return (
      <div className="border border-border bg-surface p-8 text-sm text-muted-foreground">
        Start logging mood, journal, and deliverables to build verified proof.
      </div>
    );
  }

  const signals = current.signals;

  return (
    <div className="border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Verified proof</p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            {current.periodKey.replace("-", " ")} · {current.proofScore}/100
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Composite score from mood, journal, deliverables, and streak. Anchor on-chain to unlock
            treasury payouts.
          </p>
        </div>
        <div className="border border-border px-4 py-3 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Status
          </div>
          <div className="mt-1 font-display text-lg font-bold capitalize">{current.status}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <ScoreBar label="Mood" value={signals.moodScore} max={70} />
        <ScoreBar label="Journal" value={signals.journalScore} max={45} />
        <ScoreBar label="Deliverables" value={signals.deliverableScore} max={100} />
        <ScoreBar label="Streak + identity" value={signals.streakScore + signals.identityScore} max={45} />
      </div>

      <p className="mt-4 font-mono text-[10px] text-muted-foreground">
        Threshold: {PROOF_SCORE_THRESHOLD} · Hash: {current.contentHash.slice(0, 12)}…
      </p>

      {current.status === "anchored" && current.txSignature && (
        <a
          href={getSolanaExplorerTxUrl(current.txSignature)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-signal hover:underline"
        >
          View on-chain anchor
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
        {!connected && <WalletConnectButton />}
        {connected && !isLinked && (
          <button
            type="button"
            onClick={() => linkWallet.mutate()}
            disabled={linkWallet.isPending}
            className="bg-signal px-5 py-3 font-mono text-xs uppercase tracking-widest text-signal-foreground disabled:opacity-50"
          >
            {linkWallet.isPending ? "Linking..." : "Link wallet to account"}
          </button>
        )}
        {connected && isLinked && !walletMatches && (
          <p className="text-sm text-muted-foreground">
            Connected wallet does not match linked wallet ({linkedWallet?.slice(0, 8)}…).
          </p>
        )}
        {connected &&
          isLinked &&
          walletMatches &&
          current.status === "eligible" && (
            <button
              type="button"
              onClick={() => anchor.mutate(current)}
              disabled={anchor.isPending}
              className="inline-flex items-center gap-2 bg-signal px-5 py-3 font-mono text-xs uppercase tracking-widest text-signal-foreground disabled:opacity-50"
            >
              {anchor.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Anchor className="h-4 w-4" />
              )}
              {anchor.isPending ? "Anchoring..." : "Anchor this week on-chain"}
            </button>
          )}
        {current.status === "draft" && (
          <p className="text-sm text-muted-foreground">
            Keep showing up — {PROOF_SCORE_THRESHOLD - current.proofScore} points to eligibility.
          </p>
        )}
      </div>
    </div>
  );
}
