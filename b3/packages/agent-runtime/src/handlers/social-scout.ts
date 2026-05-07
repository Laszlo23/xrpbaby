import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { createClients, readMintsToday, resolveCampaign } from "../chain-ags.js";
import { contractsEnv, chainId, baseRpcUrl, slackWebhookUrl } from "../env.js";
import { fetchCommunityProfiles } from "../strapi-profiles.js";
import { postSlackMessage } from "../slack.js";
import { strapiApiToken, strapiUrl } from "../env.js";

export async function runSocialScoutTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
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

  const text = [
    `*[social-scout]* Building Culture agent tick`,
    `• mintsToday (AGS campaign): ${mintsToday}`,
    `• community profiles (sample): ${profileCount}`,
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
    action: "ops.social_scout_ping",
    params: { mintsToday, profileCount, slackStatus },
    dryRun: true,
    status: slackStatus.startsWith("error") ? "error" : "ok",
    errorMsg: slackStatus.startsWith("error") ? slackStatus : null,
    txHash: null,
    costUsd: null,
  };
}
