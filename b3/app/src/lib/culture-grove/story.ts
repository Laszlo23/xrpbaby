import { GROVE_ELDER_THRESHOLD } from "./types";

/** Mystic copy for Culture Grove DNA — rotates by tree depth and invite progress. */
export function groveOriginStory(
  directCount: number,
  totalDescendants: number,
  isGroveElder = false,
): string {
  if (isGroveElder || totalDescendants >= GROVE_ELDER_THRESHOLD) {
    return "Grove Elder status — your branches span the forest. Eight souls or more echo your Culture DNA across the grove.";
  }
  if (directCount === 0) {
    return "Every grove begins as a single seed in the dark. Two friends awaken the first branch — and the Culture DNA starts to hum.";
  }
  if (directCount === 1) {
    return "One seed has taken root. The grove senses another soul nearby — invite one more friend to unlock the Twin Bloom.";
  }
  if (directCount >= 2 && totalDescendants < 4) {
    return "Twin Bloom achieved. Your DNA now echoes through the forest — watch your friends plant their own seeds.";
  }
  if (totalDescendants >= 4) {
    return "The grove spreads beyond sight. Connections dedupe into a living map — each bubble a builder who chose your path.";
  }
  return "Branches multiply. The Culture grows when builders bring builders — your tree is alive.";
}

export function groveMilestoneLabel(directCount: number, isGroveElder = false): string {
  if (isGroveElder) return "Grove Elder";
  if (directCount >= 2) return "Twin Bloom unlocked";
  if (directCount === 1) return "First seed planted";
  return "Awaken your grove";
}

export const GROVE_INVITE_TARGET = 2;
