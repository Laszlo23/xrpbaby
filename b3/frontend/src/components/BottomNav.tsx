import { Link, useLocation } from "@tanstack/react-router";
import { Zap, Layers, Trophy, User, Building2 } from "lucide-react";

const navItems = [
  { to: "/", icon: Zap, label: "Play" },
  { to: "/marketplace", icon: Building2, label: "Market" },
  { to: "/collections", icon: Layers, label: "Collection" },
  { to: "/leaderboard", icon: Trophy, label: "Ranks" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:px-6 md:pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto nav-dock w-full max-w-lg rounded-full px-1 py-1 backdrop-blur-2xl md:max-w-xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              item.to === "/marketplace"
                ? location.pathname.startsWith("/marketplace")
                : location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-3 py-2.5 transition-colors duration-200 md:py-3 ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-[0_0_0_1px_rgb(0_82_255/0.35)]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
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
