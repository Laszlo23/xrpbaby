import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { postSlackMessage } from "../slack.js";
import { slackWebhookUrl } from "../env.js";

function groveTickUrl(): string | undefined {
  const explicit = process.env.GROVE_TICK_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const origin =
    process.env.GROVE_PUBLIC_ORIGIN?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_APP_ORIGIN?.trim();
  if (!origin) return undefined;
  return `${origin.replace(/\/$/, "")}/api/marketing/grove/tick`;
}

function groveAdminSecret(): string | undefined {
  return (
    process.env.GROVE_MARKETING_ADMIN_SECRET?.trim() ||
    process.env.X_MARKETING_ADMIN_SECRET?.trim()
  );
}

export async function runGroveMarketingTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  const url = groveTickUrl();
  const secret = groveAdminSecret();
  const dryRunEnv = process.env.GROVE_AUTO_POST?.trim().toLowerCase();
  const autoPost = dryRunEnv === "1" || dryRunEnv === "true" || dryRunEnv === "yes";

  if (!url || !secret) {
    const hook = slackWebhookUrl();
    const msg = [
      `*[Grove]* agent tick skipped`,
      `• tickUrl: ${url ?? "unset (set PUBLIC_APP_ORIGIN or GROVE_TICK_URL)"}`,
      `• secret: ${secret ? "set" : "unset"}`,
      `• agent: \`${agent.id}\``,
      `• tip: run \`npm run grove:tick\` on the app host for direct cron`,
    ].join("\n");
    if (hook) {
      try {
        await postSlackMessage(hook, msg);
      } catch {
        /* ignore */
      }
    }
    return {
      agentId: agent.id,
      action: "marketing.grove_skipped",
      params: { url: url ?? null, hasSecret: Boolean(secret) },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: "grove_tick_url_or_secret_missing",
      costUsd: null,
    };
  }

  let payload: Record<string, unknown> = {};
  let httpStatus = 0;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-grove-marketing-admin-secret": secret,
      },
      body: JSON.stringify({ dryRun: !autoPost }),
      signal: AbortSignal.timeout(120_000),
    });
    httpStatus = res.status;
    payload = (await res.json()) as Record<string, unknown>;
  } catch (e) {
    return {
      agentId: agent.id,
      action: "marketing.grove_tick",
      params: { url, autoPost },
      dryRun: !autoPost,
      status: "error",
      txHash: null,
      errorMsg: e instanceof Error ? e.message : String(e),
      costUsd: null,
    };
  }

  const ok = payload.ok === true;
  return {
    agentId: agent.id,
    action: "marketing.grove_tick",
    params: {
      url,
      autoPost,
      httpStatus,
      pillar: payload.pillar,
      x: payload.x,
      farcaster: payload.farcaster,
      slack: payload.slack,
    },
    dryRun: !autoPost,
    status: ok ? "ok" : "error",
    txHash: null,
    errorMsg: ok ? null : JSON.stringify(payload.x ?? payload),
    costUsd: null,
  };
}
