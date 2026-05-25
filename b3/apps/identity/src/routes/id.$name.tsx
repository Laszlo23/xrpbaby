import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { Particles } from "@/components/Particles";
import { basescanUrl } from "@/lib/chain/config";
import { formatShortAddress } from "@/lib/chain/identityContract";
import { TLD_LABELS } from "@/lib/chain/tlds";
import { IdentityNftCard } from "@/components/IdentityNftCard";
import { ProfileActions } from "@/components/ProfileActions";
import { ProfileHoldings } from "@/components/ProfileHoldings";
import { getProfileView, type ProfileView } from "@/lib/identity";
import { openSeaAssetUrl } from "@/lib/nft/marketplace";
import { profileMetaClaimed, profileMetaUnclaimed } from "@/lib/seo/meta";
import { profileUrl } from "@/lib/seo/site";
import { OwnerIdentitiesList } from "@/components/OwnerIdentitiesList";
import particlesImg from "@/assets/particles.jpg";

const VALID_TLDS = new Set<string>(TLD_LABELS);

export const Route = createFileRoute("/id/$name")({
  loader: async ({ params }) => {
    const parts = params.name.toLowerCase().split(".");
    if (parts.length !== 2 || !parts[0] || !VALID_TLDS.has(parts[1])) {
      throw notFound();
    }
    return getProfileView(params.name);
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    if (loaderData.kind === "unclaimed") {
      const { meta, links } = profileMetaUnclaimed(loaderData.fullName);
      return { meta, links };
    }
    const { onchain, socialGraph } = loaderData;
    const titleName = socialGraph.displayName || onchain.fullName;
    const desc =
      socialGraph.farcaster?.bio ||
      `Onchain identity ${onchain.fullName} · token #${onchain.tokenId.toString()} on ${onchain.chainLabel}`;
    const { meta, links } = profileMetaClaimed({
      fullName: onchain.fullName,
      titleName,
      description: desc,
      avatarUrl: socialGraph.avatarUrl,
      farcasterUsername: socialGraph.farcaster?.username ?? null,
    });
    return { meta, links };
  },
  notFoundComponent: NotFoundProfile,
  errorComponent: ProfileError,
  component: ProfileRoute,
});

function ProfileError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <motion.div className="grid min-h-screen place-items-center p-8 text-center text-muted-foreground">
      <motion.div>
        <p className="font-mono text-xs uppercase tracking-[0.3em]">profile error</p>
        <p className="mt-3 text-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
            className="rounded-full bg-foreground px-5 py-2 font-display text-sm font-semibold text-background"
          >
            Try again
          </button>
          <Link to="/" className="inline-block text-primary underline">
            ← back to homepage
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileRoute() {
  const data = Route.useLoaderData();
  if (data.kind === "unclaimed") {
    return <NotFoundProfile fullName={data.fullName} />;
  }
  return <ProfilePage view={data} />;
}

function NotFoundProfile({ fullName }: { fullName?: string }) {
  const claimSearch = fullName
    ? { name: fullName.split(".")[0], tld: `.${fullName.split(".")[1]}` }
    : undefined;

  return (
    <motion.div className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <motion.div className="max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
          unclaimed
        </p>
        <h1 className="mt-6 font-display text-5xl font-medium tracking-tight text-gradient">
          {fullName ? (
            <>
              <span className="text-gradient">{fullName.split(".")[0]}</span>
              <span className="font-serif italic text-primary">.{fullName.split(".")[1]}</span>
            </>
          ) : (
            "This name is still open."
          )}
        </h1>
        <p className="mt-4 text-muted-foreground">
          No one owns this identity yet. Be the first to mint it on Base.
        </p>
        <Link
          to="/"
          hash="claim"
          search={claimSearch}
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 font-display text-sm font-semibold text-background"
        >
          Claim a name →
        </Link>
      </motion.div>
    </motion.div>
  );
}

