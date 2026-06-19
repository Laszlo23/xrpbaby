import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/bcid/")({
  head: () =>
    pageHead({
      title: "BCID — Building Culture Identity",
      description:
        "Portable builder identity with verifiable credentials. Prove work, not followers. Privacy-first reputation.",
      path: "/bcid",
      keywords: [
        "BCID",
        "Building Culture ID",
        "Web3 identity",
        "builder credentials",
        "reputation",
      ],
    }),
  component: BcidLandingPage,
});

function BcidLandingPage() {
  return (
    <main className="bcid-landing mx-auto max-w-3xl px-4 py-16">
      <p className="mb-2 text-sm uppercase tracking-widest text-[#C5FF41]">Building Culture ID</p>
      <h1 className="mb-4 text-4xl font-bold text-white">Your portable builder identity</h1>
      <p className="mb-8 text-lg text-zinc-300">
        BCID is a soulbound identity with verifiable credentials and reputation scores that reward
        shipped work — not follower counts.
      </p>

      <ul className="mb-10 space-y-3 text-zinc-300">
        <li>✓ Builder, Trust, Contribution, and Verification scores</li>
        <li>
          ✓ Bridge your existing <code className="text-[#C5FF41]">.culture</code> name
        </li>
        <li>✓ Privacy-first credentials with selective disclosure</li>
        <li>✓ Agent-ready identity for the AI economy</li>
      </ul>

      <div className="flex flex-wrap gap-4">
        <Link
          to="/bcid/mint"
          className="rounded-full bg-[#C5FF41] px-6 py-3 font-semibold text-black hover:opacity-90"
        >
          Mint Human BCID
        </Link>
        <Link
          to="/docs/bcid"
          className="rounded-full border border-zinc-600 px-6 py-3 text-white hover:border-[#C5FF41]"
        >
          Protocol docs
        </Link>
        <Link
          to="/bcid/leaderboard"
          className="rounded-full border border-zinc-600 px-6 py-3 text-white hover:border-[#C5FF41]"
        >
          Leaderboard
        </Link>
        <a
          href="/api/bcid/farcaster/frame"
          className="rounded-full border border-zinc-600 px-6 py-3 text-white hover:border-[#C5FF41]"
        >
          Farcaster Frame
        </a>
        <Link
          to="/pass"
          className="rounded-full border border-zinc-600 px-6 py-3 text-zinc-300 hover:text-white"
        >
          Culture ID (.culture)
        </Link>
      </div>

      <section className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="mb-4 text-xl font-semibold text-white">On the waitlist?</h2>
        <p className="text-zinc-400">
          Convert your waitlist spot to a BCID mint invite via{" "}
          <code className="text-sm">POST /api/bcid/waitlist/convert</code> with your email.
        </p>
      </section>
    </main>
  );
}
