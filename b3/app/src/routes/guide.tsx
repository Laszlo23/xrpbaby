import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AnchorHTMLAttributes } from "react";
import { Compass } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { pageHead } from "@/lib/seo";
import raw from "../../../content/community-guide.md?raw";

function MarkdownAnchor({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = typeof href === "string" && /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export const Route = createFileRoute("/guide")({
  head: () =>
    pageHead({
      title: "Community guide — Building Culture",
      description:
        "Same guide on every Building Culture site: home, 0x, app, eco, and apex — URLs explained in plain language.",
      path: "/guide",
      keywords: ["Building Culture", "guide", "BUILDCHAIN", "ecosystem"],
    }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <MarketingShell
      eyebrow="Ecosystem"
      title="Community guide"
      subtitle="One story across every hostname — start anywhere on this page."
      tone="cyan"
      heroSize="compact"
      actions={
        <Link
          to="/faq"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
        >
          Product FAQ
        </Link>
      }
    >
      <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-p:text-zinc-400 prose-a:text-zinc-200 prose-strong:text-zinc-200 prose-th:text-left prose-td:text-left">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownAnchor }}>
          {raw}
        </ReactMarkdown>
      </div>
      <p className="mt-10 flex items-center gap-2 text-sm text-zinc-500">
        <Compass className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
        Tip: bookmark <span className="font-mono text-zinc-400">/guide</span> on any subdomain —
        content stays in sync.
      </p>
    </MarketingShell>
  );
}
