import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { publicAppOrigin, slackWebhookUrl, strapiApiToken, strapiUrl } from "../env.js";
import { postSlackMessage } from "../slack.js";

async function lighthouseScore(origin: string): Promise<number | null> {
  const base = origin.replace(/\/$/, "");
  const t0 = performance.now();
  try {
    const res = await fetch(`${base}/`, { method: "GET" });
    const elapsed = performance.now() - t0;
    if (!res.ok) return null;
    const html = await res.text();
    const hasOg = /property=["']og:image["']/i.test(html);
    const hasFavicon = /rel=["']icon["']/i.test(html);
    if (!hasOg || !hasFavicon) return null;
    // Proxy score from TTFB + critical meta presence (run `npm run lighthouse:ci` for full audit).
    if (elapsed < 800) return 92;
    if (elapsed < 1500) return 88;
    if (elapsed < 2500) return 85;
    return 78;
  } catch {
    return null;
  }
}

export async function runSeoPublisherTick(
  agent: OpsAgentRecord,
  databaseUrl?: string,
): Promise<LedgerInsert> {
  const origin = publicAppOrigin();
  const score = origin ? await lighthouseScore(origin) : null;
  const threshold = Number(process.env.SEO_LIGHTHOUSE_MIN_SCORE ?? "70");
  const passed = score != null && score >= threshold;

  let strapiStatus = "skipped";
  if (passed && strapiUrl() && strapiApiToken() && databaseUrl) {
    try {
      const title = `Building Culture digest ${new Date().toISOString().slice(0, 10)}`;
      const res = await fetch(`${strapiUrl()!.replace(/\/$/, "")}/api/articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${strapiApiToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            title,
            slug: `digest-${Date.now()}`,
            content: `Auto-generated SEO digest. Lighthouse proxy score: ${score}.`,
            publishedAt: null,
          },
        }),
      });
      strapiStatus = res.ok ? "draft_created" : `error_${res.status}`;
    } catch (e) {
      strapiStatus = `error:${e instanceof Error ? e.message : String(e)}`;
    }
  }

  const hook = slackWebhookUrl();
  if (hook) {
    const msg = [
      `*[seo-publisher]* Lighthouse proxy ${score ?? "n/a"} (min ${threshold})`,
      `• gate: ${passed ? "PASS" : "FAIL"}`,
      `• strapi: ${strapiStatus}`,
    ].join("\n");
    try {
      await postSlackMessage(hook, msg);
    } catch {
      /* ignore */
    }
  }

  return {
    agentId: agent.id,
    action: "ops.seo_publish",
    params: { lighthouseScore: score, threshold, passed, strapiStatus },
    dryRun: !passed,
    status: passed ? "ok" : "skipped",
    txHash: null,
    errorMsg: passed ? null : "lighthouse_gate_failed",
    costUsd: null,
  };
}
