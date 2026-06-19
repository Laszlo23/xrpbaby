import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export type QuestBadge = {
  id: string;
  title: string;
  description: string;
  accent?: string;
};

type BadgeRevealModalProps = {
  open: boolean;
  badge: QuestBadge | null;
  onClose: () => void;
};

export function BadgeRevealModal({ open, badge, onClose }: BadgeRevealModalProps) {
  const accent = badge?.accent ?? "#C5FF41";

  return (
    <AnimatePresence>
      {open && badge ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-labelledby="badge-reveal-title"
            className="relative max-w-sm rounded-3xl border border-white/15 bg-zinc-950 p-8 text-center shadow-[0_0_80px_-20px_var(--vault-gold)]"
            style={{ boxShadow: `0 0 80px -20px ${accent}` }}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 0.6 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2"
              style={{ borderColor: accent, backgroundColor: `${accent}15` }}
            >
              <Sparkles className="h-10 w-10" style={{ color: accent }} />
            </motion.div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Badge unlocked
            </p>
            <h2 id="badge-reveal-title" className="mt-2 font-display text-2xl font-bold text-white">
              {badge.title}
            </h2>
            <p className="mt-3 text-sm text-zinc-400">{badge.description}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold text-black"
              style={{ backgroundColor: accent }}
            >
              Keep building →
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const QUEST_BADGES: QuestBadge[] = [
  {
    id: "builder-tapes-keeper",
    title: "Founder Voice",
    description: "Listened to all five Builder Tapes — real stories from Laszlo.",
    accent: "#00E5FF",
  },
  {
    id: "story-complete",
    title: "Story Keeper",
    description: "Completed a founding story quest arc.",
    accent: "#00E5FF",
  },
  {
    id: "grove-bloom",
    title: "Twin Bloom",
    description: "Invited two builders into your Culture DNA grove.",
    accent: "#C5FF41",
  },
  {
    id: "chronicle-founder",
    title: "Chronicle Founder",
    description: "Collected all Culture Chronicles chapters.",
    accent: "var(--vault-gold)",
  },
  {
    id: "whale-voice",
    title: "Brand Voice",
    description: "7M+ BCC holder — storytelling quest creator.",
    accent: "#A78BFA",
  },
];

export function questBadgeById(id: string): QuestBadge | undefined {
  return QUEST_BADGES.find((b) => b.id === id);
}
