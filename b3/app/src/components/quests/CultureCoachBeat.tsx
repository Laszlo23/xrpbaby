import { pickCoachSceneForQuest, type CultureCoachScene } from "@/lib/character/culture-coach";

type CultureCoachBeatProps = {
  questSlug?: string;
  scene?: CultureCoachScene | null;
  won?: boolean;
};

export function CultureCoachBeat({ questSlug, scene, won = false }: CultureCoachBeatProps) {
  const resolved = scene ?? (questSlug ? pickCoachSceneForQuest(questSlug) : null);
  if (!resolved) return null;

  const quote = won && resolved.quoteWin ? resolved.quoteWin : resolved.quote;

  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <img
        src={resolved.thumbSrc}
        alt=""
        className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5FF41]">
          Culture Coach · {resolved.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-300">&ldquo;{quote}&rdquo;</p>
      </div>
    </div>
  );
}
