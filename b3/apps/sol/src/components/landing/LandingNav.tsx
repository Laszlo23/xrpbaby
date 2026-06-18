"use client";

import { Link } from "@tanstack/react-router";
import { ArrowRight, Hexagon } from "lucide-react";

export function LandingNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold">
          <Hexagon className="h-5 w-5 fill-signal text-signal" strokeWidth={1.5} />
          RESET
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-muted-foreground md:flex">
          <Link to="/story" className="hover:text-foreground">
            The road
          </Link>
          <a href="#tracks" className="hover:text-foreground">
            Tracks
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
          <a href="#partner" className="hover:text-foreground">
            Partner
          </a>
          <a href="#offer" className="hover:text-foreground">
            Pricing
          </a>
          <Link to="/login" className="hover:text-foreground">
            Sign in
          </Link>
        </nav>
        <Link
          to="/join"
          className="group inline-flex items-center gap-2 bg-signal px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground transition-all hover:gap-3"
        >
          Start <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
