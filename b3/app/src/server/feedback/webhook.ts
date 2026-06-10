export async function notifyFeedbackWebhook(payload: {
  feedbackId: string;
  area: string;
  score: number;
  status: string;
  triedWhat: string;
  problem: string;
  pagePath?: string | null;
  memberId: string;
}): Promise<void> {
  const url = process.env.FEEDBACK_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "builder_voice_submission",
        feedbackId: payload.feedbackId,
        area: payload.area,
        qualityScore: payload.score,
        status: payload.status,
        pagePath: payload.pagePath,
        memberId: payload.memberId,
        excerpt: payload.problem.slice(0, 400),
        triedWhat: payload.triedWhat.slice(0, 200),
        t: new Date().toISOString(),
      }),
    });
  } catch {
    /* non-fatal */
  }
}
