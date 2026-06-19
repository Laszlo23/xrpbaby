import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { Search } from "lucide-react";
import { useState } from "react";

import { ConnectIdentityGraph } from "@/components/connect/ConnectIdentityGraph";
import { BuilderTapesPromo } from "@/components/stories/BuilderTapesHub";
import { CultureGrovePanel } from "@/components/culture-grove/CultureGrovePanel";
import { useWalletCultureIdentity } from "@/hooks/useWalletCultureIdentity";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

const FEATURED_PROFILES = [
  { name: "laszlo.culture", label: "Founder showcase" },
  { name: "buildingculture.culture", label: "Official" },
];

export const Route = createFileRoute("/connect/")({
  component: ConnectPage,
  head: () =>
    pageHead({
      title: "Connect with builders",
      description: `Discover Culture IDs, explore connections, and grow together on ${BRAND_DISPLAY_NAME}.`,
      path: "/connect",
    }),
});

function ConnectPage() {
  const { address, isConnected } = useAccount();
  const { primaryName } = useWalletCultureIdentity();
  const [query, setQuery] = useState("");

  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/\.culture$/i, "");
  const searchTarget =
    normalized.length >= 2
      ? normalized.includes(".")
        ? normalized
        : `${normalized}.culture`
      : null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00E5FF]">Connect</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
        People, stories, and culture together
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-zinc-400">
        Browse Culture ID profiles, see linked identities, and find quests to build your brand
        voice.
      </p>

      <div className="relative mt-8">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search handle.culture"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 font-display text-lg text-white outline-none placeholder:text-zinc-600 focus:border-[#00E5FF]/40"
        />
      </div>

      {searchTarget ? (
        <Link
          to="/id/$name"
          params={{ name: searchTarget }}
          className="mt-4 block rounded-2xl border border-[#C5FF41]/30 bg-[#C5FF41]/10 px-5 py-4 text-sm font-medium text-[#C5FF41] hover:bg-[#C5FF41]/15"
        >
          View profile → {searchTarget}
        </Link>
      ) : null}

      <section className="mt-10">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Featured profiles
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {FEATURED_PROFILES.map((p) => (
            <li key={p.name}>
              <Link
                to="/id/$name"
                params={{ name: p.name }}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
              >
                <p className="font-display text-lg font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{p.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Founder stories
        </h2>
        <div className="mt-4">
          <BuilderTapesPromo />
        </div>
      </section>

      {isConnected && address ? (
        <>
          <section className="mt-10">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Your connections
            </h2>
            <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
              <ConnectIdentityGraph address={address} cultureName={primaryName} />
            </div>
          </section>
          <section className="mt-10">
            <CultureGrovePanel address={address} compact />
          </section>
        </>
      ) : (
        <p className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-zinc-400">
          <Link to="/join" className="text-[#C5FF41] underline">
            Connect your wallet
          </Link>{" "}
          to see your identity graph and grove tree.
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/forest/quests"
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:border-[#C5FF41]/40"
        >
          Story quests
        </Link>
        <Link
          to="/leaderboard"
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:border-[#00E5FF]/40"
        >
          Leaderboard
        </Link>
        <Link
          to="/brand-quests/create"
          className="rounded-full border border-[var(--vault-gold)]/40 px-5 py-2.5 text-sm text-[var(--vault-gold)] hover:border-[var(--vault-gold)]"
        >
          Brand story quests (7M+ BCC)
        </Link>
      </div>
    </div>
  );
}
