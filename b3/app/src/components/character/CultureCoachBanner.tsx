import { Link } from "@tanstack/react-router";

import { getCoachScene } from "@/lib/character/culture-coach";

type Props = {
  className?: string;
};

/** Slim banner for Forest hub linking to quest coach stories. */
export function CultureCoachBanner({ className }: Props) {
  const scene = getCoachScene("evolution");
  if (!scene) return null;

  return (
    <Link
      to="/forest/quests"
      className={`group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#C5FF41]/20 bg-gradient-to-r from-[#C5FF41]/5 via-black/40 to-[#00E5FF]/5 p-4 transition hover:border-[#C5FF41]/40 ${className ?? ""}`}
    >
      <img
        src={scene.thumbSrc}
        alt=""
        width={72}
        height={72}
        loading="lazy"
        className="h-[72px] w-[72px] shrink-0 rounded-xl border border-white/10 object-cover transition group-hover:border-[#C5FF41]/40"
      />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#C5FF41]">
          Culture Coach
        </p>
        <p className="mt-1 font-display text-base font-semibold text-white group-hover:text-[#C5FF41]">
          {scene.title}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{scene.quote}</p>
      </div>
      <span className="hidden shrink-0 text-sm font-semibold text-[#00E5FF] sm:inline">
        Quests →
      </span>
    </Link>
  );
}
