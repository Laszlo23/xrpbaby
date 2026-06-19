import { Link, useLocation } from "@tanstack/react-router";
import { Bot, LayoutDashboard, Network, User, Zap } from "lucide-react";

import { plainLabels } from "@/lib/plain-labels";
import { useWalletCultureIdentity } from "@/hooks/useWalletCultureIdentity";

const navItems = [
  { to: "/forest", icon: LayoutDashboard, label: "Hub" },
  { to: "/play", icon: Zap, label: "Play" },
  { to: "/connect", icon: Network, label: "Connect" },
  { to: "/agents/inbox", icon: Bot, label: "Agents" },
  { to: "/profile", icon: User, label: "You" },
] as const;

function isNavActive(pathname: string, to: string): boolean {
  if (to === "/forest") return pathname === "/forest" || pathname.startsWith("/forest/");
  if (to === "/agents/inbox") {
    return pathname.startsWith("/agents") || pathname.startsWith("/agent-os");
  }
  if (to === "/connect") return pathname.startsWith("/connect");
  if (to === "/profile") {
    return pathname === "/profile" || pathname.startsWith("/id/");
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function BottomNav() {
  const location = useLocation();
  const { primaryName } = useWalletCultureIdentity();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:px-6 md:pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto nav-dock w-full max-w-lg rounded-full px-1 py-1 backdrop-blur-2xl md:max-w-xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = isNavActive(location.pathname, item.to);
            const isProfile = item.to === "/profile";
            const showIdentityDot = isProfile && Boolean(primaryName);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={
                  showIdentityDot
                    ? `${primaryName} · your Culture ID`
                    : item.to === "/play"
                      ? plainLabels.play.bottomNavPlay
                      : undefined
                }
                className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-3 py-2.5 transition-colors duration-200 md:py-3 ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-[0_0_0_1px_rgb(0_82_255/0.35)]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {showIdentityDot ? (
                  <span
                    className="absolute right-[calc(50%-1.25rem)] top-2 h-2 w-2 rounded-full bg-[var(--vault-gold)] shadow-[0_0_8px_rgb(212_175_55/0.8)]"
                    aria-hidden
                  />
                ) : null}
                <item.icon
                  className={`h-[22px] w-[22px] shrink-0 md:h-5 md:w-5 ${isActive ? "text-neon" : ""}`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] md:text-[10px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
