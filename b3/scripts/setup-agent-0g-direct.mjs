#!/usr/bin/env node
/**
 * Wallet-funded 0G Direct inference: deposit, fund provider, mint app-sk key.
 * Requires 0g-compute-cli + funded deployer wallet on 0G mainnet.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Wallet } from "ethers";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const deployEnv = path.join(root, "deploy/.env");
const rpc = process.env.ZG_RPC_URL || process.env.OG_0G_RPC_URL || "https://evmrpc.0g.ai";
const model = process.env.OG_COMPUTE_MODEL || "zai-org/GLM-5-FP8";
const providerDefault = "0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function upsertEnv(key, value) {
  let text = fs.existsSync(deployEnv) ? fs.readFileSync(deployEnv, "utf8") : "";
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=`, "m").test(text)) {
    text = text.replace(new RegExp(`^${key}=.*$`, "m"), line);
  } else {
    text += `\n${line}\n`;
  }
  fs.writeFileSync(deployEnv, text);
}

function pickProvider(listOutput) {
  const blocks = listOutput.split(/Provider \d+/);
  for (const block of blocks) {
    if (block.includes(model)) {
      const m = block.match(/0x[a-fA-F0-9]{40}/);
      if (m) return m[0];
    }
  }
  return providerDefault;
}

function parseGetSecret(out) {
  const bearer = out.match(/Authorization: Bearer (app-sk-[A-Za-z0-9_-]+)/);
  const curlUrl = out.match(/curl (https?:\/\/[^\s/]+)/);
  const appSk = bearer?.[1] ?? out.match(/app-sk-[A-Za-z0-9_-]+/)?.[0];
  const base = curlUrl?.[1];
  return { appSk, chatUrl: base ? `${base}/v1/proxy/chat/completions` : null };
}

try {
  execSync(`node "${path.join(root, "scripts/configure-0g-cli.mjs")}"`, { stdio: "inherit" });

  const cfg = JSON.parse(
    fs.readFileSync(path.join(os.homedir(), ".0g-compute-cli/config.json"), "utf8"),
  );
  const address = new Wallet(cfg.privateKey).address;
  const balRaw = run(
    `curl -s -X POST "${rpc}" -H "Content-Type: application/json" -d "{\\"jsonrpc\\":\\"2.0\\",\\"method\\":\\"eth_getBalance\\",\\"params\\":[\\"${address}\\",\\"latest\\"],\\"id\\":1}"`,
  );
  const balOg = Number(BigInt(JSON.parse(balRaw).result)) / 1e18;
  console.log(`    wallet ${address} native balance: ${balOg.toFixed(4)} 0G`);
  if (balOg < 3.5) {
    console.error(
      "Need ≥3.5 0G on 0G Chain for ledger deposit (contract min 3 0G + gas). Fund wallet or use Router key from https://pc.0g.ai",
    );
    process.exit(1);
  }

  console.log("==> Checking 0G compute account");
  try {
    run(`0g-compute-cli get-account --rpc "${rpc}"`);
  } catch {
    console.log("    no ledger yet — depositing 3 0G (contract minimum)");
    run(`0g-compute-cli deposit --amount 3 --rpc "${rpc}"`);
  }

  const listOut = run(`0g-compute-cli inference list-providers --rpc "${rpc}"`);
  const provider = pickProvider(listOut);
  console.log(`==> Provider for ${model}: ${provider}`);

  console.log("==> Acknowledge provider + fund sub-account");
  try {
    run(`0g-compute-cli inference acknowledge-provider --provider "${provider}" --rpc "${rpc}"`);
  } catch (e) {
    console.log("    acknowledge skipped (may already exist)");
  }

  try {
    run(
      `0g-compute-cli transfer-fund --provider "${provider}" --amount 1 --service inference --rpc "${rpc}"`,
    );
  } catch (e) {
    const msg = String(e.stderr || e.message || e);
    if (!msg.includes("insufficient") && !msg.includes("already")) throw e;
    console.log("    transfer-fund skipped:", msg.split("\n")[0].slice(0, 120));
  }

  console.log("==> Mint Direct API key");
  const secretOut = run(
    `0g-compute-cli inference get-secret --provider "${provider}" --duration 0 --rpc "${rpc}"`,
  );
  const { appSk, chatUrl } = parseGetSecret(secretOut);
  if (!appSk || !chatUrl) {
    console.error("Failed to parse app-sk or service URL from get-secret output");
    process.exit(1);
  }

  upsertEnv("OG_COMPUTE_DIRECT_API_KEY", appSk);
  upsertEnv("OG_COMPUTE_DIRECT_URL", chatUrl);
  upsertEnv("OG_COMPUTE_DIRECT_PROVIDER", provider);
  console.log(`✓ Direct inference configured (provider ${provider})`);
} catch (e) {
  const msg = String(e.stderr || e.message || e);
  console.error("Direct setup failed:", msg.slice(0, 400));
  process.exit(1);
}
