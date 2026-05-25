import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AnchorHTMLAttributes } from "react";
import raw from "../../../content/community-guide.md?raw";

function MarkdownAnchor({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
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

export default function CommunityGuide() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur md:px-16">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Home
          </Link>
          <span className="font-display text-sm text-foreground/90">Community guide</span>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-12 md:px-8 prose prose-invert max-w-none prose-headings:font-display prose-h1:text-3xl prose-a:text-primary prose-strong:text-foreground prose-th:text-left prose-td:text-left">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownAnchor }}>
          {raw}
        </ReactMarkdown>
      </article>
    </main>
  );
}
