import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import {
  CULTURE_PACKS,
  formatCulturePoints,
  formatPackUsd,
  type PackDefinition,
} from "@/lib/packs";

async function startCheckout(
  pack: PackDefinition,
  address: `0x${string}`,
  accessToken: string | null,
) {
  const res = await fetch("/api/wallet/packs/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ packSlug: pack.slug, walletAddress: address }),
  });
  const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
  if (!res.ok || !data.ok || !data.url) {
    throw new Error(data.error ?? "checkout_failed");
  }
  window.location.href = data.url;
}

function PackGrid({
  busySlug,
  onBuy,
}: {
  busySlug: string | null;
  onBuy: (pack: PackDefinition) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CULTURE_PACKS.map((pack) => (
        <article
          key={pack.slug}
          className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <p className="font-display text-xl font-semibold text-white">{pack.label}</p>
          <p className="mt-1 font-mono text-2xl text-[#C5FF41]">{formatPackUsd(pack.usd)}</p>
          <p className="mt-2 text-sm text-zinc-400">
            +{formatCulturePoints(pack.culturePoints)} Culture Points
          </p>
          {pack.grantsSupporterBadge && (
            <p className="mt-1 text-xs text-amber-200/80">Includes supporter badge</p>
          )}
          {pack.grantsIdentityMintCredit && (
            <p className="mt-1 text-xs text-[#00E5FF]/80">Includes identity mint credit</p>
          )}
          <button
            type="button"
            disabled={busySlug !== null}
            onClick={() => onBuy(pack)}
            className="mt-4 rounded-xl bg-[#C5FF41] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {busySlug === pack.slug ? "Redirecting…" : "Buy with card"}
          </button>
        </article>
      ))}
    </div>
  );
}

export function PackCheckoutActionsPrivy() {
  const { authenticated, getAccessToken } = usePrivy();
  const { address, isConnected } = useAccount();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function buyPack(pack: PackDefinition) {
    if (!address || !isConnected) {
      toast.error("Sign in and connect your wallet first.");
      return;
    }
    setBusySlug(pack.slug);
    try {
      const token = authenticated ? await getAccessToken() : null;
      await startCheckout(pack, address, token);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
    } finally {
      setBusySlug(null);
    }
  }

  return <PackGrid busySlug={busySlug} onBuy={(p) => void buyPack(p)} />;
}

export function PackCheckoutActionsLegacy() {
  const { address, isConnected } = useAccount();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function buyPack(pack: PackDefinition) {
    if (!address || !isConnected) {
      toast.error("Connect your wallet first.");
      return;
    }
    setBusySlug(pack.slug);
    try {
      await startCheckout(pack, address, null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
    } finally {
      setBusySlug(null);
    }
  }

  return <PackGrid busySlug={busySlug} onBuy={(p) => void buyPack(p)} />;
}
