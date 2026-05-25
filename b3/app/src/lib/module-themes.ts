import type { LucideIcon } from "lucide-react";
import { Fingerprint, Globe, Palette, Sparkles, Zap } from "lucide-react";

export type ModuleThemeId = "pass" | "earth" | "signal" | "play" | "art";

export type ModuleTheme = {
  accent: string;
  gradient: string;
  icon: LucideIcon;
  eyebrow: string;
  heroClass: string;
};

export const moduleThemes: Record<ModuleThemeId, ModuleTheme> = {
  pass: {
    accent: "#C5FF41",
    gradient: "from-[#C5FF41]/20 via-transparent to-[#00E5FF]/15",
    icon: Fingerprint,
    eyebrow: "CULTURE LAYER",
    heroClass: "border-[#C5FF41]/30",
  },
  earth: {
    accent: "#839788",
    gradient: "from-[#839788]/25 via-transparent to-[#C5FF41]/10",
    icon: Globe,
    eyebrow: "EARTH LANE",
    heroClass: "border-[#839788]/35",
  },
  signal: {
    accent: "#C5FF41",
    gradient: "from-[#C5FF41]/15 via-transparent to-black",
    icon: Sparkles,
    eyebrow: "CULTURE PULSE",
    heroClass: "border-[#C5FF41]/35",
  },
  play: {
    accent: "#0052FF",
    gradient: "from-[#0052FF]/20 via-transparent to-amber-500/10",
    icon: Zap,
    eyebrow: "PLAY",
    heroClass: "border-neon/30",
  },
  art: {
    accent: "#C47C59",
    gradient: "from-[#C47C59]/20 via-transparent to-black",
    icon: Palette,
    eyebrow: "ART DROPS",
    heroClass: "border-[#C47C59]/35",
  },
};

export function getModuleTheme(id: ModuleThemeId): ModuleTheme {
  return moduleThemes[id];
}
