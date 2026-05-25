import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import dropArt1 from "@/assets/drop-art-1.jpg";
import { Bell, Layers, Star, Ticket } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount, useChainId, useReadContract, useReadContracts } from "wagmi";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { postMergedDropBySlug } from "@/lib/home-drops-merge";
import { raffleCampaignAbi } from "@bc/contracts-sdk";
import { getCampaignAddress } from "@/lib/campaign";
import { getDefaultChain } from "@/lib/chains";
import { explorerAddressUrl } from "@/lib/explorer";
import { getDropBySlug } from "@/content/home-drops";
import { farcasterFollowProfileUrl } from "@/lib/community-links";
import { warpcastComposeUrl } from "@/lib/campaign-share";

export const Route = createFileRoute("/collections")({
  head: () =>
    pageHead({
      title: "Collections",
      description:
        "Browse your BUILDCHAIN NFT ticket collections — complete sets and track rewards on Base.",
      path: "/collections",
      keywords: ["BUILDCHAIN", "collections", "NFT", "tickets"],
    }),
  validateSearch: (search: Record<string, unknown>) => {
    const minted =
      typeof search.minted === "string" && search.minted.trim().length > 0
        ? search.minted.trim()
        : undefined;
    return { minted };
  },
  component: CollectionsPage,
});

const rarityBorder: Record<string, string> = {
  legendary: "border-gold/50 glow-gold",
  rare: "border-neon/50 glow-neon",
  common: "border-border",
};

const rarityLabel: Record<string, string> = {
  legendary: "gradient-gold text-gold-foreground",
  rare: "gradient-neon text-neon-foreground",
  common: "bg-secondary text-secondary-foreground",
};

/** Boost rules are cosmetic until tied to verified on-chain balances (transparent copy). */
function boostLabel(balance: number): string {
  if (balance >= 10) return "2.0x";
  if (balance >= 3) return "1.2x";
  return "1.0x";
}

function rarityFromSerial(serial: number): "legendary" | "rare" | "common" {
  if (serial % 17 === 0) return "legendary";
  if (serial % 5 === 0) return "rare";
  return "common";
}

