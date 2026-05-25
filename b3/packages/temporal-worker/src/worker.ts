import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { NativeConnection, Worker, bundleWorkflowCode } from "@temporalio/worker";

import * as activities from "./activities/executeAgentTask.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const workflowsPath = resolve(__dirname, "workflows");
  const { code } = await bundleWorkflowCode({
    workflowsPath,
  });

  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
    taskQueue: "bcd-agent",
    workflowBundle: { code },
    activities,
  });

  console.error(`Temporal worker listening on task queue "bcd-agent"`);
  await worker.run();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
