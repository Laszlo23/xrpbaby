/** Culture Pulse env helpers (server-only). */

export function envFlag(name: string, defaultOn = false): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (!v) return defaultOn;
  return v === "1" || v === "true" || v === "yes";
}

export const pulseStreamFlags = () => ({
  farcaster: Boolean(process.env.NEYNAR_API_KEY?.trim()),
  x: Boolean(
    process.env.X_CONSUMER_KEY?.trim() &&
      process.env.X_ACCESS_TOKEN?.trim(),
  ),
  facebook: envFlag("FACEBOOK_STREAM"),
  tiktok: envFlag("TIKTOK_STREAM"),
  instagram: envFlag("INSTAGRAM_STREAM"),
});

export function pulseAdminSecret(): string | undefined {
  return process.env.PULSE_ADMIN_SECRET?.trim();
}

export function pulseAttestChainId(): number {
  const raw = process.env.PULSE_ATTEST_CHAIN_ID?.trim();
  if (raw) return Number.parseInt(raw, 10);
  return 8453;
}

export function pulseAnchorAddress(): `0x${string}` | undefined {
  const a = process.env.PULSE_ANCHOR_ADDRESS?.trim();
  if (a && /^0x[a-fA-F0-9]{40}$/.test(a)) return a as `0x${string}`;
  return undefined;
}

export function pulseAttestPrivateKey(): `0x${string}` | undefined {
  const k =
    process.env.PULSE_ATTEST_PRIVATE_KEY?.trim() ??
    process.env.PRIVATE_KEY?.trim();
  if (k && /^0x[a-fA-F0-9]{64}$/.test(k)) return k as `0x${string}`;
  return undefined;
}

export function pulsePublicOrigin(): string {
  return (
    process.env.PUBLIC_APP_ORIGIN?.trim() ??
    process.env.VITE_PLATFORM_ORIGIN?.trim() ??
    "http://localhost:5173"
  ).replace(/\/$/, "");
}
