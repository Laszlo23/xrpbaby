import { Connection, Client } from "@temporalio/client";

import type { AgentTaskWorkflowInput } from "./agent-task-types.js";

async function main() {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  });

  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  });

  const input: AgentTaskWorkflowInput = {
    taskKey: process.env.AGENT_TASK_KEY ?? "social_burst",
    marketingText:
      process.argv[2] ?? "BUILDCHAIN — CEO routing + Temporal durable execution.",
  };

  const handle = await client.workflow.start("agentTaskWorkflow", {
    taskQueue: "bcd-agent",
    workflowId: process.env.WORKFLOW_ID ?? `agent-task-${Date.now()}`,
    args: [input],
  });

  console.error("started workflow", handle.workflowId);
  const result = await handle.result();
  console.log(JSON.stringify(result, null, 2));
  await connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
