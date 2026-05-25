import { Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-28">
        <Link
          to="/"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
        >
          ← Culture Layer
        </Link>
        <h1 className="mt-8 font-display text-3xl font-medium tracking-tight text-gradient">
          {title}
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
        <p className="mt-12 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
          Not legal advice; update before production counsel review.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
