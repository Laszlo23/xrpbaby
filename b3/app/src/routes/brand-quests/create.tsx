import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { formatBrandQuestThreshold } from "@/lib/brand-quest-config";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/brand-quests/create")({
  component: BrandQuestCreatePage,
  head: () =>
    pageHead({
      title: "Create brand story quest",
      description: `Publish a storytelling quest when you hold ${formatBrandQuestThreshold()}+.`,
      path: "/brand-quests/create",
    }),
});

function BrandQuestCreatePage() {
  const { address, isConnected } = useAccount();
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/brand-quests/eligibility?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((d: { eligible?: boolean }) => setEligible(Boolean(d.eligible)))
      .catch(() => setEligible(false));
  }, [address]);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setBusy(true);
    try {
      const res = await fetch("/api/brand-quests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          title,
          storyMarkdown: story,
          ticketPackSlug: "pack_triple_333",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; questId?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Could not publish quest");
        return;
      }
      toast.success("Brand story quest published!");
      setTitle("");
      setStory("");
    } finally {
      setBusy(false);
    }
  }

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center text-zinc-400">
        <Link to="/join" className="text-[#C5FF41] underline">
          Connect wallet
        </Link>{" "}
        to create brand quests.
      </div>
    );
  }

  if (eligible === false) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-display text-2xl font-bold text-white">Brand story quests</h1>
        <p className="mt-4 text-sm text-zinc-400">
          Hold at least <strong className="text-white">{formatBrandQuestThreshold()}</strong> to
          publish storytelling quests that grow your brand with Culture Points, tickets, and follow
          quests.
        </p>
        <Link to="/bcc" className="mt-6 inline-block text-[#C5FF41] underline">
          Learn about BCC →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--vault-gold)]">
        Whale voice · {formatBrandQuestThreshold()}+
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">Create brand story quest</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Tell your story in chapters. Attach ticket packs for amplification and auto-generate follow
        quests for Farcaster/X.
      </p>

      <form onSubmit={(e) => void handlePublish(e)} className="mt-8 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quest title"
          required
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
        />
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Story arc — chapters, rewards, brand voice…"
          required
          rows={10}
          className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
        />
        <p className="text-xs text-zinc-600">
          Includes Triple 333 ticket pack hook for brand amplification. Participants earn Culture
          Points — not investment returns.
        </p>
        <button
          type="submit"
          disabled={busy || eligible !== true}
          className="rounded-full bg-[var(--vault-gold)] px-8 py-3 text-sm font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Publishing…" : "Publish story quest"}
        </button>
      </form>
    </div>
  );
}
