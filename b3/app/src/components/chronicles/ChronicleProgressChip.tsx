import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useChronicleProgress } from "@/hooks/useChronicleProgress";
import { CHRONICLE_EDITION_COUNT } from "@/content/culture-chronicles";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function ChronicleProgressChip({ className = "", size = "sm" }: Props) {
  const { ownedCount, isFounder, isPending } = useChronicleProgress();

  const pad = size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-[11px]";
  const label = isFounder
    ? "Chronicle Founder"
    : ownedCount > 0
      ? `Chronicles ${ownedCount}/${CHRONICLE_EDITION_COUNT}`
      : "Culture Chronicles";

  return (
    <Link
      to="/chronicles"
      title="Culture Chronicles: Meme Edition"
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium uppercase tracking-wide transition ${pad} ${
        isFounder
          ? "border-[var(--vault-gold)]/50 bg-[var(--vault-gold)]/15 text-[var(--vault-gold)]"
          : ownedCount > 0
            ? "border-violet-500/35 bg-violet-500/10 text-violet-200 hover:border-violet-400/50"
            : "border-white/15 bg-black/30 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
      } ${className}`}
    >
      <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {isPending ? "…" : label}
    </Link>
  );
}
