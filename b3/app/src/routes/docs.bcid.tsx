import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AnchorHTMLAttributes } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { pageHead } from "@/lib/seo";
import raw from "../../../content/bcid-overview.md?raw";

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

export const Route = createFileRoute("/docs/bcid")({
  head: () =>
    pageHead({
      title: "BCID — Building Culture Identity",
      description:
        "Soulbound portable builder identity with verifiable credentials. Complements ENS, EAS, World ID, and ERC-8004.",
      path: "/docs/bcid",
      keywords: ["BCID", "Building Culture ID", "soulbound", "DID", "Web3 identity", "EAS"],
      ogType: "article",
    }),
  component: DocsBcidPage,
});

function DocsBcidPage() {
  return (
    <MarketingShell
      eyebrow="Protocol"
      title="BCID overview"
      subtitle="Soulbound identity with dynamic reputation — complements ENS, EAS, and ERC-8004."
      tone="slate"
      heroSize="compact"
      actions={
        <>
          <Link to="/docs/interop" className="text-sm text-zinc-400 underline hover:text-zinc-200">
            Interop guide
          </Link>
          <Link to="/docs/rfc" className="text-sm text-zinc-400 underline hover:text-zinc-200">
            Spec RFC
          </Link>
          <Link to="/bcid" className="text-sm text-emerald-300 underline hover:text-white">
            Mint BCID
          </Link>
        </>
      }
    >
      <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-p:text-zinc-400 prose-a:text-zinc-200 prose-strong:text-zinc-200 prose-th:text-left prose-td:text-left">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownAnchor }}>
          {raw}
        </ReactMarkdown>
      </div>
    </MarketingShell>
  );
}
