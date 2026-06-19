import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import {
  formatCulturePoints,
  formatPackUsd,
  getPacksByCampaign,
  type CampaignTag,
  type PackDefinition,
} from "@/lib/packs";

async function startCheckout(
  pack: PackDefinition,
  address: `0x${string}`,
  accessToken: string | null,
  network?: "base" | "bsc",
) {
  const res = await fetch("/api/wallet/packs/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      packSlug: pack.slug,
      walletAddress: address,
      ...(network ? { network } : {}),
    }),
  });
  const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
  if (!res.ok || !data.ok || !data.url) {
    throw new Error(data.error ?? "checkout_failed");
  }
  window.location.href = data.url;
}

type Props = {
  campaign: CampaignTag;
  className?: string;
};

function CampaignPackGrid({
  packs,
  busySlug,
  onBuy,
}: {
  packs: PackDefinition[];
  busySlug: string | null;
  onBuy: (pack: PackDefinition) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {packs.map((pack) => (
        <article
          key={pack.slug}
          className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <p className="font-display text-lg font-semibold text-white">{pack.label}</p>
          <p className="mt-1 font-mono text-2xl text-[#C5FF41]">{formatPackUsd(pack.usd)}</p>
          {pack.perkLine ? <p className="mt-2 text-sm text-zinc-400">{pack.perkLine}</p> : null}
          <p className="mt-2 text-sm text-zinc-500">
            +{formatCulturePoints(pack.culturePoints)} Culture Points
          </p>
          {pack.grantsSupporterBadge ? (
            <p className="mt-1 text-xs text-amber-200/80">Includes supporter badge</p>
          ) : null}
          <button
            type="button"
            disabled={busySlug !== null}
            onClick={() => onBuy(pack)}
            className="mt-4 rounded-xl bg-[#C5FF41] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {busySlug === pack.slug ? "Redirecting…" : "Pledge with card"}
          </button>
        </article>
      ))}
    </div>
  );
}

export function CampaignPackCheckout({ campaign, className = "" }: Props) {
  const packs = getPacksByCampaign(campaign);
  const { authenticated, getAccessToken } = usePrivy();
  const { address, isConnected } = useAccount();
  const { activeNetworkId } = useCultureNetwork();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function buyPack(pack: PackDefinition) {
    if (!address || !isConnected) {
      toast.error("Connect your wallet first — pledges attach to your Culture profile.");
      return;
    }
    setBusySlug(pack.slug);
    try {
      const token = authenticated ? await getAccessToken() : null;
      await startCheckout(pack, address, token, activeNetworkId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
    } finally {
      setBusySlug(null);
    }
  }

  if (packs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <CampaignPackGrid packs={packs} busySlug={busySlug} onBuy={(p) => void buyPack(p)} />
    </div>
  );
}
