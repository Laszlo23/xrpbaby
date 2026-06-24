import { createFileRoute, Link } from "@tanstack/react-router";

import { CultureGrovePanel } from "@/components/culture-grove/CultureGrovePanel";
import { LandingNav } from "@/components/landing/LandingNav";
import { useShowLoggedInShell } from "@/hooks/useShowLoggedInShell";
import { useWalletSession } from "@/hooks/useWalletSession";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/forest/grove")({
  component: CultureGrovePage,
  head: () =>
    pageHead({
      title: "Culture Grow DNA — Your Grove",
      description:
        "Plant your grove, invite two friends, and watch your Culture DNA connection tree grow.",
      path: "/forest/grove",
    }),
});

function CultureGrovePage() {
  const { address, wasConnected } = useWalletSession();
  const showLoggedInShell = useShowLoggedInShell();

  return (
    <div className="bc-surface min-h-screen pb-nav-safe">
      {!showLoggedInShell ? <LandingNav compact /> : null}
      <main className={`mx-auto max-w-3xl px-5 pb-16 sm:px-8 ${showLoggedInShell ? "pt-4" : "pt-28"}`}>
        <Link to="/forest" className="text-sm text-zinc-500 hover:text-white">
          ← Forest hub
        </Link>
        {wasConnected && address ? (
          <div className="mt-6">
            <CultureGrovePanel address={address} />
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 bg-black/40 p-8 text-center">
            <p className="font-display text-2xl font-bold text-white">Plant your grove</p>
            <p className="mt-3 text-sm text-zinc-400">
              Connect your wallet to see your Culture DNA tree and invite two friends for Twin Bloom
              rewards.
            </p>
            <Link
              to="/join"
              className="mt-6 inline-flex rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
            >
              Join free
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
