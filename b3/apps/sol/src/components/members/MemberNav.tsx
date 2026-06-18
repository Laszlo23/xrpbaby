"use client";

import { Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Hexagon, LogOut } from "lucide-react";

import { logout } from "@/lib/api/member.functions";

const links = [
  { to: "/members" as const, label: "Today", exact: true },
  { to: "/members/progress" as const, label: "Proof", exact: false },
  { to: "/members/journal" as const, label: "Journal", exact: false },
  { to: "/members/mood" as const, label: "Mood", exact: false },
  { to: "/members/library" as const, label: "Library", exact: false },
  { to: "/members/partner" as const, label: "Partner", exact: false },
];

export function MemberNav() {
  const router = useRouter();

  const signOut = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      router.navigate({ to: "/" });
    },
  });

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-sm font-bold">
          <Hexagon className="h-5 w-5 fill-signal text-signal" strokeWidth={1.5} />
          RESET
        </Link>
        <nav className="flex items-center gap-4 overflow-x-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:gap-6 sm:text-xs">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="whitespace-nowrap hover:text-foreground [&.active]:text-signal"
              activeOptions={{ exact: link.exact }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            to="/join"
            className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-signal sm:inline"
          >
            Invite
          </Link>
          <button
            type="button"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
