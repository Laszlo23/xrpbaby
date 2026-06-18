"use client";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Hexagon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { CommunityStakePreview } from "@/components/members/CommunityStakeCard";
import { getCheckoutMode, startCheckout } from "@/lib/api/checkout.functions";
import { COMMUNITY_STAKE_COPY } from "@/lib/community-stake-data";
import { TRACKS } from "@/lib/tracks-data";

const joinSearchSchema = z.object({
  ref: z.string().optional(),
  track: z.string().optional(),
  canceled: z.coerce.number().optional(),
});

export const Route = createFileRoute("/join")({
  validateSearch: joinSearchSchema,
  component: JoinPage,
});

function JoinPage() {
  const { ref, track, canceled } = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trackSlug, setTrackSlug] = useState(
    track && TRACKS.some((t) => t.slug === track) ? track : (TRACKS[0]?.slug ?? "sober-reset"),
  );
  const [plan, setPlan] = useState<"MONTHLY" | "LIFETIME">("MONTHLY");

  const checkoutMode = useQuery({
    queryKey: ["checkout-mode"],
    queryFn: () => getCheckoutMode(),
  });
  const usesStripe = checkoutMode.data?.mode === "stripe";

  const signup = useMutation({
    mutationFn: () =>
      startCheckout({
        data: {
          name,
          email,
          trackSlug,
          plan,
          referralCode: ref,
        },
      }),
    onSuccess: (result) => {
      if (result.mode === "redirect") {
        window.location.href = result.url;
        return;
      }
      toast.success("Welcome — your Day 1 kit is unlocked.");
      navigate({ to: "/members" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-sm font-bold">
          <Hexagon className="h-5 w-5 fill-signal text-signal" />
          RESET
        </Link>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-signal">Start today</p>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
            Your new life
            <br />
            <span className="text-signal">delivered in 60 seconds.</span>
          </h1>
          <p className="mt-6 max-w-lg text-muted-foreground">
            No crypto. No waiting. Sign up and instantly unlock your identity worksheet, daily
            rituals, Day 1 protocol, and partner referral kit.
          </p>
          {ref && (
            <p className="mt-4 border border-signal/30 bg-signal/5 px-4 py-3 font-mono text-xs text-signal">
              Referred by partner: {ref}
            </p>
          )}
          {canceled === 1 && (
            <p className="mt-4 border border-border bg-surface px-4 py-3 font-mono text-xs text-muted-foreground">
              Checkout canceled — pick up where you left off.
            </p>
          )}
          <p className="mt-8 text-sm text-muted-foreground">
            <Link to="/story" className="text-signal hover:underline">
              Read why RESET exists
            </Link>{" "}
            — from nothing worked to one thing that stuck, and building together.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Identity declaration worksheet",
              "Morning & evening ritual cards",
              "Track-specific Day 1 protocol",
              "50%+ of your fee locked as BCC — community staking",
              "Partner link — earn 30% on direct referrals",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 bg-signal" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{COMMUNITY_STAKE_COPY.subline}</p>
        </div>

        <form
          className="border border-border bg-surface p-8"
          onSubmit={(e) => {
            e.preventDefault();
            signup.mutate();
          }}
        >
          <h2 className="font-display text-2xl font-bold">Create your account</h2>

          <label className="mt-6 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Full name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-4 py-3 font-sans text-sm outline-none focus:border-signal"
            />
          </label>

          <label className="mt-4 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-4 py-3 font-sans text-sm outline-none focus:border-signal"
            />
          </label>

          <label className="mt-4 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Your track
            <select
              value={trackSlug}
              onChange={(e) => setTrackSlug(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-4 py-3 font-sans text-sm outline-none focus:border-signal"
            >
              {TRACKS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title} — {t.tagline}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
            {(
              [
                { id: "MONTHLY" as const, label: "Monthly", price: "$19/mo" },
                { id: "LIFETIME" as const, label: "Lifetime", price: "$199 once" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={`p-4 text-left transition-colors ${plan === p.id ? "bg-signal text-signal-foreground" : "bg-background hover:bg-surface-elevated"}`}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                  {p.label}
                </div>
                <div className="mt-1 font-display text-2xl font-bold">{p.price}</div>
              </button>
            ))}
          </div>

          <CommunityStakePreview plan={plan} />

          <button
            type="submit"
            disabled={signup.isPending || checkoutMode.isLoading}
            className="mt-8 flex w-full items-center justify-center gap-2 bg-signal py-4 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground disabled:opacity-50"
          >
            {signup.isPending
              ? usesStripe
                ? "Redirecting to checkout..."
                : "Unlocking your kit..."
              : usesStripe
                ? `Continue to checkout — ${plan === "MONTHLY" ? "$19/mo" : "$199"}`
                : "Unlock Day 1 now"}
            <ArrowRight className="h-4 w-4" />
          </button>

          {usesStripe && (
            <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
              Secure payment via Stripe. Cancel anytime on monthly.
            </p>
          )}

          <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="text-signal hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
