/** POST JSON to ADMIN_RISK_WEBHOOK_URL when risk crosses threshold. Fire-and-forget. */
export async function notifyRiskWebhook(payload: {
  score: number;
  flags: string[];
  mode: string;
  userMessageHash: string;
}): Promise<void> {
  const url = process.env.ADMIN_RISK_WEBHOOK_URL;
  if (!url) return;
  const min = Number(process.env.ADMIN_RISK_WEBHOOK_MIN_SCORE ?? "75");
  if (payload.score < min) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "ogchain-web",
        ...payload,
        t: new Date().toISOString(),
      }),
    });
  } catch {
    /* non-fatal */
  }
}
