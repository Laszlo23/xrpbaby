/** Server-only Quidli / Quidli Connect credentials — never expose as VITE_*. */

const BCC_BASE = "0xb890a5289f789f1346032ccc1847939e855fab07";

export function quidliApiKey(): string | undefined {
  return process.env.QUIDLI_API_KEY?.trim() || process.env.QUIDLY_API_KEY?.trim() || undefined;
}

export function quidliApiBase(): string {
  return process.env.QUIDLI_API_BASE?.trim().replace(/\/$/, "") || "https://connect.quid.li/api";
}

export function quidliSendPath(): string {
  return process.env.QUIDLI_SEND_PATH?.trim() || "/v1/connect/send";
}

export function quidliRewardTokenAddress(): string {
  return process.env.QUIDLI_REWARD_TOKEN_ADDRESS?.trim().toLowerCase() || BCC_BASE;
}

export function quidliRewardChainId(): number {
  const n = Number(process.env.QUIDLI_REWARD_CHAIN_ID ?? "8453");
  return Number.isFinite(n) && n > 0 ? n : 8453;
}

/** Default drop size in wei (1 BCC with 18 decimals). */
export function quidliDefaultAmountWei(): string {
  return process.env.QUIDLI_DEFAULT_AMOUNT_WEI?.trim() || "1000000000000000000";
}

export function quidliDailySendCapUsd(): number {
  const n = Number(process.env.QUIDLI_DAILY_SEND_CAP_USD ?? "50");
  return Number.isFinite(n) && n > 0 ? n : 50;
}

export function quidliMaxPerRecipientUsd(): number {
  const n = Number(process.env.QUIDLI_MAX_PER_RECIPIENT_USD ?? "5");
  return Number.isFinite(n) && n > 0 ? n : 5;
}

export function quidliGrantBountyUrl(): string | undefined {
  return (
    process.env.QUIDLI_GRANT_BOUNTY_URL?.trim() ||
    process.env.QUIDLI_BOUNTY_URL?.trim() ||
    undefined
  );
}

export function quidliWebhookConfigured(): boolean {
  return Boolean(quidliApiKey());
}

export function quidliRewardConfigured(): boolean {
  return Boolean(quidliApiKey() && quidliRewardTokenAddress());
}

export function quidliPublicWebhookUrl(origin?: string): string | undefined {
  const base =
    origin?.trim() || process.env.PUBLIC_APP_ORIGIN?.trim() || process.env.VITE_APP_ORIGIN?.trim();
  if (!base) return undefined;
  return `${base.replace(/\/$/, "")}/api/webhooks/quidli`;
}
