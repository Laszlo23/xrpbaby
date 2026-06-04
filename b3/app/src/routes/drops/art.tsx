import { createFileRoute } from "@tanstack/react-router";
import { platformModules } from "@/lib/modules";
import { pageHead } from "@/lib/seo";
import { ArtDropsLanding } from "@/modules/art/ArtDropsLanding";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/drops/art")({
  head: () =>
    pageHead({
      title: "Building Culture Art — Culture belongs to everyone",
      description:
        "Onchain raffles for museum-scale paintings by Angeli & Scheibl. Buy a ticket for a chance to win the physical artwork.",
      path: "/drops/art",
      keywords: ["art", "raffle", "Angeli", "Scheibl", "Building Culture", "Base"],
    }),
  component: ArtDropsPage,
});

function ArtDropsPage() {
  if (!platformModules.art) {
    return (
      <div className="min-h-screen bg-[#050505] p-8 text-white">
        <p>Art module off.</p>
        <Link to="/forest" className="mt-4 inline-block text-sm text-zinc-400">
          ← Forest
        </Link>
      </div>
    );
  }

  return (
    <div className="art-module dark">
      <ArtDropsLanding />
    </div>
  );
}
