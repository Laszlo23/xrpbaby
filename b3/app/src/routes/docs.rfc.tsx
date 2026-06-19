import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AnchorHTMLAttributes } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { pageHead } from "@/lib/seo";
import raw from "../../../content/bcid-rfc-summary.md?raw";

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

export const Route = createFileRoute("/docs/rfc")({
  head: () =>
    pageHead({
      title: "BCID Specification RFC",
      description:
        "BCID v1 Request for Comments — did:bcid method, credentials, reputation formula, and interoperability.",
      path: "/docs/rfc",
      keywords: ["BCID", "RFC", "DID", "specification", "soulbound"],
      ogType: "article",
    }),
  component: DocsRfcPage,
});

function DocsRfcPage() {
  return (
    <MarketingShell
      eyebrow="RFC"
      title="BCID Specification v1"
      subtitle="Public comment open until 2026-08-18 — feedback shapes v1.0."
      tone="slate"
      heroSize="compact"
      actions={
        <>
          <a
            href="https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/BCID_SPEC_RFC.md"
            className="text-sm text-emerald-300 underline hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Full RFC on GitHub
          </a>
          <Link to="/voice" className="text-sm text-zinc-400 underline hover:text-zinc-200">
            Submit feedback
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
