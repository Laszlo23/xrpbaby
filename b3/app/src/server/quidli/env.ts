/** Server-only Quidli / Quidli Connect credentials — never expose as VITE_*. */

export function quidliApiKey(): string | undefined {
  return (
    process.env.QUIDLI_API_KEY?.trim() ||
    process.env.QUIDLY_API_KEY?.trim() ||
    undefined
  );
}

export function quidliWebhookConfigured(): boolean {
  return Boolean(quidliApiKey());
}

export function quidliPublicWebhookUrl(origin?: string): string | undefined {
  const base =
    origin?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_APP_ORIGIN?.trim();
  if (!base) return undefined;
  return `${base.replace(/\/$/, "")}/api/webhooks/quidli`;
}
