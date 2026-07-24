#!/usr/bin/env node
/** Emit a stdin script for remote node to upsert env keys from a local dotenv file. */
import fs from "node:fs";

const envFile = process.argv[2];
if (!envFile) {
  console.error("usage: patch-remote-env.mjs <local-env-file>");
  process.exit(1);
}

const keys = ["ALCHEMY_API_KEY", "BASE_RPC_URL"];
const vars = {};
for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m || !keys.includes(m[1])) continue;
  vars[m[1]] = m[2];
}

if (!vars.ALCHEMY_API_KEY || !vars.BASE_RPC_URL) {
  console.error("missing ALCHEMY_API_KEY or BASE_RPC_URL in", envFile);
  process.exit(1);
}

const script = `
const fs = require("fs");
const vars = ${JSON.stringify(vars)};
const path = "app/.env";
let text = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
for (const [key, value] of Object.entries(vars)) {
  const re = new RegExp("^" + key + "=.*$", "m");
  const line = key + "=" + value;
  text = re.test(text) ? text.replace(re, line) : text + (text.endsWith("\\n") || !text ? "" : "\\n") + line + "\\n";
}
fs.writeFileSync(path, text);
console.log("patched " + Object.keys(vars).join(", "));
`;

process.stdout.write(script);
