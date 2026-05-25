"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SiweSignInButton } from "@/components/SiweSignInButton";

type Profile = {
  visibility: "private" | "public";
  display_name: string | null;
  bio: string | null;
  show_holdings: boolean;
  twitter: string | null;
  discord: string | null;
  farcaster: string | null;
  linkedin: string | null;
  telegram: string | null;
  website: string | null;
  public_slug: string | null;
  extra_wallets: { address: string; label: string }[];
};

type TaskStatus = {
  day: string;
  dailyCheckedIn: boolean;
  points: number;
  level: number;
  badges: string[];
  profileComplete: boolean;
  taskCounts: Record<string, number>;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [extraWalletsText, setExtraWalletsText] = useState("[]");
  const [dbError, setDbError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [tasks, setTasks] = useState<TaskStatus | null>(null);
  const [taskErr, setTaskErr] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setTaskErr(null);
    const res = await fetch("/api/tasks/status", { credentials: "include" });
    if (!res.ok) {
      if (res.status === 401) {
        setTasks(null);
        return;
      }
      const j = (await res.json()) as { error?: string };
      setTaskErr(j.error ?? "tasks_unavailable");
      return;
    }
    setTasks((await res.json()) as TaskStatus);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/profile/me", { credentials: "include" });
    const data = (await res.json()) as {
      address?: string;
      referralLink?: string;
      profile?: Profile & { extra_wallets?: unknown };
      error?: string;
    };
    if (res.status === 401) {
      setAddress(null);
      setProfile(null);
      setDbError(null);
      setTasks(null);
      setLoading(false);
      return;
    }
    if (res.status === 503) {
      setDbError(data.error ?? "database_unconfigured");
      setAddress(data.address ?? null);
      setLoading(false);
      return;
    }
    setDbError(null);
    setAddress(data.address ?? null);
    setReferralLink(data.referralLink ?? null);
    const p = data.profile;
    if (p) {
      let ew: { address: string; label: string }[] = [];
      const raw = p.extra_wallets;
      if (Array.isArray(raw)) ew = raw as { address: string; label: string }[];
      else if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) ew = parsed as { address: string; label: string }[];
        } catch {
          ew = [];
        }
      }
      const next: Profile = {
        visibility: p.visibility ?? "private",
        display_name: p.display_name ?? null,
        bio: p.bio ?? null,
        show_holdings: Boolean(p.show_holdings),
        twitter: p.twitter ?? null,
        discord: p.discord ?? null,
        farcaster: p.farcaster ?? null,
        linkedin: p.linkedin ?? null,
        telegram: p.telegram ?? null,
        website: p.website ?? null,
        public_slug: p.public_slug ?? null,
        extra_wallets: ew,
      };
      setProfile(next);
      setExtraWalletsText(JSON.stringify(next.extra_wallets, null, 2));
    } else {
      setProfile(null);
    }
    setLoading(false);
    void refreshTasks();
  }, [refreshTasks]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    let extra_wallets = profile.extra_wallets;
    try {
      const parsed = JSON.parse(extraWalletsText) as unknown;
      if (!Array.isArray(parsed)) {
        alert("Extra wallets must be a JSON array.");
        return;
      }
      extra_wallets = parsed.map((x) =>
        x && typeof x === "object" && "address" in x
          ? {
              address: String((x as { address: string }).address),
              label: "label" in x ? String((x as { label: string }).label) : "",
            }
          : { address: "", label: "" },
      );
    } catch {
      alert("Invalid JSON for extra wallets.");
      return;
    }
    const res = await fetch("/api/profile/me", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, extra_wallets }),
    });
    if (res.ok) {
      setSaved(true);
      await load();
      const complete =
        Boolean(profile.display_name?.trim()) ||
        Boolean(profile.bio?.trim()) ||
        Boolean(
          (
            profile.twitter ??
            profile.discord ??
            profile.farcaster ??
            profile.linkedin ??
            profile.telegram ??
            profile.website ??
            ""
          ).trim(),
        );
      if (complete) {
        await fetch("/api/tasks/claim", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: "profile_completed" }),
        });
        void refreshTasks();
      }
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await load();
  }

  if (loading) {
    return <p className="py-12 text-zinc-500">Loading profile…</p>;
  }

  if (dbError === "database_unconfigured") {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-sm text-zinc-400">
          Set <code className="text-zinc-300">DATABASE_URL</code> and run <code className="text-zinc-300">web/sql/</code>{" "}
          migrations to enable saved profiles.
        </p>
        <Link href="/community" className="text-brand hover:underline">
          ← Community
        </Link>
      </div>
    );
  }

  if (!address || !profile) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-sm text-zinc-400">Connect your wallet and sign in to edit your community profile.</p>
        <SiweSignInButton onSuccess={() => void load()} />
        <Link href="/community" className="block text-sm text-brand hover:underline">
          ← Community
        </Link>
      </div>
    );
  }

  const publicPath =
    profile.visibility === "public"
      ? profile.public_slug
        ? `/u/${profile.public_slug}`
        : `/u/${address}`
      : null;

  return (
    <div className="mx-auto max-w-[1280px] pb-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Identity, privacy, and community tasks. Default is private — no real name or investment amount required.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={(e) => void save(e)} className="glass-card space-y-4 p-6">
          <label className="block text-sm">
            <span className="text-zinc-500">Visibility</span>
            <select
              value={profile.visibility}
              onChange={(e) =>
                setProfile({ ...profile, visibility: e.target.value as "private" | "public" })
              }
              className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="private">Private (only you)</option>
              <option value="public">Public profile page</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-zinc-500">Display name (optional)</span>
            <input
              value={profile.display_name ?? ""}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value || null })}
              className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="Pseudonym"
            />
          </label>

          <label className="block text-sm">
            <span className="text-zinc-500">Bio</span>
            <textarea
              value={profile.bio ?? ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value || null })}
              rows={3}
              className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={profile.show_holdings}
              onChange={(e) => setProfile({ ...profile, show_holdings: e.target.checked })}
            />
            Show estimated holdings on public profile (reference USD from on-chain balances)
          </label>

          {profile.visibility === "public" && (
            <label className="block text-sm">
              <span className="text-zinc-500">Public URL slug (optional)</span>
              <input
                value={profile.public_slug ?? ""}
                onChange={(e) => setProfile({ ...profile, public_slug: e.target.value || null })}
                className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
                placeholder="my-alias"
              />
              <span className="mt-1 block text-[10px] text-zinc-600">3–32 chars, lowercase letters, numbers, hyphens.</span>
            </label>
          )}

          {(["twitter", "discord", "farcaster", "linkedin", "telegram", "website"] as const).map((k) => (
            <label key={k} className="block text-sm">
              <span className="text-zinc-500 capitalize">{k === "linkedin" ? "LinkedIn" : k}</span>
              <input
                value={profile[k] ?? ""}
                onChange={(e) => setProfile({ ...profile, [k]: e.target.value || null })}
                className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                placeholder={k === "website" ? "https://…" : "@handle or URL"}
              />
            </label>
          ))}

          <label className="block text-sm">
            <span className="text-zinc-500">Extra wallets (JSON array, public only)</span>
            <textarea
              value={extraWalletsText}
              onChange={(e) => setExtraWalletsText(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs text-white"
              placeholder='[{"address":"0x…","label":"cold"}]'
            />
            <span className="mt-1 block text-[10px] text-zinc-600">Edit as JSON, then Save.</span>
          </label>

          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-gold-700 to-gold-600 px-5 py-2 text-sm font-semibold text-black hover:opacity-95"
          >
            Save
          </button>
          {saved && <span className="text-sm text-emerald-400">Saved.</span>}
        </form>

        <aside className="space-y-4">
          <div className="glass-card space-y-3 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Tasks &amp; streak</p>
            {taskErr && <p className="text-xs text-amber-400/90">{taskErr}</p>}
            {tasks ? (
              <>
                <p className="text-sm text-zinc-300">
                  Today ({tasks.day}):{" "}
                  <span className={tasks.dailyCheckedIn ? "text-emerald-400" : "text-zinc-500"}>
                    {tasks.dailyCheckedIn ? "Check-in done" : "Check-in pending"}
                  </span>
                </p>
                <p className="text-sm text-zinc-400">
                  Points <span className="font-mono text-white">{tasks.points}</span> · Level{" "}
                  <span className="font-mono text-white">{tasks.level}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Profile fields for task:{" "}
                  {tasks.profileComplete ? (
                    <span className="text-emerald-400/90">complete</span>
                  ) : (
                    <span className="text-zinc-500">add name, bio, or a social</span>
                  )}
                </p>
                {tasks.badges.length > 0 && (
                  <p className="text-xs text-zinc-500">
                    Badges:{" "}
                    <span className="text-zinc-300">{tasks.badges.join(", ")}</span>
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-zinc-500">Sign in to track tasks.</p>
            )}
          </div>

          {publicPath && (
            <div className="glass-card p-5 text-sm text-zinc-400">
              Public link:{" "}
              <Link href={publicPath} className="font-mono text-brand hover:underline">
                {typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath}
              </Link>
            </div>
          )}

          {referralLink && (
            <div className="glass-card p-5 text-xs text-zinc-500">
              Referral: <span className="break-all text-zinc-400">{referralLink}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => void logout()}
            className="text-xs text-zinc-500 underline hover:text-zinc-300"
          >
            Sign out (clear session)
          </button>

          <Link href="/community" className="block text-sm text-brand hover:underline">
            ← Community
          </Link>
        </aside>
      </div>
    </div>
  );
}
