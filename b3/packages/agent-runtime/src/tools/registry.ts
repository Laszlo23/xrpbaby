import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { AgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { enforceToolAcl } from "./acl.js";
import {
  baseRpcUrl,
  chainId,
  contractsEnv,
  publicAppOrigin,
  repoRoot,
  slackWebhookUrl,
  strapiApiToken,
  strapiUrl,
} from "../env.js";
import { createClients, readMintsToday, resolveCampaign } from "../chain-ags.js";
import { postSlackMessage } from "../slack.js";
import { fetchCommunityProfiles } from "../strapi-profiles.js";
import { signAndSend, type WalletTier } from "../wallet/service.js";

const execFileAsync = promisify(execFile);

export type ToolContext = {
  agent: AgentRecord;
  dbUrl: string;
  args?: Record<string, unknown>;
};

export type ToolResult = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
  ledger?: Partial<LedgerInsert>;
  costUsd?: number;
  gasEth?: number;
};

export type ToolFn = (ctx: ToolContext) => Promise<ToolResult>;

async function runShell(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs = 600_000,
): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, PATH: process.env.PATH ?? "/usr/bin:/bin" },
    });
    return { stdout: String(stdout), stderr: String(stderr), code: 0 };
  } catch (e: unknown) {
    const err = e as { code?: number; stdout?: string; stderr?: string; message?: string };
    return {
      stdout: String(err.stdout ?? ""),
      stderr: String(err.stderr ?? err.message ?? ""),
      code: typeof err.code === "number" ? err.code : 1,
    };
  }
}

