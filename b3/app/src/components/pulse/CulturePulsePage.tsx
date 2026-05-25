import { Link } from "@tanstack/react-router";
import { useAccount, useSignMessage } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Radio } from "lucide-react";

import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { WalletControls } from "@/components/WalletControls";
import { SiteFooter } from "@/components/SiteFooter";

type Metrics = {
  streams: Record<string, boolean>;
  snapshot: {
    memberCount: number;
    waitlistCount: number;
    culturePoints: number;
    activity24h: number;
    farcasterItems: number;
    xItems: number;
    facebookItems: number;
    tiktokItems: number;
    instagramItems: number;
    nativeComments: number;
    digest: string;
    capturedAt: string;
    live?: boolean;
  } | null;
};

type FeedItem = {
  id: string;
  platform: string;
  authorHandle?: string | null;
  authorName?: string | null;
  content: string;
  permalink?: string | null;
  metrics?: Record<string, number> | null;
  publishedAt: string;
};

type Attestation = {
  dayId: string;
  digest: string;
  explorerUrl: string;
  txHash: string;
};

const PLATFORM_LABEL: Record<string, string> = {
  farcaster: "Farcaster",
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  native: "Community",
};

const WEB3 = new Set(["farcaster", "native"]);

export function CulturePulsePage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<"all" | "web3" | "web2" | "native">("all");
  const [attestation, setAttestation] = useState<Attestation | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState("");

  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const load = useCallback(async () => {
    const [mRes, fRes, aRes] = await Promise.all([
      fetch("/api/pulse/metrics"),
      fetch("/api/pulse/feed?limit=30"),
      fetch("/api/pulse/attestation/latest"),
    ]);
    const m = (await mRes.json()) as Metrics & { ok?: boolean };
    const f = (await fRes.json()) as { ok?: boolean; items?: FeedItem[] };
    const a = (await aRes.json()) as { ok?: boolean; attestation?: Attestation | null };
    if (m.ok) setMetrics(m);
    if (f.ok && f.items) setItems(f.items);
    if (a.ok && a.attestation) setAttestation(a.attestation);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = items.filter((i) => {
    if (filter === "all") return true;
    if (filter === "native") return i.platform === "native";
    if (filter === "web3") return WEB3.has(i.platform);
    return !WEB3.has(i.platform);
  });

  const postComment = async (feedItemId: string) => {
    if (!address || !chainId || !commentDraft.trim()) return;
    setCommentBusy(true);
    setCommentError("");
    try {
      const { prepared } = await buildPlatformSiweMessage(
        address,
        chainId,
        "Comment on Culture Pulse.",
      );
      const signature = await signMessageAsync({ message: prepared });
      const res = await fetch(`/api/pulse/feed/${feedItemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          message: prepared,
          signature,
          body: commentDraft.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setCommentError(data.error ?? "Could not post comment");
        return;
      }
      setCommentDraft("");
      setExpandedId(null);
    } catch {
      setCommentError("Sign-in cancelled or failed");
    } finally {
      setCommentBusy(false);
    }
  };

  const streamBadge = (key: string, label: string) => {
    const on = metrics?.streams[key];
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
          on ? "bg-[#C5FF41]/20 text-[#C5FF41]" : "bg-white/10 text-zinc-500"
        }`}
      >
        {label} {on ? "live" : "paused"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <Link to="/forest" className="text-sm text-zinc-400 hover:text-white">
          ← Forest
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <Radio className="h-8 w-8 text-[#C5FF41]" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C5FF41]">Transparency</p>
            <h1 className="font-display text-3xl font-bold">Culture Pulse</h1>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          One public view of forest growth, Web2 and Web3 social streams, and community
          conversation — anchored on Base daily.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {metrics?.snapshot ? (
          <>
          {metrics.snapshot.live ? (
            <p className="mb-3 text-xs text-zinc-500">
              Live counts (run <code className="rounded bg-white/10 px-1">npm run pulse:ingest</code> to
              snapshot)
            </p>
          ) : null}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Members", value: metrics.snapshot.memberCount },
              { label: "Waitlist", value: metrics.snapshot.waitlistCount },
              { label: "Culture Points", value: metrics.snapshot.culturePoints },
              { label: "24h activity", value: metrics.snapshot.activity24h },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center"
              >
                <p className="text-2xl font-bold text-[#C5FF41]">{s.value}</p>
                <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </section>
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            Run <code className="rounded bg-white/10 px-1">npm run pulse:ingest</code> to capture
            metrics.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {streamBadge("farcaster", "Farcaster")}
          {streamBadge("x", "X")}
          {streamBadge("facebook", "Facebook")}
          {streamBadge("tiktok", "TikTok")}
          {streamBadge("instagram", "Instagram")}
        </div>

        {attestation ? (
          <div className="mt-6 rounded-xl border border-[#C5FF41]/30 bg-[#C5FF41]/5 p-4 text-sm">
            <p className="font-medium text-[#C5FF41]">On-chain proof · {attestation.dayId}</p>
            <p className="mt-2 break-all font-mono text-xs text-zinc-400">{attestation.digest}</p>
            <a
              href={attestation.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[#C5FF41] underline"
            >
              View attestation <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : null}

        <div className="mt-8 flex gap-2">
          {(["all", "web3", "web2", "native"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs capitalize ${
                filter === f
                  ? "bg-[#C5FF41] text-black"
                  : "border border-white/15 text-zinc-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <li className="rounded-xl border border-white/10 p-6 text-center text-sm text-zinc-500">
              No posts yet. Enable streams in .env and run ingest, or add a manual post via admin
              API.
            </li>
          ) : (
            filtered.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-zinc-500">
                    {PLATFORM_LABEL[item.platform] ?? item.platform}
                  </span>
                  {item.permalink ? (
                    <a
                      href={item.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#C5FF41] hover:underline"
                    >
                      Source
                    </a>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-zinc-300">{item.content}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  {item.authorName ?? item.authorHandle ?? "Building Culture"} ·{" "}
                  {new Date(item.publishedAt).toLocaleString()}
                </p>
                {item.metrics ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    {Object.entries(item.metrics)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                  className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Comment on BC
                </button>
                {expandedId === item.id ? (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    {!isConnected ? (
                      <WalletControls className="mx-auto" />
                    ) : (
                      <>
                        <textarea
                          value={commentDraft}
                          onChange={(e) => setCommentDraft(e.target.value)}
                          placeholder="Your take — visible on Building Culture"
                          className="w-full rounded-lg border border-white/15 bg-black/40 p-3 text-sm"
                          rows={3}
                        />
                        {commentError ? (
                          <p className="mt-2 text-xs text-red-400">{commentError}</p>
                        ) : null}
                        <button
                          type="button"
                          disabled={commentBusy}
                          onClick={() => void postComment(item.id)}
                          className="mt-2 rounded-full bg-[#C5FF41] px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
                        >
                          {commentBusy ? "Signing…" : "Post with wallet"}
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
