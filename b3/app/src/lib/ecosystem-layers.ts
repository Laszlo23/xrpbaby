import {
  Bot,
  Compass,
  Fingerprint,
  Gamepad2,
  Home,
  Layers,
  Palette,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export const LAYER_ICONS: Record<string, LucideIcon> = {
  vision: Compass,
  core: Layers,
  living: Home,
  identity: Fingerprint,
  art: Palette,
  ai: Bot,
  engagement: Gamepad2,
  growth: Rocket,
};

export const LAYER_ACCENT: Record<string, string> = {
  vision: "#C47C59",
  core: "#00E5FF",
  living: "#839788",
  identity: "#C5FF41",
  art: "#C47C59",
  ai: "#00E5FF",
  engagement: "#C5FF41",
  growth: "#839788",
};

export function getLayerIcon(layer: string): LucideIcon {
  return LAYER_ICONS[layer] ?? Layers;
}

export function getLayerAccent(layer: string): string {
  return LAYER_ACCENT[layer] ?? "#00E5FF";
}
