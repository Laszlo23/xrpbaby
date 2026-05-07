import { z } from "zod";

const baseAgent = z.object({
  id: z.string(),
  /** Maps to `HANDLER_REGISTRY` in `src/handlers/registry.ts`. */
  handler: z.string(),
  role: z.string(),
  systemPrompt: z.string(),
  tools: z.array(z.string()),
  dailyApiBudgetUsd: z.number().nonnegative().optional(),
});

export const opsAgentSchema = baseAgent.extend({
  fleet: z.literal("ops"),
});

/** Same privileges as ops; used for non-ops product agents (e.g. concierge). */
export const productAgentSchema = baseAgent.extend({
  fleet: z.literal("product"),
});

export const econAgentSchema = baseAgent.extend({
  fleet: z.literal("econ"),
  walletAddress: z.string().optional(),
  signerSource: z.enum(["env_private_key", "age_file"]).optional(),
  dailyGasCapWei: z.string().optional(),
  perTxAgsCap: z.number().int().nonnegative(),
  monthlyAgsCap: z.number().int().nonnegative(),
  allowedContracts: z.array(z.string()),
  agentTypeId: z.number().int().min(0).max(255),
  maxRecipientsPerTick: z.number().int().positive().optional(),
});

export type OpsAgentRecord = z.infer<typeof opsAgentSchema>;
export type ProductAgentRecord = z.infer<typeof productAgentSchema>;
export type EconAgentRecord = z.infer<typeof econAgentSchema>;
export type AgentRecord = OpsAgentRecord | ProductAgentRecord | EconAgentRecord;

export const agentRecordSchema = z.discriminatedUnion("fleet", [
  opsAgentSchema,
  productAgentSchema,
  econAgentSchema,
]);

export const agentsFileSchema = z.object({
  agents: z.array(agentRecordSchema),
});

export type AgentsFile = z.infer<typeof agentsFileSchema>;