const TOOL_REGISTRY: Record<string, ToolFn> = {
  "chain.read_stats": async () => {
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
    return { ok: true, data: { mintsToday, chainId: cid } };
  },

  "chain.write_tx": async (ctx) => {
    const tier = (ctx.args?.walletTier as WalletTier) ?? "ops";
    const to = ctx.args?.to as `0x${string}` | undefined;
    const valueWei = ctx.args?.valueWei as bigint | string | undefined;
    if (!to) return { ok: false, error: "missing_to_address" };
    const result = await signAndSend({
      walletTier: tier,
      to,
      valueWei: valueWei ?? 0n,
      data: ctx.args?.data as `0x${string}` | undefined,
      agentId: ctx.agent.id,
      dbUrl: ctx.dbUrl,
    });
    return {
      ok: result.ok,
      data: { txHash: result.txHash, dryRun: result.dryRun },
      error: result.error,
      gasEth: result.gasEth,
      ledger: {
        action: "chain.write_tx",
        txHash: result.txHash ?? null,
        dryRun: result.dryRun,
        status: result.ok ? "ok" : "error",
        errorMsg: result.error ?? null,
      },
    };
  },

  "ops.slack.post": async (ctx) => {
    const hook = slackWebhookUrl();
    const text = String(ctx.args?.text ?? "");
    if (!hook) return { ok: false, error: "no_slack_webhook" };
    if (!text) return { ok: false, error: "empty_message" };
    try {
      await postSlackMessage(hook, text);
      return { ok: true, data: { posted: true } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  "pulse.metrics": async () => {
    const base = publicAppOrigin();
    if (!base) return { ok: false, error: "no_app_origin" };
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/pulse/metrics`);
      const data = (await res.json()) as Record<string, unknown>;
      return { ok: res.ok, data: { status: res.status, metrics: data } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  "market.bcc": async () => {
    const base = publicAppOrigin();
    if (!base) return { ok: false, error: "no_app_origin" };
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/market/bcc`);
      const data = (await res.json()) as Record<string, unknown>;
      return { ok: res.ok, data: { status: res.status, market: data } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  "marketing.post_x": async (ctx) => {
    const root = repoRoot();
    const text = String(ctx.args?.text ?? "");
    if (!text) return { ok: false, error: "empty_post_text" };
    const scriptPath = `${root}/app/scripts/x-marketing-post.mjs`;
    const result = await runShell("node", [scriptPath, text], root, 120_000);
    return {
      ok: result.code === 0,
      data: { stdout: result.stdout.slice(0, 500), code: result.code },
      error: result.code !== 0 ? result.stderr.slice(0, 500) : undefined,
    };
  },

  "smoke.production": async () => {
    const root = repoRoot();
    const base = publicAppOrigin();
    if (!base) return { ok: false, error: "no_app_origin" };
    const result = await runShell(
      "bash",
      [`${root}/scripts/production-smoke.sh`, base],
      root,
      180_000,
    );
    return {
      ok: result.code === 0,
      data: { stdout: result.stdout.slice(0, 1000), code: result.code },
      error: result.code !== 0 ? result.stderr.slice(0, 500) : undefined,
    };
  },

  "deploy.app": async (ctx) => {
    const root = repoRoot();
    const smoke = await TOOL_REGISTRY["smoke.production"]!({ ...ctx, args: {} });
    if (!smoke.ok && process.env.AGENT_SKIP_PRE_DEPLOY_SMOKE !== "1") {
      return { ok: false, error: "pre_deploy_smoke_failed", data: smoke.data };
    }
    const sync = await runShell("bash", [`${root}/scripts/sync-deploy-env.sh`], root);
    if (sync.code !== 0) {
      return { ok: false, error: "sync_deploy_env_failed", data: { stderr: sync.stderr } };
    }
    const deploy = await runShell("bash", [`${root}/scripts/deploy-ssh.sh`], root, 900_000);
    const postSmoke = await TOOL_REGISTRY["smoke.production"]!({ ...ctx, args: {} });
    return {
      ok: deploy.code === 0 && postSmoke.ok,
      data: {
        deployCode: deploy.code,
        postSmokeOk: postSmoke.ok,
        deployStdout: deploy.stdout.slice(0, 500),
      },
      error: deploy.code !== 0 ? deploy.stderr.slice(0, 500) : postSmoke.error,
      costUsd: 0,
    };
  },

  "deploy.full_stack": async (ctx) => {
    const root = repoRoot();
    await runShell("bash", [`${root}/scripts/sync-deploy-env.sh`], root);
    const deploy = await runShell("bash", [`${root}/scripts/deploy-full-stack.sh`], root, 1_200_000);
    const postSmoke = await TOOL_REGISTRY["smoke.production"]!({ ...ctx, args: {} });
    return {
      ok: deploy.code === 0 && postSmoke.ok,
      data: { deployCode: deploy.code, postSmokeOk: postSmoke.ok },
      error: deploy.code !== 0 ? deploy.stderr.slice(0, 500) : postSmoke.error,
    };
  },

  "deploy.contracts": async (ctx) => {
    const root = repoRoot();
    const script = String(ctx.args?.script ?? "script/DeployAgentId.s.sol:DeployAgentId");
    const broadcastArgs = ["script", script, "--rpc-url", baseRpcUrl(), "--broadcast", "-vv"];
    const deploy = await runShell("forge", broadcastArgs, `${root}/contracts`, 600_000);
    if (deploy.code !== 0) {
      return { ok: false, error: deploy.stderr.slice(0, 500), data: { code: deploy.code } };
    }
    await runShell("npm", ["run", "contracts:sdk"], root);
    return {
      ok: true,
      data: { script, stdout: deploy.stdout.slice(0, 500) },
      costUsd: Number(process.env.AGENT_DEPLOY_COST_USD_ESTIMATE ?? "5"),
    };
  },

  "git.pull": async () => {
    const root = repoRoot();
    const branch = process.env.AGENT_GIT_BRANCH?.trim() || "main";
    const result = await runShell("git", ["pull", "origin", branch], root, 120_000);
    return {
      ok: result.code === 0,
      data: { branch, stdout: result.stdout.slice(0, 300) },
      error: result.code !== 0 ? result.stderr.slice(0, 300) : undefined,
    };
  },

  "wallet.fund_ops": async (ctx) => {
    return TOOL_REGISTRY["chain.write_tx"]!({
      ...ctx,
      args: {
        walletTier: "deployer",
        to: process.env.AGENT_OPS_WALLET_ADDRESS ?? "0x59F6310f3D0eD4520Efba7Bc1c770A87aD333e0a",
        valueWei: ctx.args?.valueWei ?? "1000000000000000",
      },
    });
  },

  "wallet.deployer": async (ctx) => {
    return TOOL_REGISTRY["chain.write_tx"]!({
      ...ctx,
      args: { ...ctx.args, walletTier: "deployer" },
    });
  },

  "ops.strapi.write": async (ctx) => {
    const su = strapiUrl();
    const token = strapiApiToken();
    if (!su || !token) return { ok: false, error: "strapi_not_configured" };
    const path = String(ctx.args?.path ?? "/api/articles");
    const body = ctx.args?.body ?? {};
    try {
      const res = await fetch(`${su.replace(/\/$/, "")}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, data: { status: res.status, body: data } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  "indexer.read": async (_ctx) => {
    return { ok: true, data: { note: "indexer aggregates via leaderboard-updater handler" } };
  },

  "http.x402": async () => {
    const base = publicAppOrigin();
    if (!base) return { ok: false, error: "no_app_origin" };
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/x402/premium`, {
        method: "HEAD",
        redirect: "manual",
      });
      return { ok: res.ok || res.status === 405, data: { status: res.status } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  "inference.0g": async (ctx) => {
    const { runAgentLlm } = await import("../llm/run.js");
    const prompt = String(ctx.args?.prompt ?? "Reply with OK if 0G inference is reachable.");
    const result = await runAgentLlm(ctx.dbUrl, ctx.agent, prompt);
    return {
      ok: result.ok,
      data: { source: result.source, preview: result.text.slice(0, 200) },
      error: result.error,
      costUsd: result.costUsd,
    };
  },

  "strapi.read_profiles": async () => {
    const su = strapiUrl();
    if (!su) return { ok: false, error: "strapi_not_configured" };
    try {
      const profiles = await fetchCommunityProfiles(su, strapiApiToken());
      return { ok: true, data: { count: profiles.length } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export function getToolIds(): string[] {
  return Object.keys(TOOL_REGISTRY);
}

export async function runTool(
  agent: AgentRecord,
  dbUrl: string,
  toolId: string,
  args?: Record<string, unknown>,
): Promise<ToolResult> {
  const acl = enforceToolAcl(agent, toolId);
  if (!acl.ok) return { ok: false, error: acl.reason };
  const fn = TOOL_REGISTRY[toolId];
  if (!fn) return { ok: false, error: `unknown_tool:${toolId}` };
  return fn({ agent, dbUrl, args });
}

export { TOOL_REGISTRY };
