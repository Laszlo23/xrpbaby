#!/usr/bin/env node
/**
 * Farcaster follower BCC airdrop — Neynar score filter + verified ETH wallets.
 *
 *   FARCASTER_AIRDROP_DRY_RUN=1 npm run bcc:farcaster-follower-airdrop
 *   FARCASTER_AIRDROP_DRY_RUN=0 npm run bcc:farcaster-follower-airdrop
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, erc20Abi, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BCC_ADDRESS = "0xb890a5289f789f1346032ccc1847939e855fab07";

function loadDotenvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq < 1) continue;
    const k = s.slice(0, eq).trim();
    let v = s.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const fileEnv = {
  ...loadDotenvFile(path.join(ROOT, "app", ".env")),
  ...loadDotenvFile(path.join(ROOT, "contracts", ".env")),
};
const env = { ...fileEnv, ...process.env };

const username = (env.FARCASTER_AIRDROP_USERNAME || "0xleonardo").replace(/^@/, "");
const scoreMin = Number(env.FARCASTER_AIRDROP_SCORE_MIN ?? "0.55");
const amountBcc = env.FARCASTER_AIRDROP_AMOUNT_BCC?.trim() || "7.77";
const dryRun = env.FARCASTER_AIRDROP_DRY_RUN !== "0";
const stopOnError = process.argv.includes("--stop-on-error");
const maxRecipients = Number(env.FARCASTER_AIRDROP_MAX_RECIPIENTS ?? "0") || Infinity;
const campaignId = env.FARCASTER_AIRDROP_CAMPAIGN_ID?.trim() || new Date().toISOString().slice(0, 10);

const dateStamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = path.join(ROOT, "app", "data", "airdrops");
const jsonPath = path.join(outDir, `farcaster-followers-${dateStamp}.json`);
const csvPath = path.join(outDir, `farcaster-followers-${dateStamp}.csv`);
const whitelistPath = path.join(outDir, `farcaster-whitelist-${dateStamp}.txt`);
const logPath = path.join(outDir, `farcaster-send-log-${dateStamp}.jsonl`);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendWithRetry(fn, { attempts = 5, baseDelayMs = 2000 } = {}) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      const retryable =
        /in-flight transaction limit/i.test(msg) ||
        /nonce too low/i.test(msg) ||
        /rate limit/i.test(msg) ||
        /429/i.test(msg) ||
        /timeout/i.test(msg);
      if (!retryable || i === attempts - 1) throw e;
      const delay = baseDelayMs * 2 ** i;
      console.warn(`Retry ${i + 1}/${attempts - 1} after ${delay}ms: ${msg.slice(0, 120)}`);
      await sleep(delay);
    }
  }
  throw lastError;
}

function extractNeynarScore(user) {
  const experimental = user.experimental;
  const candidates = [
    user.score,
    user.neynar_user_score,
    experimental?.neynar_user_score,
    experimental?.user_score,
  ];
  for (const raw of candidates) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      if (raw >= 0 && raw <= 1) return raw;
      if (raw > 1) return raw / 100;
    }
  }
  return null;
}

function resolveVerifiedEth(user) {
  const seen = new Set();
  const addrs = [];

  const verified = user.verified_addresses;
  if (verified && Array.isArray(verified.eth_addresses)) {
    for (const a of verified.eth_addresses) {
      const v = String(a).toLowerCase();
      if (/^0x[a-f0-9]{40}$/.test(v) && !seen.has(v)) {
        seen.add(v);
        addrs.push(v);
      }
    }
  }

  const verifications = user.verifications;
  if (Array.isArray(verifications)) {
    for (const a of verifications) {
      const v = String(a).toLowerCase();
      if (/^0x[a-f0-9]{40}$/.test(v) && !seen.has(v)) {
        seen.add(v);
        addrs.push(v);
      }
    }
  }

  return addrs[0] ?? null;
}

function loadPriorCreditedWallets() {
  const credited = new Set();
  if (!fs.existsSync(outDir)) return credited;
  for (const name of fs.readdirSync(outDir)) {
    if (!name.startsWith("farcaster-send-log-") || !name.endsWith(".jsonl")) continue;
    const lines = fs.readFileSync(path.join(outDir, name), "utf8").split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line);
        if (row.status === "credited" && row.wallet) credited.add(String(row.wallet).toLowerCase());
      } catch {
        /* skip */
      }
    }
  }
  return credited;
}

