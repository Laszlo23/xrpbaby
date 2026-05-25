// Centralized design tokens for The Founding Builders.
export const colors = {
  bg: "#0A0A0A",
  surface: "#141414",
  surfaceElevated: "#1F1F22",
  glass: "rgba(20, 20, 22, 0.72)",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  gold: "#FFD700",
  goldDeep: "#B8860B",
  emerald: "#50C878",
  emeraldDeep: "#059669",
  blue: "#89CFF0",
  blueDeep: "#3B82F6",
  charcoal: "#1A1A1A",
  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textMuted: "#52525B",
  textInverse: "#000000",
  danger: "#EF4444",
  warning: "#F59E0B",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

export const shadows = {
  gold: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  emerald: {
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  surface: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const VILLAGE_IMAGES = {
  abandoned:
    "https://static.prod-images.emergentagent.com/jobs/5c4a8477-0624-4b0c-9ea6-2251c4236bbc/images/b580d75b7dae65229582b58b0c5885d36aa8b8286aeb2e6df5d56bb140527464.png",
  thriving:
    "https://static.prod-images.emergentagent.com/jobs/5c4a8477-0624-4b0c-9ea6-2251c4236bbc/images/b707a86ed49f9cc41dbb05ae88afe35617b353e70a613186d0200ff3d86bc81c.png",
  mayor:
    "https://static.prod-images.emergentagent.com/jobs/5c4a8477-0624-4b0c-9ea6-2251c4236bbc/images/855af00ba2ac1959fbaf54bc38cb7c6cdfe450708789d05493ff6a3476a27627.png",
  founderKey:
    "https://static.prod-images.emergentagent.com/jobs/5c4a8477-0624-4b0c-9ea6-2251c4236bbc/images/1061e049a5bd9f034cf8c7be4c951b7c9d5e7fbd3fbebb1165e792b41038368d.png",
  mysteryBox:
    "https://static.prod-images.emergentagent.com/jobs/5c4a8477-0624-4b0c-9ea6-2251c4236bbc/images/260bc3ebee955bb7f92786f9e0ce5b201db80a5d7600fa51977e2e2c5d44f782.png",
  spinWheel:
    "https://static.prod-images.emergentagent.com/jobs/5c4a8477-0624-4b0c-9ea6-2251c4236bbc/images/aa3ee79d5237d596109dada0ca985b4e4b5339d2350a24cbd6307a2d91863373.png",
};

export const KEY_COLORS: Record<string, string> = {
  builder: colors.blue,
  culture: colors.emerald,
  vision: "#A78BFA",
  founder: colors.gold,
};
