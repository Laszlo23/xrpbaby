import { createFileRoute, Link } from "@tanstack/react-router";
import { platformModules } from "@/lib/modules";

export const Route = createFileRoute("/places/")({
  component: PlacesPage,
});

function PlacesPage() {
  if (!platformModules.places) {
    return <p className="p-8 text-white">Places module off.</p>;
  }
  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
      <Link to="/forest" className="text-sm text-zinc-400">
        ← Forest
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold">Places</h1>
      <p className="mt-4 max-w-lg text-zinc-400">
        Real-estate and REOC lane from apps/places. Investor flows and compliance stay behind clear disclaimers.
      </p>
      <Link to="/investors" className="mt-6 inline-block text-[#00E5FF] underline">
        Investor materials
      </Link>
    </div>
  );
}
