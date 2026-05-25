/** Shared between workflow (orchestration) and callers — no Temporal imports. */
export type AgentTaskWorkflowInput = {
  taskKey: string;
  /** When `taskKey` is `social_burst`, posted via X OAuth activity when configured. */
  marketingText?: string;
  replyToTweetId?: string;
};

export type ExecuteAgentTaskActivityInput = {
  agentId: number;
  agentSlug: string;
  taskKey: string;
  marketingText?: string;
  replyToTweetId?: string;
};

export type AgentTaskWorkflowResult = {
  agentId: number;
  agentSlug: string;
  mode: string;
  detail: string;
  tweetUrl?: string;
};
