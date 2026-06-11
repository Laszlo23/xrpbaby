import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { postSlackMessage } from "../slack.js";
import { slackWebhookUrl } from "../env.js";

function socialCampaignTickUrl(): string | undefined {
  const explicit = process.env.SOCIAL_CAMPAIGN_TICK_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const origin =
    process.env.SOCIAL_CAMPAIGN_PUBLIC_ORIGIN?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_APP_ORIGIN?.trim();
  if (!origin) return undefined;
  return `${origin.replace(/\/$/, "")}/api/marketing/social-campaign/tick`;
}

function socialCampaignAdminSecret(): string | undefined {
  return (
    process.env.SOCIAL_CAMPAIGN_ADMIN_SECRET?.trim() ||
    process.env.X_MARKETING_ADMIN_SECRET?.trim()
  );
}

export async function runSocialCampaignAgentTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  const url = socialCampaignTickUrl();
  const secret = socialCampaignAdminSecret();
  const dryRunEnv = process.env.SOCIAL_CAMPAIGN_AUTO_POST?.trim().toLowerCase();
  const autoPost = dryRunEnv === "1" || dryRunEnv === "true" || dryRunEnv === "yes";

  if (!url || !secret) {
    const hook = slackWebhookUrl();
    const msg = [
      `*[SocialCampaign]* agent tick skipped`,
      `• tickUrl: ${url ?? "unset (set PUBLIC_APP_ORIGIN or SOCIAL_CAMPAIGN_TICK_URL)"}`,
      `• secret: ${secret ? "set" : "unset"}`,
      `• agent: \`${agent.id}\``,
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
      action: "marketing.social_campaign_skipped",
      params: { url: url ?? null, hasSecret: Boolean(secret) },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: "social_campaign_tick_url_or_secret_missing",
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
        "x-social-campaign-admin-secret": secret,
      },
      body: JSON.stringify({ dryRun: !autoPost }),
      signal: AbortSignal.timeout(120_000),
    });
    httpStatus = res.status;
    payload = (await res.json()) as Record<string, unknown>;
  } catch (e) {
    return {
      agentId: agent.id,
      action: "marketing.social_campaign_tick",
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
    action: "marketing.social_campaign_tick",
    params: {
      url,
      autoPost,
      httpStatus,
      assetId: payload.assetId,
      account: payload.account,
      x: payload.x,
      imageUrl: payload.imageUrl,
    },
    dryRun: !autoPost,
    status: ok ? "ok" : "error",
    txHash: null,
    errorMsg: ok ? null : JSON.stringify(payload.x ?? payload),
    costUsd: null,
  };
}
