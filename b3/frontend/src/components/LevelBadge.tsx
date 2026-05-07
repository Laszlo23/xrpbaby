const levels = [
  { name: "Rookie", min: 0, color: "text-muted-foreground" },
  { name: "Builder", min: 500, color: "text-neon" },
  { name: "Architect", min: 2000, color: "text-emerald" },
  { name: "Visionary", min: 5000, color: "text-gold" },
  { name: "Legend", min: 15000, color: "text-gold text-glow-gold" },
];

export function getLevel(xp: number) {
  let current = levels[0];
  for (const l of levels) {
    if (xp >= l.min) current = l;
  }
  const idx = levels.indexOf(current);
  const next = levels[idx + 1];
  const progress = next ? ((xp - current.min) / (next.min - current.min)) * 100 : 100;
  return { ...current, level: idx + 1, progress, nextMin: next?.min ?? current.min };
}

export function LevelBadge({ xp, className = "" }: { xp: number; className?: string }) {
  const lvl = getLevel(xp);
  return (
    <span
      className={`text-xs font-heading font-bold uppercase tracking-widest ${lvl.color} ${className}`.trim()}
    >
      Lv{lvl.level} {lvl.name}
    </span>
  );
}
