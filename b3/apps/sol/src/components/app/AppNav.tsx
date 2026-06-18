"use client";

import { Link } from "@tanstack/react-router";
import { Hexagon } from "lucide-react";

import { WalletConnectButton } from "@/components/solana/WalletConnectButton";

const links = [
  { to: "/app" as const, label: "Dashboard" },
  { to: "/app/missions" as const, label: "Missions" },
  { to: "/app/achievements" as const, label: "Achievements" },
  { to: "/app/profile" as const, label: "Profile" },
];

export function AppNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold">
          <Hexagon className="h-5 w-5 fill-signal text-signal" strokeWidth={1.5} />
          BUILDING&nbsp;CULTURE
        </Link>
        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-foreground [&.active]:text-signal"
              activeOptions={{ exact: link.to === "/app" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <WalletConnectButton />
      </div>
    </header>
  );
}
