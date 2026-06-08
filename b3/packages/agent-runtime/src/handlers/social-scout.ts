import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { createClients, readMintsToday, resolveCampaign } from "../chain-ags.js";
import { contractsEnv, chainId, baseRpcUrl, slackWebhookUrl, publicAppOrigin } from "../env.js";
import { fetchCommunityProfiles } from "../strapi-profiles.js";
import { postSlackMessage } from "../slack.js";
import { strapiApiToken, strapiUrl } from "../env.js";
import { runTool } from "../tools/registry.js";
import { runAgentLlm } from "../llm/run.js";

const DEFAULT_CTA = "https://app.buildingcultureid.space/join";

function buildSocialPost(mintsToday: string, profileCount: number, llmCopy?: string): string {
  if (llmCopy?.trim()) return llmCopy.trim().slice(0, 280);
  return [
    "Building Culture on Base — proof-first community growth.",
    `Forest signal: ${mintsToday} agent shares minted today · ${profileCount} builder profiles.`,
    `Join → ${DEFAULT_CTA}`,
  ].join("\n");
}

export async function runSocialScoutTick(
  agent: OpsAgentRecord,
  databaseUrl?: string,
): Promise<LedgerInsert> {
  const env = contractsEnv();
  const cid = chainId();
  const rpc = baseRpcUrl();
  const { publicClient } = createClients(cid, rpc);
  const campaign = resolveCampaign(env, cid);
  let mintsToday = "n/a";
  if (campaign) {
    try {
      mintsToday = (await readMintsToday(publicClient, campaign)).toString();
    } catch {
      mintsToday = "error";
    }
  }

  let profileCount = 0;
  const su = strapiUrl();
  if (su) {
    try {
      const profiles = await fetchCommunityProfiles(su, strapiApiToken());
      profileCount = profiles.length;
    } catch {
      profileCount = -1;
    }
  }

  let llmCopy: string | undefined;
  if (databaseUrl) {
    const llm = await runAgentLlm(
      databaseUrl,
      agent,
      `Write one X post (max 280 chars). Stats: mintsToday=${mintsToday}, profiles=${profileCount}. CTA: ${DEFAULT_CTA}`,
    );
    if (llm.ok) llmCopy = llm.text;
  }

  const postText = buildSocialPost(mintsToday, profileCount, llmCopy);
  let xStatus = "skipped";
  let xError: string | null = null;

  if (databaseUrl && process.env.SOCIAL_SCOUT_AUTO_POST === "1") {
    const xResult = await runTool(agent, databaseUrl, "marketing.post_x", { text: postText });
    xStatus = xResult.ok ? "posted" : `error:${xResult.error}`;
    xError = xResult.error ?? null;
  }

  const text = [
    `*[social-scout]* Building Culture agent tick`,
    `• mintsToday (AGS campaign): ${mintsToday}`,
    `• community profiles (sample): ${profileCount}`,
    `• X post: ${xStatus}`,
    `• agent: \`${agent.id}\``,
  ].join("\n");

  const hook = slackWebhookUrl();
  let slackStatus = "skipped_no_webhook";
  if (hook) {
    try {
      await postSlackMessage(hook, text);
      slackStatus = "posted";
    } catch (e) {
      slackStatus = `error:${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return {
    agentId: agent.id,
    action: "ops.social_scout",
    params: { mintsToday, profileCount, slackStatus, xStatus, postPreview: postText.slice(0, 120) },
    dryRun: xStatus !== "posted",
    status: slackStatus.startsWith("error") || xStatus.startsWith("error") ? "error" : "ok",
    errorMsg: xError ?? (slackStatus.startsWith("error") ? slackStatus : null),
    txHash: null,
    costUsd: null,
  };
}
