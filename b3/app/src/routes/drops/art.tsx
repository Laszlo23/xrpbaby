import { createFileRoute, Link } from "@tanstack/react-router";
import { platformModules } from "@/lib/modules";

export const Route = createFileRoute("/drops/art")({
  component: ArtDropsPage,
});

function ArtDropsPage() {
  if (!platformModules.art) {
    return <p className="p-8 text-white">Art module off.</p>;
  }
  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
      <Link to="/forest" className="text-sm text-zinc-400">
        ← Forest
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold">Art drops</h1>
      <p className="mt-4 text-zinc-400">Community art raffles from apps/art — shared BCD settlement when wired.</p>
    </div>
  );
}
