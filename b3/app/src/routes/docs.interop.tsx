import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AnchorHTMLAttributes } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { pageHead } from "@/lib/seo";
import raw from "../../../content/bcid-interop.md?raw";

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

export const Route = createFileRoute("/docs/interop")({
  head: () =>
    pageHead({
      title: "BCID interoperability",
      description:
        "How BCID works alongside ENS, .culture, EAS, World ID, and ERC-8004 without breaking existing systems.",
      path: "/docs/interop",
      keywords: ["BCID", "interop", "EAS", "ENS", "culture ID", "ERC-8004"],
      ogType: "article",
    }),
  component: DocsInteropPage,
});

function DocsInteropPage() {
  return (
    <MarketingShell
      eyebrow="Protocol"
      title="BCID interoperability"
      subtitle="Bridge .culture, link ENS, anchor EAS attestations — complement, don't compete."
      tone="slate"
      heroSize="compact"
      actions={
        <Link to="/docs/bcid" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← BCID overview
        </Link>
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
