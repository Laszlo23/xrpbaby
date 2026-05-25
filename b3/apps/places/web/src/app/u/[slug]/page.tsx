"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type PublicProfile = {
  visibility?: string;
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
  extra_wallets: unknown;
  primary_wallet?: string | null;
};

export default function PublicProfilePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? "";
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    void fetch(`/api/profile/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          setProfile(null);
          setLoading(false);
          return;
        }
        const d = (await r.json()) as { profile?: PublicProfile; error?: string };
        if (d?.profile) setProfile(d.profile);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <p className="py-12 text-center text-zinc-500">Loading…</p>;
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-zinc-400">This profile is not public or does not exist.</p>
        <Link href="/community" className="mt-4 inline-block text-brand hover:underline">
          Community
        </Link>
      </div>
    );
  }

  const extra =
    Array.isArray(profile.extra_wallets) && profile.extra_wallets.length > 0
      ? (profile.extra_wallets as { address: string; label?: string }[])
      : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Public profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {profile.display_name ?? `${profile.primary_wallet?.slice(0, 6)}…${profile.primary_wallet?.slice(-4)}`}
        </h1>
        {profile.bio && <p className="mt-3 text-sm leading-relaxed text-zinc-400">{profile.bio}</p>}
      </header>

      <div className="glass-card space-y-3 p-6">
        <h2 className="text-sm font-medium text-zinc-300">Wallets</h2>
        {profile.primary_wallet && (
          <p className="font-mono text-xs text-zinc-400">
            Primary: <span className="text-zinc-200">{profile.primary_wallet}</span>
          </p>
        )}
        {extra.map((w) => (
          <p key={w.address} className="font-mono text-xs text-zinc-400">
            {w.label ? `${w.label}: ` : ""}
            <span className="text-zinc-200">{w.address}</span>
          </p>
        ))}
        {profile.show_holdings && (
          <p className="text-xs text-zinc-500">
            Holder has indicated they are comfortable showing wallet addresses. Estimates are illustrative — see issuer terms.{" "}
            <Link href="/portfolio" className="text-brand hover:underline">
              Your portfolio
            </Link>{" "}
            uses the same demo math.
          </p>
        )}
      </div>

      <div className="glass-card space-y-2 p-6">
        <h2 className="text-sm font-medium text-zinc-300">Social</h2>
        <ul className="space-y-1 text-sm text-zinc-400">
          {profile.twitter && (
            <li>
              X / Twitter: <span className="text-zinc-200">{profile.twitter}</span>
            </li>
          )}
          {profile.discord && (
            <li>
              Discord: <span className="text-zinc-200">{profile.discord}</span>
            </li>
          )}
          {profile.farcaster && (
            <li>
              Farcaster: <span className="text-zinc-200">{profile.farcaster}</span>
            </li>
          )}
          {profile.linkedin && (
            <li>
              LinkedIn: <span className="text-zinc-200">{profile.linkedin}</span>
            </li>
          )}
          {profile.telegram && (
            <li>
              Telegram: <span className="text-zinc-200">{profile.telegram}</span>
            </li>
          )}
          {profile.website && (
            <li>
              Web:{" "}
              <a href={profile.website} className="text-brand hover:underline" target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            </li>
          )}
          {!profile.twitter &&
            !profile.discord &&
            !profile.farcaster &&
            !profile.linkedin &&
            !profile.telegram &&
            !profile.website && <li className="text-zinc-600">No links listed.</li>}
        </ul>
      </div>

      <Link href="/community" className="text-sm text-brand hover:underline">
        ← Community
      </Link>
    </div>
  );
}
