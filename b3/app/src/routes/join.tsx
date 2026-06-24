import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { JoinConnectPanel } from "@/components/join/JoinConnectPanel";
import { ConnectFarcasterButton } from "@bc/culture-auth/react";
import { NeynarConnectBoundary } from "@/components/NeynarConnectBoundary";
import { SupportScorePanel } from "@/components/SupportScorePanel";
import { useLinkedWalletAddress } from "@/hooks/useLinkedWalletAddress";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { usePlatformSiweSign } from "@/hooks/usePlatformSiweSign";
import { plainLabels } from "@/lib/plain-labels";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { identityMintPriceShort } from "@/lib/identity/mint-price";
import { getPersistedMarketingAttribution } from "@/lib/agent-attribution";

export const Route = createFileRoute("/join")({
  component: JoinPage,
  head: () =>
    pageHead({
      title: "Join",
      description: `Create your ${BRAND_DISPLAY_NAME} pass, connect your wallet, and start earning Culture Points.`,
      path: "/join",
      keywords: ["Build Culture", "join", "pass", "wallet", "culture points"],
    }),
});

const INTENTS = [
  { id: "explore" as const, ...plainLabels.join.intents.explore },
  { id: "build" as const, ...plainLabels.join.intents.build },
  { id: "gather" as const, ...plainLabels.join.intents.gather },
];