function appendLog(row) {
  fs.appendFileSync(logPath, `${JSON.stringify(row)}\n`);
}

async function fetchAllFollowerFids(client, fid) {
  const fids = [];
  let cursor;
  do {
    const res = await client.fetchUserFollowers({
      fid,
      limit: 100,
      cursor,
    });
    for (const entry of res.users ?? []) {
      const followerFid = entry.user?.fid ?? entry.fid;
      if (followerFid != null) fids.push(Number(followerFid));
    }
    cursor = res.next?.cursor;
    await sleep(200);
  } while (cursor);
  return fids;
}

async function fetchUsersBulk(client, fids) {
  const users = [];
  for (let i = 0; i < fids.length; i += 100) {
    const batch = fids.slice(i, i + 100);
    const res = await client.fetchBulkUsers({ fids: batch });
    users.push(...(res.users ?? []));
    await sleep(200);
  }
  return users;
}

function resolvePrivateKey() {
  const key =
    env.BCC_TREASURY_PRIVATE_KEY?.trim() ||
    env.PANIC_SWITCH_BCC_REWARD_PRIVATE_KEY?.trim() ||
    env.PRIVATE_KEY?.trim();
  if (!key || !/^0x[a-fA-F0-9]{64}$/.test(key)) return null;
  return key;
}

