import { readFile } from "node:fs/promises";
import path from "node:path";
import { agentsFileSchema, type AgentRecord } from "./types.js";

export async function loadAgentsFile(configPath?: string): Promise<AgentRecord[]> {
  const p =
    configPath?.trim() ||
    process.env.AGENTS_CONFIG_PATH?.trim() ||
    path.resolve(process.cwd(), "ops/agents.json");
  const raw = await readFile(p, "utf-8");
  const parsed = agentsFileSchema.parse(JSON.parse(raw));
  return parsed.agents;
}

export function findAgent(agents: AgentRecord[], id: string): AgentRecord | undefined {
  return agents.find((a) => a.id === id);
}
