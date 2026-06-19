import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Sparkles, Users } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/welcome/")({
  component: WelcomePage,
  head: () =>
    pageHead({
      title: "Welcome",
      description: `New to ${BRAND_DISPLAY_NAME}? Three steps — join, play, and claim your place in the culture.`,
      path: "/welcome",
      keywords: ["Build Culture", "welcome", "onboarding", "join", "play"],
    }),
});

const STEPS = [
  {
    icon: Users,
    title: "Create your pass",
    body: "Connect wallet + one sign-in. Earn welcome Culture Points and land in your community hub.",
    to: "/join" as const,
    cta: "Join free",
  },
  {
    icon: Sparkles,
    title: "Enter Play",
    body: "Fair drops and raffle tickets for real culture — the fastest way to feel the loop.",
    to: "/play" as const,
    cta: "Open Play",
  },
  {
    icon: Compass,
    title: "Claim identity (optional)",
    body: "Mint a .culture name on Base (~$1.11) — your onchain handle across the ecosystem.",
    to: "/pass" as const,
    cta: "Culture pass",
  },
];

function WelcomePage() {
  return (
    <div className="bc-surface min-h-screen">
      <LandingNav compact />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
        <p className="mono-label">WELCOME</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Start with {BRAND_DISPLAY_NAME}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
          One mission — bring places back to life. This short path gets you oriented before the full
          ecosystem grid.
        </p>

        <ol className="mt-12 space-y-4">
          {STEPS.map((step, idx) => (
            <li
              key={step.to}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C5FF41]/15 font-mono text-sm text-[#C5FF41]">
                  {idx + 1}
                </span>
                <div>
                  <step.icon className="mb-2 h-5 w-5 text-[#00E5FF]" aria-hidden />
                  <p className="font-heading text-lg font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{step.body}</p>
                </div>
              </div>
              <Link
                to={step.to}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
              >
                {step.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/forest"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:border-white/30"
          >
            Community hub
          </Link>
          <Link
            to="/guide"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:border-white/30"
          >
            Full ecosystem guide
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
          >
            Back to story
          </Link>
        </div>
      </main>
    </div>
  );
}
