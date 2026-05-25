"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListTodo, Trophy, User, Coins } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/mint", label: "Mint", icon: Coins },
  { to: "/leaderboard", label: "Rank", icon: Trophy },
  { to: "/profile", label: "You", icon: User },
] as const;

export function MiniAppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <BrandLogo className="h-8 w-8" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Culture Layer
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/"
                ? pathname === "/" || pathname === ""
                : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
