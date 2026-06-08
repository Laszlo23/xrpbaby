#!/usr/bin/env node
import { ethers } from "ethers";

function argFlag(name) {
  return process.argv.includes(name);
}

function argValue(name, fallback = "") {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

const origin = (
  argValue("--origin", process.env.PUBLIC_APP_ORIGIN || "http://127.0.0.1:3011") || ""
)
  .trim()
  .replace(/\/$/, "");
const adminSecret =
  process.env.GROVE_MARKETING_ADMIN_SECRET || process.env.X_MARKETING_ADMIN_SECRET;
const runLive = argFlag("--run-live");
const runWalletTx = argFlag("--wallet-tx");

if (!origin) {
  console.error("Missing --origin or PUBLIC_APP_ORIGIN.");
  process.exit(1);
}

function logStep(step, value) {
  console.log(`[growth-check] ${step}: ${value}`);
}

function telegramOutboundConfigured() {
  const token =
    process.env.GROVE_TELEGRAM_BOT_TOKEN?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.GROVE_TELEGRAM_CHAT_ID?.trim();
  return Boolean(token && chatId);
}

function requiredEnvStatus() {
  const checks = [
    ["GROVE_MARKETING_ADMIN_SECRET", Boolean(adminSecret)],
    [
      "GROVE_X credentials",
      Boolean(process.env.GROVE_X_CONSUMER_KEY && process.env.GROVE_X_ACCESS_TOKEN),
    ],
    [
      "Farcaster signer",
      Boolean(process.env.NEYNAR_API_KEY && process.env.GROVE_NEYNAR_SIGNER_UUID),
    ],
    ["Telegram outbound", telegramOutboundConfigured()],
    ["TELEGRAM_BOT_TOKEN (mini app)", Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim())],
    [
      "Quidli Connect",
      Boolean(process.env.QUIDLI_API_KEY?.trim() || process.env.QUIDLY_API_KEY?.trim()),
    ],
    [
      "Slack webhook",
      Boolean(process.env.GROVE_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL),
    ],
  ];
  for (const [label, ok] of checks) logStep(label, ok ? "ok" : "missing");
}

async function checkTelegramSurface() {
  const paths = ["/tg", "/tonconnect-manifest.json", "/meta/tonconnect-icon.png"];
  for (const path of paths) {
    const res = await fetch(`${origin}${path}`);
    logStep(`GET ${path}`, `${res.status}`);
    if (!res.ok) throw new Error(`telegram_surface_failed:${path}:${res.status}`);
  }
  const manifest = await fetch(`${origin}/tonconnect-manifest.json`).then((r) => r.json());
  const manifestOk =
    typeof manifest.url === "string" &&
    manifest.url.includes("/tg") &&
    typeof manifest.iconUrl === "string" &&
    /\.png$/i.test(manifest.iconUrl);
  logStep("tonconnect manifest", manifestOk ? "ok" : "invalid");

  for (const [method, path] of [
    ["GET", "/api/tg/me"],
    ["GET", "/api/tg/quests"],
    ["POST", "/api/tg/auth"],
  ]) {
    const res = await fetch(`${origin}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? "{}" : undefined,
    });
    const json = await res.json().catch(() => ({}));
    const configured =
      res.status === 401 && json?.error === "missing_init_data"
        ? "configured"
        : res.status === 503 && json?.error === "telegram_not_configured"
          ? "not_configured"
          : `unexpected_${res.status}`;
    logStep(`${method} ${path}`, configured);
    if (configured === "not_configured") {
      throw new Error("telegram_bot_token_missing_on_server");
    }
    if (configured.startsWith("unexpected")) {
      throw new Error(`telegram_api_smoke_failed:${path}:${configured}`);
    }
  }
}

async function getStatus() {
  const res = await fetch(`${origin}/api/marketing/grove/tick`);
  const json = await res.json();
  logStep("status endpoint", `${res.status}`);
  logStep("autoPost", json.autoPost);
  logStep("publishingPaused", json.publishingPaused);
  logStep(
    "x/fc/tg configured",
    `${json.xConfigured}/${json.farcasterConfigured}/${json.telegramConfigured}`,
  );
  logStep("brief mcap", json?.briefPreview?.marketCapUsd ?? "n/a");
  return json;
}

async function runTick(dryRun) {
  if (!adminSecret) {
    logStep(dryRun ? "dry-run tick" : "live tick", "skipped_missing_admin_secret");
    return null;
  }
  const res = await fetch(`${origin}/api/marketing/grove/tick`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-grove-marketing-admin-secret": adminSecret,
    },
    body: JSON.stringify({ dryRun }),
  });
  const json = await res.json();
  logStep(dryRun ? "dry-run tick" : "live tick", `${res.status}`);
  logStep("pillar", json.pillar || "n/a");
  logStep("fingerprint", json.fingerprint || "n/a");
  logStep(
    "x/fc/tg result",
    `${json?.x?.ok ?? "na"}/${json?.farcaster?.ok ?? "na"}/${json?.telegram?.ok ?? "na"}`,
  );
  return json;
}

async function walletCheck() {
  const privateKey =
    process.env.GROVE_WALLET_PRIVATE_KEY ||
    process.env.PULSE_ATTEST_PRIVATE_KEY ||
    process.env.PANIC_SWITCH_BCC_REWARD_PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL || process.env.B3_RPC_URL || process.env.ETH_RPC_URL;
  if (!privateKey || !rpcUrl) {
    logStep("wallet connectivity", "skipped_missing_key_or_rpc");
    return;
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const [balance, nonce, network] = await Promise.all([
    provider.getBalance(wallet.address),
    provider.getTransactionCount(wallet.address),
    provider.getNetwork(),
  ]);
  logStep("wallet address", wallet.address);
  logStep("wallet chainId", `${network.chainId}`);
  logStep("wallet nonce", `${nonce}`);
  logStep("wallet balance", ethers.formatEther(balance));

  if (!runWalletTx) return;
  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0n,
  });
  await tx.wait();
  logStep("wallet tx hash", tx.hash);
}

async function main() {
  requiredEnvStatus();
  await checkTelegramSurface();
  await getStatus();
  await runTick(true);
  if (runLive) await runTick(false);
  await walletCheck();
  logStep("result", "completed");
}

main().catch((error) => {
  console.error("[growth-check] failed", error);
  process.exit(1);
});