async function main() {
  const apiKey = env.NEYNAR_API_KEY?.trim();
  if (!apiKey) {
    console.error("NEYNAR_API_KEY missing");
    process.exit(1);
  }

  const client = new NeynarAPIClient(new Configuration({ apiKey }));

  console.log(`==> Resolve @${username}`);
  const lookup = await client.lookupUserByUsername({ username });
  const target = lookup.user;
  if (!target?.fid) {
    console.error("Could not resolve Farcaster user");
    process.exit(1);
  }
  const targetFid = Number(target.fid);
  console.log(`FID ${targetFid} (${target.follower_count ?? "?"} followers reported)`);

  console.log("==> Fetch follower FIDs (paginated)");
  const followerFids = await fetchAllFollowerFids(client, targetFid);
  console.log(`Fetched ${followerFids.length} follower FID(s)`);

  console.log("==> Bulk fetch user profiles");
  const users = await fetchUsersBulk(client, followerFids);

  const rows = [];
  const stats = {
    total: users.length,
    noScore: 0,
    lowScore: 0,
    noWallet: 0,
    duplicateWallet: 0,
    eligible: 0,
  };
  const walletSeen = new Set();
  const priorCredited = loadPriorCreditedWallets();

  for (const user of users) {
    const fid = Number(user.fid);
    const uname = user.username ?? "";
    const score = extractNeynarScore(user);
    const wallet = resolveVerifiedEth(user);
    let eligible = false;
    let reason = "";

    if (score == null) {
      stats.noScore++;
      reason = "no_score";
    } else if (score <= scoreMin) {
      stats.lowScore++;
      reason = "score_below_min";
    } else if (!wallet) {
      stats.noWallet++;
      reason = "no_verified_eth";
    } else if (walletSeen.has(wallet)) {
      stats.duplicateWallet++;
      reason = "duplicate_wallet";
    } else {
      walletSeen.add(wallet);
      eligible = true;
      stats.eligible++;
      reason = "eligible";
    }

    rows.push({
      fid,
      username: uname,
      score,
      wallet,
      eligible,
      reason,
    });
  }

  const eligibleRows = rows.filter((r) => r.eligible).slice(0, maxRecipients);
  const amountWei = parseUnits(amountBcc, 18);
  const totalWei = amountWei * BigInt(eligibleRows.length);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        campaignId,
        username,
        targetFid,
        scoreMin,
        amountBcc,
        stats,
        eligible: eligibleRows,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  const csvHeader = "fid,username,score,wallet,eligible,reason\n";
  const csvBody = rows
    .map((r) =>
      [r.fid, r.username, r.score ?? "", r.wallet ?? "", r.eligible, r.reason]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  fs.writeFileSync(csvPath, csvHeader + csvBody);

  const whitelist = eligibleRows.map((r) => r.wallet).join(",");
  fs.writeFileSync(whitelistPath, whitelist);

  console.log("\n==> Snapshot");
  console.log(JSON.stringify(stats, null, 2));
  console.log(`Eligible (capped): ${eligibleRows.length}`);
  console.log(`Total BCC needed: ${amountBcc} × ${eligibleRows.length}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);
  console.log(`Whitelist: ${whitelistPath}`);

  if (eligibleRows.length === 0) {
    console.log("No eligible recipients — done.");
    return;
  }

  if (dryRun) {
    console.log("\n[DRY RUN] Skipping on-chain transfers. Set FARCASTER_AIRDROP_DRY_RUN=0 to send.");
    return;
  }

  if (env.BCC_TREASURY_ONCHAIN !== "1" && env.PANIC_SWITCH_BCC_REWARD_ONCHAIN !== "1") {
    console.warn("BCC_TREASURY_ONCHAIN not set to 1 — proceeding with direct transfers anyway.");
  }

  const privateKey = resolvePrivateKey();
  if (!privateKey) {
    console.error("Set BCC_TREASURY_PRIVATE_KEY or PRIVATE_KEY in app/.env / contracts/.env");
    process.exit(1);
  }

  const rpc =
    env.BCC_TREASURY_RPC_URL?.trim() ||
    env.BASE_RPC_URL?.trim() ||
    env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org";

  const tokenAddress = (env.BCC_TREASURY_TOKEN_ADDRESS || env.VITE_BCC_TOKEN_ADDRESS || BCC_ADDRESS).trim();

  const account = privateKeyToAccount(privateKey);
  const transport = http(rpc);
  const walletClient = createWalletClient({ account, chain: base, transport });
  const publicClient = createPublicClient({ chain: base, transport });

  const treasuryBal = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const requiredWithBuffer = (totalWei * 101n) / 100n;
  if (treasuryBal < requiredWithBuffer) {
    console.error(
      `Insufficient BCC: have ${treasuryBal}, need ~${requiredWithBuffer} wei (${eligibleRows.length} × ${amountBcc} BCC + 1% buffer)`,
    );
    process.exit(1);
  }

  console.log(`\n==> Sending from ${account.address}`);
  console.log(`Treasury BCC balance: ${treasuryBal}`);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of eligibleRows) {
    const wallet = row.wallet;
    if (priorCredited.has(wallet)) {
      skipped++;
      appendLog({
        campaignId,
        wallet,
        fid: row.fid,
        username: row.username,
        status: "skipped",
        reason: "already_credited",
        at: new Date().toISOString(),
      });
      continue;
    }

    try {
      const txHash = await sendWithRetry(() =>
        walletClient.writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "transfer",
          args: [wallet, amountWei],
          account,
          chain: base,
        }),
      );
      const receipt = await sendWithRetry(() =>
        publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 }),
      );
      if (receipt.status !== "success") {
        failed++;
        appendLog({
          campaignId,
          wallet,
          fid: row.fid,
          username: row.username,
          status: "failed",
          txHash,
          at: new Date().toISOString(),
        });
        if (stopOnError) process.exit(1);
        continue;
      }
      sent++;
      appendLog({
        campaignId,
        wallet,
        fid: row.fid,
        username: row.username,
        status: "credited",
        txHash,
        amountBcc,
        at: new Date().toISOString(),
      });
      console.log(`✓ ${row.username} (${wallet.slice(0, 10)}…) ${txHash}`);
    } catch (e) {
      failed++;
      appendLog({
        campaignId,
        wallet,
        fid: row.fid,
        username: row.username,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
        at: new Date().toISOString(),
      });
      console.error(`✗ ${row.username}: ${e instanceof Error ? e.message : e}`);
      if (stopOnError) process.exit(1);
    }

    await sleep(2500);
  }

  console.log("\n==> Summary");
  console.log(JSON.stringify({ sent, failed, skipped, logPath }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
