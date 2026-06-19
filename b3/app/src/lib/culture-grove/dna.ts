/** Deterministic hue 0–359 from a wallet address — powers bubble colors in the grove. */
export function dnaHueFromAddress(address: string): number {
  const hex = address.replace(/^0x/i, "").slice(0, 8);
  const n = Number.parseInt(hex || "0", 16);
  if (!Number.isFinite(n)) return 160;
  return n % 360;
}

export function dnaGradient(hue: number, alpha = 0.55): string {
  const h2 = (hue + 40) % 360;
  return `linear-gradient(135deg, hsla(${hue}, 85%, 55%, ${alpha}), hsla(${h2}, 70%, 45%, ${alpha}))`;
}

export function dnaGlow(hue: number): string {
  return `0 0 24px hsla(${hue}, 90%, 55%, 0.45)`;
}