function ProfilePage({ view }: { view: Extract<ProfileView, { kind: "claimed" }> }) {
  const { onchain: o, socialGraph: sg } = view;
  const { address, isConnected } = useAccount();
  const isOwner =
    isConnected &&
    address &&
    address.toLowerCase() === o.owner.toLowerCase();
  const shareUrl = profileUrl(o.fullName);
  const ownerShort = formatShortAddress(o.owner);
  const accentText = sg.accent === "gold" ? "text-gradient-gold" : "text-primary";
  const mintedLabel = o.mintedAt.toISOString().slice(0, 10);
  const hasFarcaster = Boolean(sg.farcaster);

  async function copyProfileUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Profile link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Nav />

      <section className="hero-bg relative overflow-hidden px-4 pb-20 pt-32">
        <motion.div
          className="grid-overlay absolute inset-0 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <img
          src={particlesImg}
          alt=""
          width={1536}
          height={1024}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
          style={{ maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)" }}
        />
        <Particles count={30} />

        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              ← Culture Layer
            </Link>
            <span>token #{o.tokenId.toString()}</span>
          </motion.div>

          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass-strong rounded-2xl border border-primary/30 p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                Your identity · minted onchain
              </p>
              <p className="mt-2 font-display text-xl font-medium tracking-tight">
                <span className="text-gradient">{o.handle}</span>
                <span className="font-serif italic text-primary">.{o.tld}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  #{o.tokenId.toString()}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bookmark your profile — share it anywhere.
              </p>
              <p className="mt-2 truncate font-mono text-xs text-foreground">{shareUrl}</p>
              <OwnerIdentitiesList currentFullName={o.fullName} />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyProfileUrl()}
                  className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background"
                >
                  Copy profile link
                </button>
                <Link
                  to="/id/$name"
                  params={{ name: o.fullName }}
                  className="rounded-full border border-border-strong px-4 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                >
                  Open profile
                </Link>
              </div>
            </motion.div>
          )}

          {sg.avatarUrl && (
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              src={sg.avatarUrl}
              alt=""
              className="mt-8 h-20 w-20 rounded-2xl border border-border-strong object-cover ring-2 ring-primary/20"
            />
          )}

          {hasFarcaster && sg.farcaster && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-4 font-mono text-sm text-primary"
            >
              @{sg.farcaster.username}
              {sg.basename ? ` · ${sg.basename.name}` : ""}
            </motion.p>
          )}

          {!hasFarcaster && sg.basename && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 font-mono text-sm text-gold"
            >
              {sg.basename.name}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className="mt-12 font-display text-[clamp(3rem,10vw,8rem)] font-medium leading-[0.92] tracking-[-0.045em]"
          >
            <span className="text-gradient">{o.handle}</span>
            <span className={`${accentText} font-serif italic`}>.{o.tld}</span>
          </motion.h1>

          {sg.farcaster?.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 max-w-2xl text-lg text-muted-foreground"
            >
              {sg.farcaster.bio}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground"
          >
            <a
              href={`${basescanUrl}/address/${o.owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-foreground transition hover:border-primary/40"
            >
              {ownerShort}
            </a>
            <span>minted {mintedLabel}</span>
            <span>·</span>
            <span>{o.chainLabel.toLowerCase()}</span>
            <span>·</span>
            <span className="text-primary">transferable</span>
            {o.isFounding && (
              <>
                <span>·</span>
                <span className="text-gold">founding member</span>
              </>
            )}
            {hasFarcaster && (
              <>
                <span>·</span>
                <span>{sg.followers.toLocaleString()} followers</span>
              </>
            )}
          </motion.div>

          <ProfileHoldings holdings={sg.holdings} />

          <ProfileActions
            warpcastUrl={sg.farcaster?.profileUrl ?? null}
            fullName={o.fullName}
          />
        </div>
      </section>

      <section className="relative px-4 pb-32">
        <motion.div
          className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong relative overflow-hidden rounded-3xl p-8 lg:col-span-2"
          >
            <motion.div
              className="pointer-events-none absolute -inset-px opacity-40"
              style={{ background: "var(--gradient-glow)" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.4 }}
              viewport={{ once: true }}
            />
            <motion.div className="relative flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                social reach
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.3em] ${sg.accent === "gold" ? "text-gold" : "text-primary"}`}
              >
                culture score
              </span>
            </motion.div>

            <div className="relative mt-6 flex items-end gap-4">
              <div className="font-display text-7xl font-medium leading-none tracking-tight text-gradient">
                {sg.cultureScore.toLocaleString()}
              </div>
              <div className="pb-3 font-mono text-xs text-muted-foreground">
                {hasFarcaster ? "from Farcaster + onchain" : "onchain only"}
              </div>
            </div>

            <motion.div className="relative mt-8">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>sources</span>
                <span>{sg.sources.join(" · ") || "none linked"}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${Math.min(100, Math.round(sg.cultureScore / 500))}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  className={`h-full rounded-full ${sg.accent === "gold" ? "bg-gold" : "bg-primary"}`}
                  style={{
                    boxShadow:
                      sg.accent === "gold"
                        ? "0 0 12px oklch(0.82 0.13 75 / 0.8)"
                        : "0 0 12px oklch(0.7 0.19 250 / 0.8)",
                  }}
                />
              </div>
            </motion.div>

            <motion.div className="relative mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
              <Stat
                label="Followers"
                value={hasFarcaster ? sg.followers.toLocaleString() : "—"}
              />
              <Stat
                label="Following"
                value={hasFarcaster ? sg.following.toLocaleString() : "—"}
              />
              <Stat label="Badges" value={sg.badges.length.toString()} />
            </motion.div>
          </motion.div>

          <IdentityNftCard identity={o} className="lg:col-span-1" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass relative overflow-hidden rounded-3xl p-8 lg:col-span-2"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              identity object
            </span>
            <dl className="mt-6 space-y-4 text-sm">
              <Row k="Token ID" v={o.tokenId.toString()} mono />
              <Row k="TLD" v={`.${o.tld}`} accent={sg.accent === "gold"} />
              <Row k="Standard" v="ERC-721 · transferable" />
              <Row k="Chain" v={o.chainLabel} />
              <Row k="Minted" v={mintedLabel} />
              <Row
                k="Owner"
                v={
                  <a
                    href={`${basescanUrl}/address/${o.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs hover:text-primary"
                  >
                    {ownerShort}
                  </a>
                }
              />
              <Row k="Founding" v={o.isFounding ? "Yes" : "No"} accent={o.isFounding} />
              <Row
                k="Secondary"
                v={
                  <a
                    href={openSeaAssetUrl(o.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    List on OpenSea →
                  </a>
                }
              />
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <motion.div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                earned badges
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {sg.badges.length} earned
              </span>
            </motion.div>
            {sg.badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Link Farcaster or mint with a Basename to unlock badges.
              </p>
            ) : (
            <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sg.badges.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group glass relative overflow-hidden rounded-2xl p-5 transition hover:bg-surface-elevated"
                >
                  <div className="flex items-start justify-between">
                    <motion.div
                      className={`grid h-10 w-10 place-items-center rounded-xl ${
                        b.tier === "gold" ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary"
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">{b.label.slice(0, 1)}</span>
                    </motion.div>
                    <span
                      className={`font-mono text-[9px] uppercase tracking-wider ${
                        b.tier === "gold" ? "text-gold" : "text-primary"
                      }`}
                    >
                      {b.tier === "gold" ? "rare" : "earned"}
                    </span>
                  </div>
                  <motion.div className="mt-5 font-display text-base font-medium">{b.label}</motion.div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <motion.div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                activity
              </span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>
            <motion.div className="glass rounded-3xl p-6">
              <ol className="relative space-y-6 border-l border-border pl-6">
                {sg.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span
                      className={`absolute -left-[29px] top-1.5 h-2 w-2 rounded-full ${
                        t.kind === "badge"
                          ? "bg-gold"
                          : t.kind === "mint"
                            ? "bg-primary"
                            : t.kind === "cast"
                              ? "bg-primary/70"
                              : "bg-muted-foreground"
                      }`}
                      style={{
                        boxShadow:
                          t.kind === "badge"
                            ? "0 0 8px oklch(0.82 0.13 75 / 0.8)"
                            : t.kind === "mint" || t.kind === "cast"
                              ? "0 0 8px oklch(0.7 0.19 250 / 0.8)"
                              : undefined,
                      }}
                    />
                    {t.href ? (
                      <a
                        href={t.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display text-sm font-medium hover:text-primary"
                      >
                        {t.title}
                      </a>
                    ) : (
                      <motion.div className="font-display text-sm font-medium">{t.title}</motion.div>
                    )}
                    <motion.div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {t.meta} · {t.days}d ago
                    </motion.div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Farcaster channels
              </span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>
            {sg.communities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {hasFarcaster
                  ? "No public channels surfaced yet."
                  : "Link Farcaster to show channel memberships."}
              </p>
            ) : (
              <div className="space-y-3">
                {sg.communities.map((c) => (
                  <div
                    key={c.name}
                    className="glass flex items-center justify-between rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-display text-sm font-medium">{c.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.members.toLocaleString()} members
                      </div>
                    </div>
                    <span className="rounded-full border border-border-strong bg-surface-elevated/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-gold">
                      {c.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong relative overflow-hidden rounded-3xl p-8 text-center lg:col-span-3"
          >
            <motion.div className="hero-bg absolute inset-0" />
            <motion.div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                claim your own
              </p>
              <h3 className="mt-4 font-display text-3xl font-medium tracking-tight text-gradient sm:text-5xl">
                Your name. <span className="font-serif italic text-gradient-gold">Your culture.</span>
              </h3>
              <Link
                to="/"
                hash="claim"
                className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 font-display text-sm font-semibold text-background transition hover:scale-[1.03]"
              >
                Mint your identity →
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-xl font-medium">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  mono,
  accent,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd
        className={`text-right ${mono ? "font-mono text-xs" : ""} ${
          accent ? "text-gold" : "text-foreground"
        }`}
      >
        {v}
      </dd>
    </div>
  );
}