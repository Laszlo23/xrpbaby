"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bot, Home, Wallet, FileText, HeartPulse,
  Briefcase, GraduationCap, Languages, MapPin, User, Settings, Menu, X, Flag,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/assistant", label: "AI Assistant", icon: Bot },
  { href: "/app/housing", label: "Housing", icon: Home },
  { href: "/app/benefits", label: "Money & Benefits", icon: Wallet },
  { href: "/app/documents", label: "Documents", icon: FileText },
  { href: "/app/healthcare", label: "Healthcare", icon: HeartPulse },
  { href: "/app/jobs", label: "Jobs", icon: Briefcase },
  { href: "/app/schools", label: "Schools", icon: GraduationCap },
  { href: "/app/translate", label: "Translation", icon: Languages },
  { href: "/app/services", label: "Nearby Services", icon: MapPin },
] as const;

const footerNav = [
  { href: "/app/profile", label: "My Profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

interface AppShellProps {
  children: ReactNode;
  userName?: string;
  userInitial?: string;
  isGuest?: boolean;
}

export function AppShell({ children, userName = "Guest", userInitial = "G", isGuest = true }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r bg-sidebar p-4 transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Flag className="h-5 w-5" />
            </div>
            <span className="font-bold">
              Ankommen <span className="gradient-text">AI</span>
            </span>
          </Link>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {nav.map((item) => {
            const active = isActive(item.href, "exact" in item ? item.exact : undefined);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="my-3 h-px bg-border" />
          {footerNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" /> {item.label}
              </Link>
            );
          })}
          <div className="mt-4 rounded-2xl border bg-card p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft font-semibold text-accent">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{userName}</div>
                <div className="truncate text-xs text-muted-foreground">{isGuest ? "Guest mode" : "Registered"}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur md:px-8">
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm text-muted-foreground">Ankommen AI</div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/app/assistant" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              Ask AI
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