function JoinSteps({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: plainLabels.join.stepConnect },
    { n: 2, label: plainLabels.join.stepPath },
    { n: 3, label: plainLabels.join.stepHub },
  ] as const;

  return (
    <ol className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2">
      {steps.map((step) => {
        const done = step.n < activeStep;
        const active = step.n === activeStep;
        return (
          <li key={step.n} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-[#C5FF41]/20 text-[#C5FF41]"
                  : active
                    ? "bg-[#C5FF41] text-black"
                    : "border border-white/15 text-zinc-500"
              }`}
            >
              {done ? <CheckCircle2 size={14} aria-hidden /> : step.n}
            </span>
            <span
              className={`text-[10px] font-medium uppercase tracking-wide ${
                active ? "text-[#C5FF41]" : "text-zinc-500"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function JoinPage() {
  const navigate = useNavigate();
  const address = useLinkedWalletAddress();
  const { signPlatformSiwe, signing } = usePlatformSiweSign();
  const { data: member, isLoading: memberLoading } = useMemberProfile(address);
  const [intent, setIntent] = useState<(typeof INTENTS)[number]["id"]>("explore");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const walletLinked = Boolean(address);
  const isOnboarded = Boolean(member?.intent);
  const checkingSession = walletLinked && memberLoading;
  const showFinishSetup = walletLinked && !isOnboarded && !checkingSession;

  useEffect(() => {
    if (!walletLinked || memberLoading) return;
    if (isOnboarded) {
      void navigate({ to: "/forest", replace: true });
    }
  }, [walletLinked, memberLoading, isOnboarded, navigate]);

  const finish = async () => {
    if (!address) return;
    setBusy(true);
    setError("");
    try {
      const signed = await signPlatformSiwe();
      if (!signed) {
        setError(plainLabels.join.errors.signInFailed);
        return;
      }
      const { prepared, signature, address: signedAddress } = signed;
      const attribution = getPersistedMarketingAttribution();
      const res = await fetch("/api/platform/onboarding-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: signedAddress,
          intent,
          email: email || undefined,
          message: prepared,
          signature,
          agent_ref: attribution.agent_ref,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        groveLinked?: boolean;
      };
      if (!res.ok || !data.ok) {
        setError(plainLabels.join.errors.saveFailed);
        return;
      }
      if (data.groveLinked) {
        toast.success("Culture DNA linked!", {
          description: "+25 Culture Points — you joined through a friend's grove.",
        });
      } else {
        toast.success("Welcome to the grove!", {
          description: "Plant your Culture DNA — invite 2 friends after you land in the forest.",
        });
      }
      toast.message("Builder Voice bonus", {
        description: "Tell us what confused you during join → earn points.",
        action: {
          label: "Builder Voice",
          onClick: () => {
            window.location.href = "/voice?area=onboarding";
          },
        },
      });
      navigate({ to: "/forest", search: { welcome: "1" } });
    } catch (err) {
      const code =
        err instanceof Error && err.message === "wallet_not_ready"
          ? plainLabels.join.errors.walletLoading
          : plainLabels.join.errors.signInFailed;
      setError(code);
    } finally {
      setBusy(false);
    }
  };

  const loading = busy || signing;

  if (checkingSession || isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#C5FF41]" aria-hidden />
          <p className="text-sm text-zinc-400">{plainLabels.join.redirecting}</p>
        </div>
      </div>
    );
  }

  if (!walletLinked) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <header className="border-b border-white/10 px-6 py-4">
          <Link to="/" className="text-sm text-zinc-400 hover:text-white">
            {plainLabels.join.backToStory}
          </Link>
        </header>
        <main className="mx-auto max-w-lg px-6 py-12 text-center sm:py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-[#C5FF41]">
            {plainLabels.join.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
            {plainLabels.join.title}
          </h1>
          <p className="mt-4 text-zinc-400">{plainLabels.join.subtitle}</p>
          <JoinSteps activeStep={1} />
          <div className="mt-10">
            <JoinConnectPanel />
          </div>
          <p className="mt-8 text-xs text-zinc-600">
            {plainLabels.join.alreadyInside}{" "}
            <Link to="/forest" className="text-zinc-400 underline">
              {plainLabels.join.goToHub}
            </Link>
          </p>
        </main>
      </div>
    );
  }

  if (!showFinishSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#C5FF41]" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="mx-auto max-w-lg px-6 py-10 text-center sm:py-14">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C5FF41]">
          {plainLabels.join.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {plainLabels.join.finishTitle}
        </h1>
        <p className="mt-3 text-zinc-400">{plainLabels.join.finishSubtitle}</p>
        <JoinSteps activeStep={2} />

        <div className="mt-10 flex flex-col gap-2 text-left">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            {plainLabels.join.intentPrompt}
          </p>
          {INTENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIntent(item.id)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                intent === item.id
                  ? "border-[#C5FF41]/60 bg-[#C5FF41]/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span className="mt-1 block text-sm text-zinc-400">{item.hint}</span>
            </button>
          ))}
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={plainLabels.join.emailPlaceholder}
          className="mt-6 w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm placeholder:text-zinc-500"
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => void finish()}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C5FF41] py-4 text-sm font-semibold text-black disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {plainLabels.join.signingIn}
            </>
          ) : (
            plainLabels.join.signIn
          )}
        </button>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <div className="mt-8 space-y-4 text-left">
          <NeynarConnectBoundary className="flex justify-center">
            <ConnectFarcasterButton
              className="flex justify-center"
              label="Connect Farcaster (optional)"
            />
          </NeynarConnectBoundary>
          <SupportScorePanel />
        </div>

        <div className="mt-8 rounded-xl border border-[#C5FF41]/25 bg-[#C5FF41]/[0.06] p-4 text-left">
          <p className="text-sm font-medium text-zinc-100">Culture packs from $0.70</p>
          <p className="mt-1 text-xs text-zinc-400">
            Pay with card (Stripe) — no crypto payment required. Connect your wallet so we can link
            Culture Points to your profile after checkout.
          </p>
          <Link
            to="/wallet/packs"
            className="mt-3 inline-block text-sm font-semibold text-[#C5FF41] underline underline-offset-2 hover:text-white"
          >
            View packs →
          </Link>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Optional next step: mint your{" "}
          <Link to="/pass" className="text-[#C5FF41] underline underline-offset-2">
            .culture name
          </Link>{" "}
          on Base ({identityMintPriceShort}) after you land in the hub.
        </p>
      </main>
    </div>
  );
}
