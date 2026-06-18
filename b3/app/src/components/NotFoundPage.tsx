import { Link } from "@tanstack/react-router";
import { HardHat, Hammer, Trees } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(197,255,65,0.15), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#C5FF41]/30 bg-[#C5FF41]/10">
          <HardHat className="h-10 w-10 text-[#C5FF41]" aria-hidden />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#C5FF41]">
          Under development
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          Still building something culture-worthy
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          This door isn&apos;t wired yet — our builders are probably adding another layer to the
          forest. The good news: the quests, passes, and weekly BCC loop are very much alive.
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          Error code: 404 · aka &quot;we got excited and shipped the map before the room&quot;
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#b8eb3a]"
          >
            <Trees className="h-4 w-4" aria-hidden />
            Back home
          </Link>
          <Link
            to="/forest/quests"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-[#C5FF41]/40 hover:text-[#C5FF41]"
          >
            <Hammer className="h-4 w-4" aria-hidden />
            Open quests
          </Link>
          <Link
            to="/join"
            className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-white hover:underline"
          >
            Get your pass
          </Link>
        </div>
      </div>
    </div>
  );
}
