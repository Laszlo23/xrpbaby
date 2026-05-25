import { createFileRoute, Link } from "@tanstack/react-router";
import { platformModules } from "@/lib/modules";

export const Route = createFileRoute("/pass/")({
  component: PassPage,
});

function PassPage() {
  if (!platformModules.identity) {
    return <p className="p-8 text-white">Identity module off.</p>;
  }
  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white">
      <Link to="/forest" className="text-sm text-zinc-400">
        ← Forest
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold">Culture pass</h1>
      <p className="mt-4 max-w-lg text-zinc-400">
        Culture Layer identity from <code>apps/identity</code> — Farcaster mini progress imports into your member profile.
      </p>
    </div>
  );
}
