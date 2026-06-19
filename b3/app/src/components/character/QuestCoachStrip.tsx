import type { CultureCoachScene } from "@/lib/character/culture-coach";
import { PILLAR_COLORS, PILLAR_LABELS } from "@/lib/character/culture-coach";
import { cn } from "@/lib/utils";

type Props = {
  scene: CultureCoachScene;
  done?: boolean;
  compact?: boolean;
};

export function QuestCoachStrip({ scene, done = false, compact = false }: Props) {
  const quote = done && scene.quoteWin ? scene.quoteWin : scene.quote;

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
        <img
          src={scene.thumbSrc}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-lg border border-white/10 object-cover"
        />
        <p className="text-xs italic text-zinc-400">&ldquo;{quote}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-3">
      <img
        src={scene.thumbSrc}
        alt=""
        width={80}
        height={80}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-lg border-2 border-[#C5FF41]/30 object-cover shadow-[0_0_16px_-4px_#C5FF41]"
      />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Culture Coach
        </p>
        <p className="mt-1 text-sm italic text-zinc-300">&ldquo;{quote}&rdquo;</p>
        {scene.pillars && scene.pillars.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {scene.pillars.map((p) => (
              <span
                key={p}
                className={cn(
                  "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                )}
                style={{
                  borderColor: `${PILLAR_COLORS[p]}66`,
                  color: PILLAR_COLORS[p],
                  backgroundColor: `${PILLAR_COLORS[p]}14`,
                }}
              >
                {PILLAR_LABELS[p]}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
