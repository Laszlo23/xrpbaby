import {
  Compass,
  Layers,
  Home,
  Fingerprint,
  Palette,
  Bot,
  Gamepad2,
  Rocket,
} from "lucide-react";

export const LAYER_ICONS = {
  vision: Compass,
  core: Layers,
  living: Home,
  identity: Fingerprint,
  art: Palette,
  ai: Bot,
  engagement: Gamepad2,
  growth: Rocket,
};

export const LAYER_ACCENT = {
  vision: "#C47C59",
  core: "#00E5FF",
  living: "#839788",
  identity: "#C5FF41",
  art: "#C47C59",
  ai: "#00E5FF",
  engagement: "#C5FF41",
  growth: "#839788",
};

export const getLayerIcon = (layer) => LAYER_ICONS[layer] || Layers;
export const getLayerAccent = (layer) => LAYER_ACCENT[layer] || "#00E5FF";
