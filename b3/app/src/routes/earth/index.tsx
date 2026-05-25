import { createFileRoute, Link } from "@tanstack/react-router";
import { ModuleShell } from "@/components/ModuleShell";
import { platformModules } from "@/lib/modules";

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
    <ModuleShell
      moduleId="earth"
      title="Hubs & regeneration"
      subtitle="Physical places, eco revival, and the nomad path — merged from the eco app into one forest."
    >
      <Link to="/guide" className="inline-block text-[#00E5FF] underline">
        Read the community guide
      </Link>
      <p className="mt-6 text-sm text-zinc-600">
        Legacy static eco site: configure redirect from eco.buildingculture.capital → /earth
      </p>
    </ModuleShell>
  );
}
