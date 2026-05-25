import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/chatbase")({
  head: () =>
    pageHead({
      title: "Chat",
      description: "Embedded chat powered by Chatbase.",
      path: "/chatbase",
      keywords: ["chat", "support", "Chatbase"],
    }),
  component: ChatbasePage,
});

function ChatbasePage() {
  useEffect(() => {
    const existing = document.querySelector('script[data-chatbase="embed"]');
    if (existing) return;

    const s = document.createElement("script");
    s.src = "https://chatbase.co/embed.min.js";
    s.async = true;
    s.setAttribute("chatbotId", "YOUR_ID");
    s.setAttribute("data-chatbase", "embed");
    document.body.appendChild(s);

    return () => {
      // Keep the embed script in place across route navigations to avoid re-initialization churn.
    };
  }, []);

  return (
    <MarketingShell
      eyebrow="Support"
      tone="cyan"
      title={<>Chat</>}
      subtitle="If the widget doesn’t appear, confirm the Chatbase ID is set for this environment."
      articleClassName="max-w-4xl"
    >
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
        <p className="text-sm text-zinc-400">
          Chatbase loads on this page via:
          <span className="ml-2 font-mono text-zinc-300">
            {'<script src="https://chatbase.co/embed.min.js" chatbotId="YOUR_ID"></script>'}
          </span>
        </p>
      </div>
    </MarketingShell>
  );
}
