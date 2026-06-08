import type { AgentRecord } from "../types.js";

const BLOCKED_TOOLS = new Set(["treasury.safe"]);

export function enforceToolAcl(
  agent: AgentRecord,
  toolId: string,
): { ok: true } | { ok: false; reason: string } {
  if (BLOCKED_TOOLS.has(toolId)) {
    return { ok: false, reason: "tool_blocked_by_policy" };
  }
  const tools = agent.tools ?? [];
  if (tools.includes("*")) return { ok: true };
  if (tools.includes(toolId)) return { ok: true };
  return { ok: false, reason: `tool_not_allowed:${toolId}` };
}

export function listAllowedTools(agent: AgentRecord): string[] {
  if (agent.tools?.includes("*")) return ["*"];
  return agent.tools ?? [];
}
