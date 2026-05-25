import { loadAppEnv } from "./load-env";

loadAppEnv();

import { getPrisma } from "@/server/db/prisma";
import { pulseStreamFlags } from "@/server/pulse/config";
import { runPulseIngest } from "@/server/pulse/ingest";

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error("DATABASE_URL not configured");
    process.exit(1);
  }
  console.log("Stream flags:", pulseStreamFlags());
  const result = await runPulseIngest(prisma);
  console.log("Ingested:", result.ingested, result.adapters);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
