import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { Loader2 } from "lucide-react";

import { WalletControls } from "@/components/WalletControls";
import { platformForestUrl } from "@/lib/platform-url";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { plainLabels } from "@/lib/plain-labels";

export const Route = createFileRoute("/join")({
  component: JoinPage,
  head: () => ({
    meta: [{ title: "Join — Building Culture" }],
  }),
});

const INTENTS = [
  { id: "explore" as const, ...plainLabels.join.intents.explore },
  { id: "build" as const, ...plainLabels.join.intents.build },
  { id: "gather" as const, ...plainLabels.join.intents.gather },
];

function JoinPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const [intent, setIntent] = useState<(typeof INTENTS)[number]["id"]>("explore");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const finish = async () => {
    if (!address || !chainId) return;
    setBusy(true);
    setError("");
    try {
      const { prepared } = await buildPlatformSiweMessage(address, chainId);
      const signature = await signMessageAsync({ message: prepared });
      const res = await fetch("/api/platform/onboarding-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          intent,
          email: email || undefined,
          message: prepared,
          signature,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(plainLabels.join.errors.saveFailed);
        return;
      }
      navigate({ to: "/forest" });
    } catch {
      setError(plainLabels.join.errors.signInFailed);
    } finally {
      setBusy(false);
    }
  };

  const loading = busy || signing;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <Link to="/" className="text-sm text-zinc-400 hover:text-white">
          {plainLabels.join.backToStory}
        </Link>
      </header>
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#C5FF41]">{plainLabels.join.eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">{plainLabels.join.title}</h1>
        <p className="mt-4 text-zinc-400">{plainLabels.join.subtitle}</p>

        <div className="mt-10 flex flex-col gap-2 text-left">
          <p className="text-xs uppercase tracking-wider text-zinc-500">{plainLabels.join.intentPrompt}</p>
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

        <div className="mt-8">
          <WalletControls className="mx-auto" />
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={plainLabels.join.emailPlaceholder}
          className="mt-6 w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm placeholder:text-zinc-500"
        />

        {isConnected && address ? (
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
        ) : (
          <p className="mt-6 text-sm text-zinc-500">{plainLabels.join.connectHint}</p>
        )}

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <p className="mt-8 text-xs text-zinc-600">
          {plainLabels.join.alreadyInside}{" "}
          <a href={platformForestUrl()} className="text-zinc-400 underline">
            {plainLabels.join.goToHub}
          </a>
        </p>
      </main>
    </div>
  );
}
