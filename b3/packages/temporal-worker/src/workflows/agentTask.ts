import { ApplicationFailure, proxyActivities } from "@temporalio/workflow";
import { planOrchestration } from "@bc/bcd-orchestration";

import type {
  AgentTaskWorkflowInput,
  AgentTaskWorkflowResult,
  ExecuteAgentTaskActivityInput,
} from "../agent-task-types.js";

const { executeAgentTask } = proxyActivities<{
  executeAgentTask: (input: ExecuteAgentTaskActivityInput) => Promise<AgentTaskWorkflowResult>;
}>({
  startToCloseTimeout: "5 minutes",
  retry: {
    initialInterval: "2 seconds",
    maximumAttempts: 5,
    backoffCoefficient: 2,
  },
});

export async function agentTaskWorkflow(
  input: AgentTaskWorkflowInput,
): Promise<AgentTaskWorkflowResult> {
  const plan = planOrchestration(input.taskKey);
  const candidates = [plan.primary, ...plan.backups];
  let lastMessage = "";
  for (const agent of candidates) {
    try {
      return await executeAgentTask({
        agentId: agent.id,
        agentSlug: agent.slug,
        taskKey: input.taskKey,
        marketingText: input.marketingText,
        replyToTweetId: input.replyToTweetId,
      });
    } catch (e: unknown) {
      lastMessage = e instanceof Error ? e.message : String(e);
    }
  }
  throw ApplicationFailure.create({
    message: lastMessage || "all_agents_failed",
    type: "AllAgentsFailed",
    nonRetryable: true,
  });
}
