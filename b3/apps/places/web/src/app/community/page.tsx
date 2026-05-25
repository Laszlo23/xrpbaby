"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { CommunityRefCapture, consumePendingRef } from "@/components/CommunityRefCapture";
import { SiweSignInButton } from "@/components/SiweSignInButton";

type Post = { id: number; title: string; body: string; published_at: string };

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl py-12 text-zinc-500">Loading…</div>}>
      <CommunityPageInner />
    </Suspense>
  );
}

type TaskStatus = {
  day: string;
  dailyCheckedIn: boolean;
  points: number;
  level: number;
  badges: string[];
};

function CommunityPageInner() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<{
    address?: string;
    referralLink?: string;
    profile?: unknown;
    error?: string;
  } | null>(null);
  const [sharePid, setSharePid] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskStatus | null>(null);

  const refreshMe = useCallback(async () => {
    const res = await fetch("/api/profile/me", { credentials: "include" });
    const data = (await res.json()) as {
      address?: string;
      referralLink?: string;
      profile?: unknown;
      error?: string;
    };
    if (res.status === 401) {
      setMe({ error: "signed_out" });
      return;
    }
    if (res.status === 503) {
      setMe({ error: data.error ?? "database_unconfigured" });
      return;
    }
    setMe(data);
  }, []);

  useEffect(() => {
    void fetch("/api/community/posts")
      .then((r) => r.json())
      .then((d: { posts?: Post[] }) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const hasServerSession =
    Boolean(me?.address) && me?.error !== "signed_out" && me?.error !== "database_unconfigured";

  useEffect(() => {
    if (!hasServerSession) {
      setTasks(null);
      return;
    }
    void fetch("/api/tasks/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: TaskStatus | null) => setTasks(d))
      .catch(() => setTasks(null));
  }, [hasServerSession, me?.address]);

  useEffect(() => {
    async function daily() {
      const res = await fetch("/api/tasks/claim", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: "daily_login" }),
      });
      if (res.ok) {
        const j = (await res.json()) as { claimed?: boolean };
        if (j.claimed) setMsg("Daily check-in recorded.");
        void fetch("/api/tasks/status", { credentials: "include" })
          .then((r) => (r.ok ? r.json() : null))
          .then((d: TaskStatus | null) => setTasks(d))
          .catch(() => {});
      }
    }
    if (hasServerSession) void daily();
  }, [hasServerSession]);

  async function afterSignIn() {
    const ref = consumePendingRef();
    if (ref) {
      await fetch("/api/referral/attach", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refCode: ref }),
      });
      setMsg("Referral linked (if valid).");
    }
    await refreshMe();
  }

  async function claimShare() {
    setMsg(null);
    const res = await fetch("/api/tasks/claim", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: "share_property", metadata: { propertyId: sharePid.trim() } }),
    });
    const j = (await res.json()) as { claimed?: boolean; error?: string };
    if (res.ok && j.claimed) setMsg("Share task completed for today.");
    else if (res.ok && !j.claimed) setMsg("Already claimed this task today.");
    else setMsg(j.error ?? "Could not claim.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <CommunityRefCapture />

      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Community</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Investor loop</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Stay informed, complete light tasks, and share your referral link. Profiles and tasks are optional and
          off-chain — require a database and{" "}
          <span className="font-mono text-zinc-300">SESSION_SECRET</span> for sign-in. Separate from on-chain offerings.
        </p>
      </header>

      {me?.error === "database_unconfigured" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
          Community features need <code className="text-zinc-300">DATABASE_URL</code> and applied SQL from{" "}
          <code className="text-zinc-300">web/sql/</code>. You can still browse listings and share properties.
        </div>
      )}

      <section className="glass-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Sign in</h2>
        <p className="text-sm text-zinc-400">
          Connect your wallet, then sign a one-time message. We set an HttpOnly session cookie (no on-chain tx).
        </p>
        <SiweSignInButton onSuccess={() => void afterSignIn()} />
        {hasServerSession && me?.address && (
          <p className="font-mono text-xs text-zinc-500">
            Session: {me.address.slice(0, 8)}…{me.address.slice(-6)}
          </p>
        )}
      </section>

      <section className="glass-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Platform updates</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">No posts yet. Insert rows into `platform_posts` or check back later.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.id} className="border-b border-white/5 pb-4 last:border-0">
                <p className="text-sm font-medium text-white">{p.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">{p.body}</p>
                <p className="mt-2 text-[10px] text-zinc-600">{new Date(p.published_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Tasks</h2>
        {tasks && hasServerSession && (
          <p className="text-sm text-zinc-400">
            Today ({tasks.day}):{" "}
            <span className={tasks.dailyCheckedIn ? "text-emerald-400/90" : "text-zinc-500"}>
              {tasks.dailyCheckedIn ? "Check-in done" : "Check-in pending"}
            </span>
            {" · "}
            Points <span className="font-mono text-zinc-200">{tasks.points}</span> · Level{" "}
            <span className="font-mono text-zinc-200">{tasks.level}</span>
            {tasks.badges.length > 0 && (
              <>
                {" · "}
                <span className="text-zinc-500">badges: {tasks.badges.join(", ")}</span>
              </>
            )}
          </p>
        )}
        <ul className="list-inside list-disc space-y-2 text-sm text-zinc-400">
          <li>
            Daily check-in runs once per visit when you have a valid HttpOnly session (requires{" "}
            <span className="font-mono text-zinc-300">DATABASE_URL</span> +{" "}
            <span className="font-mono text-zinc-300">SESSION_SECRET</span>).
          </li>
          <li>
            Share a property from{" "}
            <Link href="/properties" className="text-brand hover:underline">
              Properties
            </Link>
            , then enter its numeric id below to claim the share task.
          </li>
          <li>
            Send product feedback from{" "}
            <Link href="/feedback" className="text-brand hover:underline">
              Feedback
            </Link>{" "}
            (optional points task when signed in).
          </li>
        </ul>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Property id</span>
            <input
              value={sharePid}
              onChange={(e) => setSharePid(e.target.value)}
              className="mt-1 block w-32 rounded border border-white/10 bg-zinc-950 px-2 py-1.5 font-mono text-sm text-white"
              placeholder="1"
            />
          </label>
          <button
            type="button"
            onClick={() => void claimShare()}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-zinc-200 hover:border-gold-500/40"
          >
            Claim share task
          </button>
        </div>
        {msg && <p className="text-sm text-emerald-400/90">{msg}</p>}
      </section>

      <section className="glass-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Referral link</h2>
        {me?.referralLink ? (
          <>
            <p className="break-all font-mono text-xs text-zinc-300">{me.referralLink}</p>
            <button
              type="button"
              className="text-xs text-brand hover:underline"
              onClick={() => void navigator.clipboard.writeText(me.referralLink!)}
            >
              Copy link
            </button>
          </>
        ) : (
          <p className="text-sm text-zinc-500">Sign in with a configured database to generate your referral link.</p>
        )}
        <p className="text-xs text-zinc-600">
          Append <span className="font-mono">?ref=yourcode</span> to any URL; we store it until you sign in.
        </p>
      </section>

      <section className="glass-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Your profile</h2>
        <p className="text-sm text-zinc-400">
          Set visibility, socials, and optional public slug.{" "}
          <Link href="/profile" className="text-brand hover:underline">
            Open profile editor →
          </Link>
        </p>
      </section>
    </div>
  );
}
