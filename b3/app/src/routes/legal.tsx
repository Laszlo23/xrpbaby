import { Link, Navigate, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { MarketingHero } from "@/components/MarketingHero";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/legal/terms" as const, label: "Terms" },
  { to: "/legal/privacy" as const, label: "Privacy" },
  { to: "/legal/imprint" as const, label: "Imprint" },
  { to: "/legal/cookies" as const, label: "Cookies" },
] as const;

export const Route = createFileRoute("/legal")({
  component: LegalLayout,
});

function LegalLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/legal") {
    return <Navigate to="/legal/terms" replace />;
  }

  return (
    <div className="min-h-0">
      <MarketingHero
        eyebrow="Legal"
        tone="slate"
        size="compact"
        title="Policies & disclosures"
        subtitle="Development placeholders only—replace with counsel-reviewed terms before you onboard users or handle payments."
      />
      <div className="border-b border-white/[0.06] bg-black/50 px-4 backdrop-blur-md md:px-10">
        <nav className="mx-auto flex max-w-3xl flex-wrap gap-2 py-5" aria-label="Legal sections">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition",
                pathname === tab.to
                  ? "border-neon/40 bg-neon/10 text-zinc-100"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/15 hover:text-zinc-300",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-10">
        <Outlet />
      </div>
    </div>
  );
}
