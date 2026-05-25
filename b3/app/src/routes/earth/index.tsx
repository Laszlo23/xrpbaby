import { createFileRoute, Link } from "@tanstack/react-router";

import { platformModules } from "@/lib/modules";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/earth/")({
  component: EarthPage,
});

function EarthPage() {
  if (!platformModules.eco) {
    return (
      <div className="min-h-screen bg-[#050505] p-8 text-white">
        <p>Eco module is disabled.</p>
        <Link to="/forest">Back to forest</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-[#C5FF41]">Earth lane</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Hubs & regeneration</h1>
        <p className="mt-4 text-zinc-400">
          Physical places, eco revival, and the nomad path — merged from the eco app into one forest.
        </p>
        <Link to="/guide" className="mt-8 inline-block text-[#00E5FF] underline">
          Read the community guide
        </Link>
        <p className="mt-6 text-sm text-zinc-600">
          Legacy static eco site: configure redirect from eco.buildingculture.capital → /earth
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
