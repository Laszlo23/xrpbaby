import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { repoRoot, publicAppOrigin } from "../env.js";
import { runTool } from "../tools/registry.js";

const execFileAsync = promisify(execFile);

async function gitRevParse(cwd: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd });
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function runDeployAppTick(
  agent: OpsAgentRecord,
  databaseUrl: string,
): Promise<LedgerInsert[]> {
  const root = repoRoot();
  const beforeSha = await gitRevParse(root);

  const gitResult = await runTool(agent, databaseUrl, "git.pull", {});
  if (!gitResult.ok) {
    return [
      {
        agentId: agent.id,
        action: "deploy.app",
        params: { phase: "git_pull", error: gitResult.error },
        dryRun: false,
        status: "error",
        errorMsg: gitResult.error ?? "git_pull_failed",
        txHash: null,
      },
    ];
  }

  try {
    await execFileAsync("npm", ["ci"], { cwd: root, timeout: 600_000 });
    await execFileAsync("npm", ["--prefix", "app", "run", "test:all"], {
      cwd: root,
      timeout: 900_000,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return [
      {
        agentId: agent.id,
        action: "deploy.app",
        params: { phase: "pre_deploy_tests", error: msg },
        dryRun: false,
        status: "error",
        errorMsg: msg,
        txHash: null,
      },
    ];
  }

  const deployResult = await runTool(agent, databaseUrl, "deploy.app", {});
  const base = publicAppOrigin();

  if (!deployResult.ok && beforeSha) {
    try {
      await execFileAsync("git", ["checkout", beforeSha], { cwd: root });
    } catch {
      /* best-effort rollback */
    }
  }

  return [
    {
      agentId: agent.id,
      action: "deploy.app",
      params: {
        beforeSha,
        origin: base || null,
        ...deployResult.data,
        rolledBack: !deployResult.ok && !!beforeSha,
      },
      dryRun: false,
      status: deployResult.ok ? "ok" : "error",
      errorMsg: deployResult.error ?? null,
      txHash: null,
      costUsd: deployResult.costUsd != null ? String(deployResult.costUsd) : null,
    },
  ];
}
