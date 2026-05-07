import type { EconAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { defaultPolicy, filterEligibleRecipients, buildMonthlyMintCounts } from "../policy.js";
import { fetchCommunityProfiles } from "../strapi-profiles.js";
import { fetchMonthlyMintTransferRows, countAgentMonthlySuccessfulMints } from "../ledger-query.js";
import {
  createClients,
  mintAndTransferToRecipient,
  resolveCampaign,
  readMintPriceWei,
  readMintsToday,
  readDailyMintCap,
} from "../chain-ags.js";
import { contractsEnv, chainId, baseRpcUrl, econLive, agsDistributorPrivateKey, strapiUrl, strapiApiToken } from "../env.js";
import type { Address } from "viem";

export async function runAgsDistributorTick(
  agent: EconAgentRecord,
  databaseUrl: string,
): Promise<LedgerInsert[]> {
  const out: LedgerInsert[] = [];
  const env = contractsEnv();
  const cid = chainId();
  const rpc = baseRpcUrl();
  const live = econLive();
  const pk = agsDistributorPrivateKey();
  const chainDryRun = !live || !pk;

  const campaign = resolveCampaign(env, cid);
  if (!campaign) {
    return [
      {
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { error: "no_campaign_address" },
        dryRun: true,
        status: "error",
        errorMsg: "AgentShareCampaign address unresolved",
        txHash: null,
      },
    ];
  }

  if (!agent.allowedContracts.includes("AgentShareCampaign")) {
    return [
      {
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { skipped: "contract_not_allowlisted" },
        dryRun: true,
        status: "skipped",
        txHash: null,
      },
    ];
  }

  const monthlyAgentMints = await countAgentMonthlySuccessfulMints(databaseUrl, agent.id);
  if (monthlyAgentMints >= agent.monthlyAgsCap) {
    return [
      {
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { skipped: "monthly_agent_cap", monthlyAgentMints, cap: agent.monthlyAgsCap },
        dryRun: true,
        status: "skipped",
        txHash: null,
      },
    ];
  }

  const su = strapiUrl();
  if (!su) {
    return [
      {
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { skipped: "no_strapi_url" },
        dryRun: true,
        status: "skipped",
        errorMsg: "STRAPI_URL unset",
        txHash: null,
      },
    ];
  }

  const { publicClient, walletClient } = createClients(cid, rpc, chainDryRun ? undefined : pk);
  let mintPrice: bigint;
  let mintsToday: bigint;
  let dailyCap: bigint;
  try {
    mintPrice = await readMintPriceWei(publicClient, campaign);
    mintsToday = await readMintsToday(publicClient, campaign);
    dailyCap = await readDailyMintCap(publicClient, campaign);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return [
      {
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { error: "rpc_read_failed", campaign },
        dryRun: true,
        status: "skipped",
        errorMsg: msg.slice(0, 2000),
        txHash: null,
      },
    ];
  }

  if (mintsToday >= dailyCap) {
    return [
      {
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: {
          skipped: "daily_cap_chain",
          mintsToday: mintsToday.toString(),
          dailyCap: dailyCap.toString(),
        },
        dryRun: chainDryRun,
        status: "skipped",
        txHash: null,
      },
    ];
  }

  const profiles = await fetchCommunityProfiles(su, strapiApiToken());
  const ledgerRows = await fetchMonthlyMintTransferRows(databaseUrl);
  const monthlyByRecipient = buildMonthlyMintCounts(ledgerRows);

  const maxPerTick = agent.maxRecipientsPerTick ?? defaultPolicy.maxRecipientsPerTick;
  const perTick = Math.min(maxPerTick, agent.perTxAgsCap > 0 ? agent.perTxAgsCap : maxPerTick);
  const policy = { ...defaultPolicy, maxRecipientsPerTick: perTick };

  const eligible = filterEligibleRecipients(profiles, monthlyByRecipient, undefined, policy);
  if (eligible.length === 0) {
    return [
      {
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { note: "no_eligible_recipients" },
        dryRun: chainDryRun,
        status: "skipped",
        txHash: null,
      },
    ];
  }

  let successesThisTick = 0;
  const budgetLeft = () => agent.monthlyAgsCap - monthlyAgentMints - successesThisTick;

  for (const p of eligible) {
    if (budgetLeft() <= 0) break;
    const recipient = p.ownerAddress as Address;

    if (chainDryRun) {
      out.push({
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: {
          recipient,
          slug: p.slug,
          mintPriceWei: mintPrice.toString(),
          intent: "mint_then_safeTransferFrom",
          mode: !live ? "econ_live_false" : "missing_private_key",
        },
        dryRun: true,
        status: "ok",
        txHash: null,
      });
      continue;
    }

    if (!walletClient?.account) {
      out.push({
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { recipient, error: "no_wallet" },
        dryRun: false,
        status: "error",
        errorMsg: "walletClient missing",
        txHash: null,
      });
      break;
    }

    try {
      const { txHash, tokenId } = await mintAndTransferToRecipient({
        publicClient,
        walletClient,
        campaign,
        agent,
        recipient,
      });
      out.push({
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { recipient, slug: p.slug, tokenId: tokenId.toString(), mintPriceWei: mintPrice.toString() },
        dryRun: false,
        status: "ok",
        txHash,
      });
      successesThisTick += 1;
    } catch (e) {
      out.push({
        agentId: agent.id,
        action: "chain.ags_mint_transfer",
        params: { recipient, slug: p.slug },
        dryRun: false,
        status: "error",
        errorMsg: e instanceof Error ? e.message : String(e),
        txHash: null,
      });
    }
  }

  return out;
}
