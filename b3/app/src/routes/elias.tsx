import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { EliasConcierge } from "@/components/EliasConcierge";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { eliasOrbEnabled } from "@/lib/elias-feature";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/elias")({
  head: () =>
    pageHead({
      title: `Elias Concierge — ${BRAND_DISPLAY_NAME}`,
      description:
        "AI concierge for Elias Residence Vienna — draft itineraries, approve partner outreach, and connect BUILDCHAIN XP to real-world stays.",
      path: "/elias",
      keywords: ["Elias", "Vienna", "concierge", "Building Culture", "BUILDCHAIN", "RWA"],
    }),
  component: EliasPage,
});

function EliasPage() {
  const enabled = eliasOrbEnabled();

  return (
    <MarketingShell
      eyebrow="Experience layer"
      tone="amber"
      heroSize="compact"
      articleClassName="max-w-3xl w-full"
      title={
        <>
          Elias{" "}
          <span className="bg-gradient-to-r from-amber-100 via-white to-amber-200/90 bg-clip-text text-transparent">
            Concierge
          </span>
        </>
      }
      subtitle={
        enabled
          ? "Private Vienna adventures aligned with Building Culture — stays become proof, the agent becomes the service layer."
          : "Elias is coming soon — Vienna concierge itineraries with partner outreach and BUILDCHAIN XP."
      }
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            to="/experiences"
            className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1]"
          >
            Experiences
          </Link>
          <Link
            to="/forest"
            className="inline-flex items-center justify-center rounded-full bg-[rgb(0_82_255)] px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_32px_-8px_rgb(0_82_255/80%)] ring-1 ring-white/10 transition hover:bg-[rgb(0_72_230)]"
          >
            Back to forest
          </Link>
        </div>
      }
    >
      {enabled ? (
        <EliasConcierge />
      ) : (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-zinc-300">
          <p className="text-sm leading-relaxed">
            The full Elias concierge — draft itineraries, approve partner emails, and link wallet XP
            — will return once server-side chat storage is configured. Pulse Coach remains available
            for ecosystem guidance in the meantime.
          </p>
        </div>
      )}
    </MarketingShell>
  );
}
