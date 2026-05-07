import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  children: ReactNode;
};

export function LegalShell({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="container flex items-center justify-between gap-4 py-6 px-4">
          <Link
            to="/land"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Story hub
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Building<span className="text-primary mx-1">·</span>Culture
          </span>
        </div>
      </header>
      <main className="container max-w-3xl px-4 py-12 md:py-16">
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight mb-10">{title}</h1>
        <article className="prose prose-invert prose-sm md:prose-base prose-headings:font-sans prose-a:text-primary prose-strong:text-foreground max-w-none">
          {children}
        </article>
      </main>
    </div>
  );
}