function CollectionsPage() {
  const { minted } = Route.useSearch();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const campaign = getCampaignAddress();

  const { data: balance } = useReadContract({
    address: campaign,
    abi: raffleCampaignAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!campaign && !!address },
  });

  const { data: totalSupplyOnChain } = useReadContract({
    address: campaign,
    abi: raffleCampaignAbi,
    functionName: "totalSupply",
    query: { enabled: !!campaign },
  });

  const count = Number(balance ?? 0n);
  const mintedDropStatic = minted ? getDropBySlug(minted) : undefined;
  const fetchMergedDrop = useServerFn(postMergedDropBySlug);
  const { data: mintedDropMerged } = useQuery({
    queryKey: ["collections-minted-drop", minted],
    queryFn: async () => (minted ? fetchMergedDrop({ data: { slug: minted } }) : null),
    enabled: !!minted,
    staleTime: 60_000,
  });
  const mintedDropTitle = mintedDropMerged?.title ?? mintedDropStatic?.title ?? minted;
  const totalMinted = totalSupplyOnChain !== undefined ? Number(totalSupplyOnChain) : null;
  const shareOfPool =
    totalMinted && totalMinted > 0 && count > 0 ? Math.min(100, (count / totalMinted) * 100) : null;

  const indexContracts = useMemo(() => {
    if (!campaign || !address || count === 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      address: campaign,
      abi: raffleCampaignAbi,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address, BigInt(i)] as const,
    }));
  }, [campaign, address, count]);

  const { data: idResults, isLoading: idsLoading } = useReadContracts({
    contracts: indexContracts,
    query: { enabled: indexContracts.length > 0 },
  });

  const tokenIds =
    idResults
      ?.map((r) => (r.status === "success" ? r.result : undefined))
      .filter((x) => x !== undefined) ?? [];

  const demoCollections = [
    {
      name: "Genesis Series",
      tickets: [
        { id: 1, serial: "#0042", rarity: "legendary" as const, image: dropArt1, boost: "3.5x" },
      ],
      owned: 1,
      total: 5,
    },
  ];

  if (!campaign || !isConnected) {
    return (
      <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-5xl mx-auto space-y-8">
        <Tabs value="tickets" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tickets" asChild>
              <Link to="/collections" search={{ minted: undefined }}>
                Raffle tickets
              </Link>
            </TabsTrigger>
            <TabsTrigger value="shares" asChild>
              <Link to="/marketplace">Project shares</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-neon" />
          <h1 className="font-heading text-2xl font-bold text-foreground">My Collections</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {!isConnected
            ? "Connect your wallet to see tickets."
            : `Set VITE_RAFFLE_CAMPAIGN_ADDRESS to load live ERC721 tickets on ${getDefaultChain().name}.`}
        </p>
        {demoCollections.map((col) => (
          <DemoCollection key={col.name} col={col} />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-5xl mx-auto space-y-8">
      <Tabs value="tickets" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tickets" asChild>
            <Link to="/collections" search={{ minted: undefined }}>
              Raffle tickets
            </Link>
          </TabsTrigger>
          <TabsTrigger value="shares" asChild>
            <Link to="/marketplace">Project shares</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-neon" />
        <h1 className="font-heading text-2xl font-bold text-foreground">My Collections</h1>
      </div>

      <p className="text-xs text-muted-foreground font-mono">
        Campaign:{" "}
        <a
          href={explorerAddressUrl(chainId, campaign)}
          target="_blank"
          rel="noreferrer"
          className="text-neon underline"
        >
          {campaign}
        </a>
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">Live tickets</h2>
          <span className="text-xs text-muted-foreground">{count} owned</span>
        </div>

        {minted ? (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3 text-sm text-zinc-200">
            <p className="font-semibold text-emerald-200/95">You&apos;re in the draw</p>
            <p className="mt-1 text-muted-foreground">
              Pool <span className="font-mono text-zinc-200">{mintedDropTitle ?? minted}</span>.
              Receipts are in your wallet; stack more entries anytime.
            </p>
          </div>
        ) : null}

        {count > 0 ? (
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-[var(--vault-gold)]" aria-hidden />
              <div className="min-w-0 space-y-2">
                <p className="font-heading text-sm font-semibold text-foreground">
                  Boost your odds
                </p>
                <p className="text-xs text-muted-foreground">
                  Each ticket is an independent entry. More tickets increase your chances versus
                  other minters (not a guarantee).
                </p>
                {shareOfPool != null ? (
                  <p className="text-xs text-zinc-300">
                    Rough share of minted entries so far:{" "}
                    <span className="font-mono text-emerald-300/95">
                      {shareOfPool < 0.01 ? "<0.01" : shareOfPool.toFixed(2)}%
                    </span>{" "}
                    ({count} of {totalMinted} minted on this campaign).
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Connect and load on-chain supply to see a live % estimate.
                  </p>
                )}
                <Link
                  to="/play"
                  hash="drops"
                  className="inline-flex items-center justify-center rounded-full border border-[rgb(212_175_55/0.45)] bg-black/40 px-4 py-2 text-xs font-medium text-white transition hover:border-[rgb(212_175_55/0.75)]"
                >
                  Buy another ticket
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/10 pt-3">
              <Bell className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-heading text-sm font-semibold text-foreground">
                  Get notified when this draws
                </p>
                <p>Follow on Farcaster for public draw updates, or drop a reminder in the feed.</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={farcasterFollowProfileUrl()}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-100 transition hover:border-white/25"
                  >
                    Follow Farcaster ↗
                  </a>
                  <a
                    href={warpcastComposeUrl(
                      "Remind me when BUILDCHAIN raffle draws settle — @buildchain",
                    )}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-100 transition hover:border-white/25"
                  >
                    Post a reminder ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {idsLoading && <p className="text-sm text-muted-foreground">Loading token IDs…</p>}

        {!idsLoading && count === 0 && (
          <p className="text-sm text-muted-foreground">
            No tickets yet — enter a draw from the home drops.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tokenIds.map((tid) => {
            const serial = Number(tid);
            const rarity = rarityFromSerial(serial);
            return (
              <div
                key={String(tid)}
                className={`glass rounded-xl overflow-hidden border transition-all hover:scale-105 ${rarityBorder[rarity]}`}
              >
                <div className="relative aspect-square bg-secondary flex items-center justify-center">
                  <span className="font-heading text-3xl text-muted-foreground">
                    #{String(tid)}
                  </span>
                  <span
                    className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${rarityLabel[rarity]}`}
                  >
                    {rarity}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-heading font-bold text-sm text-foreground">#{String(tid)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Boost (holder tier): <span className="text-emerald">{boostLabel(count)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DemoCollection({
  col,
}: {
  col: {
    name: string;
    tickets: { id: number; serial: string; rarity: string; image: string; boost: string }[];
    owned: number;
    total: number;
  };
}) {
  return (
    <div className="space-y-4 opacity-70">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-foreground">{col.name}</h2>
        <span className="text-xs text-muted-foreground">
          {col.owned}/{col.total} collected
        </span>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full gradient-emerald"
            style={{ width: `${(col.owned / col.total) * 100}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {col.tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`glass rounded-xl overflow-hidden border ${rarityBorder[ticket.rarity]}`}
          >
            <div className="relative aspect-square">
              <img
                src={ticket.image}
                alt={`Ticket ${ticket.serial}`}
                className="h-full w-full object-cover"
                loading="lazy"
                width={400}
                height={400}
              />
            </div>
            <div className="p-3 text-[10px] text-muted-foreground">Demo placeholder</div>
          </div>
        ))}
      </div>
    </div>
  );
}
