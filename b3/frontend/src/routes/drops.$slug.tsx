import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ogImageForHomeDrop } from "@/lib/farcaster-embed-meta";
import { loadMergedDropBySlug } from "@/lib/home-drops-merge";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { type HomeDrop } from "@/content/home-drops";
import { useAccount, useChainId } from "wagmi";
import { ArrowLeft } from "lucide-react";
import { getCampaignAddress } from "@/lib/campaign";
import { explorerAddressUrl } from "@/lib/explorer";
import { getDefaultChain } from "@/lib/chains";
import { buildDropShareUrl } from "@/lib/raffle-referral";
import { warpcastComposeUrl } from "@/lib/campaign-share";
import { captureShareClicked } from "@/lib/analytics";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/drops/$slug")({
  head: async ({ params }) => {
    const drop = await loadMergedDropBySlug(params.slug);
    if (!drop) return {};
    return pageHead({
      title: drop.title,
      description: drop.story ?? `${drop.title} — ${BRAND_DISPLAY_NAME} vault drop.`,
      path: `/drops/${drop.slug}`,
      image: ogImageForHomeDrop(drop),
      keywords: [BRAND_DISPLAY_NAME, "drop", "RWA", drop.slug],
    });
  },
  loader: async ({ params }) => {
    const drop = await loadMergedDropBySlug(params.slug);
    if (!drop) throw notFound();
    return drop;
  },
  component: DropStoryPage,
});

function isVideo(src: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(src);
}

function DropStoryPage() {
  const drop = Route.useLoaderData() as HomeDrop;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const campaign = drop.campaignAddress ?? getCampaignAddress();
  const explorer = campaign ? explorerAddressUrl(chainId, campaign) : null;
  const chain = getDefaultChain();
  const story = drop.storyPage;

  return (
    <div className="min-h-screen bg-black pb-nav-safe">
      <section className="relative min-h-[52vh] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
        {isVideo(drop.image) ? (
          <video
            src={drop.image}
            className="h-[52vh] w-full object-cover opacity-95"
            muted
            loop
            playsInline
            autoPlay
            aria-label=""
          />
        ) : (
          <img src={drop.image} alt="" className="h-[52vh] w-full object-cover" loading="eager" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-10 pt-24 md:px-10">
          <Link
            to="/"
            hash="drops"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to drops
          </Link>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--vault-gold)]">
            The piece
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {drop.title}
          </h1>
          {story?.pieceTagline ? (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">
              {story.pieceTagline}
            </p>
          ) : (
            <p className="mt-4 max-w-2xl text-zinc-400">{drop.story}</p>
          )}
        </div>
      </section>

      {story?.theStory?.length ? (
        <section className="mx-auto max-w-3xl space-y-6 px-4 py-14 md:px-8">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--vault-gold)]">
            The story
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-zinc-300">
            {story.theStory.map((para, i) => (
              <p key={i} className="text-pretty">
                {para}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-white/[0.06] bg-white/[0.02] px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-12">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--vault-gold)]">
              The value
            </h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Origin
                </dt>
                <dd className="mt-1 text-zinc-200">
                  {story?.theValue.origin ?? drop.assetValueLabel}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Artist / line
                </dt>
                <dd className="mt-1 text-zinc-200">{story?.theValue.artist ?? drop.artist}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Rarity
                </dt>
                <dd className="mt-1 text-zinc-200">{story?.theValue.rarity ?? drop.rarity}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Cultural weight
                </dt>
                <dd className="mt-1 text-zinc-200">
                  {story?.theValue.cultural ??
                    "Collection-grade inventory backing this pool — not a render pipeline."}
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--vault-gold)]">
              The access
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-zinc-400">
              {story?.theAccess ??
                "Tickets enter a provably fair draw. One winner receives coordinated fulfillment after on-chain selection — rules and balances are inspectable from your wallet."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/"
                hash="drops"
                className="cta-vault-glow inline-flex rounded-full bg-[var(--b3-purple)] px-8 py-3 text-sm font-medium text-white hover:bg-[var(--base-blue-hover)]"
              >
                Enter draw
              </Link>
              {isConnected && address ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-5 py-2.5 text-xs font-medium text-zinc-200 transition hover:border-[rgb(212_175_55/0.35)]"
                    onClick={() => {
                      captureShareClicked({
                        channel: "warpcast",
                        context: "drop",
                        drop_slug: drop.slug,
                      });
                      const url = buildDropShareUrl(drop.slug, address as `0x${string}`);
                      window.open(
                        warpcastComposeUrl(`🎟 ${drop.title}\n${url}`),
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                    Share with ref
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-5 py-2.5 text-xs font-medium text-zinc-200 transition hover:border-[rgb(212_175_55/0.35)]"
                    onClick={async () => {
                      captureShareClicked({
                        channel: "copy",
                        context: "drop",
                        drop_slug: drop.slug,
                      });
                      try {
                        await navigator.clipboard.writeText(
                          buildDropShareUrl(drop.slug, address as `0x${string}`),
                        );
                        toast.success("Referral link copied");
                      } catch {
                        toast.error("Could not copy");
                      }
                    }}
                  >
                    Copy ref link
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-emerald-400/90">
          Onchain proof
        </h2>
        <div className="mt-6 space-y-3 rounded-2xl border border-white/[0.08] bg-black/40 p-6 font-mono text-xs text-zinc-400">
          <p>
            <span className="text-zinc-500">Network · </span>
            {chain.name} ({chain.id})
          </p>
          {campaign ? (
            <p className="break-all">
              <span className="text-zinc-500">Contract · </span>
              {campaign}
            </p>
          ) : (
            <p>
              <span className="text-zinc-500">Contract · </span>
              Configure <span className="text-zinc-300">VITE_RAFFLE_CAMPAIGN_ADDRESS</span> for live
              mint.
            </p>
          )}
          <p>
            <span className="text-zinc-500">Draw logic · </span>
            Phase-based raffle campaign (mint → draw → settlement). Verify ABI and phase on
            explorer.
          </p>
          {explorer ? (
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer"
              className="inline-block pt-2 text-[var(--vault-gold)] hover:underline"
            >
              Open in explorer ↗
            </a>
          ) : null}
          {story?.onChainNote ? (
            <p className="pt-4 text-[13px] leading-relaxed text-zinc-500">{story.onChainNote}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
