import { getServerPublicOrigin } from "@/lib/app-origin";

export function groveMarketingAdminSecret(): string | undefined {
  return (
    process.env.GROVE_MARKETING_ADMIN_SECRET?.trim() || process.env.X_MARKETING_ADMIN_SECRET?.trim()
  );
}

export function groveAutoPostEnabled(): boolean {
  const v = process.env.GROVE_AUTO_POST?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function envFlag(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function grovePublicOrigin(): string {
  const raw =
    process.env.GROVE_PUBLIC_ORIGIN?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_APP_ORIGIN?.trim();
  return (raw || getServerPublicOrigin()).replace(/\/$/, "");
}

export function groveAgentRef(): string {
  return process.env.GROVE_AGENT_REF?.trim() || "grove";
}

export function groveSlackWebhookUrl(): string | undefined {
  return (
    process.env.GROVE_SLACK_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim() ||
    process.env.AGENT_SLACK_WEBHOOK_URL?.trim()
  );
}

export function groveNeynarSignerUuid(): string | undefined {
  return process.env.GROVE_NEYNAR_SIGNER_UUID?.trim();
}

export function groveFarcasterChannelId(): string | undefined {
  return process.env.GROVE_FARCASTER_CHANNEL_ID?.trim();
}

/** Max posts per calendar day (X + Farcaster combined publish attempts). */
export function groveDailyPostCap(): number {
  const profile = groveScheduleProfile();
  const fallback = profile === "daily" ? 1 : 6;
  const n = Number(process.env.GROVE_DAILY_POST_CAP ?? String(fallback));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : fallback;
}

export function grovePostCooldownMinutes(): number {
  const profile = groveScheduleProfile();
  const fallback = profile === "daily" ? 1320 : 180;
  const n = Number(process.env.GROVE_POST_COOLDOWN_MINUTES ?? String(fallback));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 24 * 60) : fallback;
}

export function grovePublishingPaused(): boolean {
  return envFlag("GROVE_PUBLISHING_PAUSED") || envFlag("AGENTS_PAUSED");
}

export function groveXEnabled(): boolean {
  return !envFlag("GROVE_DISABLE_X");
}

export function groveFarcasterEnabled(): boolean {
  return !envFlag("GROVE_DISABLE_FARCASTER");
}

export function groveTelegramEnabled(): boolean {
  return !envFlag("GROVE_DISABLE_TELEGRAM");
}

export function groveScheduleProfile(): "daily" | "legacy_4h" {
  const profile = (process.env.GROVE_SCHEDULE_PROFILE || "legacy_4h").trim().toLowerCase();
  return profile === "daily" ? "daily" : "legacy_4h";
}
