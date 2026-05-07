#!/usr/bin/env node
import { runTick } from "../dispatcher.js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

async function main() {
  const agent = arg("--agent") ?? "all";
  const config = arg("--config");
  const results = await runTick({ agent, configPath: config });
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
