#!/usr/bin/env node
/**
 * Verify local platform dev server and API handlers respond.
 * Usage: node scripts/dev-healthcheck.mjs [baseUrl]
 */
const base = (process.argv[2] ?? "http://localhost:5173").replace(/\/$/, "");

async function get(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  return { url, status: res.status, ok: res.ok };
}

async function post(path, body) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return { url, status: res.status, json };
}

const failures = [];

console.log(`Healthcheck: ${base}\n`);

for (const path of ["/forest", "/welcome", "/join"]) {
  const r = await get(path);
  const pass = r.status >= 200 && r.status < 500;
  console.log(`${pass ? "OK" : "FAIL"} GET ${path} → ${r.status}`);
  if (!pass) failures.push(r.url);
}

const member = await get("/api/member/me?address=0x0000000000000000000000000000000000000001");
const memberOk = member.status === 200 || member.status === 503;
console.log(
  `${memberOk ? "OK" : "FAIL"} GET /api/member/me → ${member.status} (503 = DB down)`,
);
if (!memberOk) failures.push(member.url);

const activityMissing = await post("/api/activity/log", {
  address: "0x0000000000000000000000000000000000000001",
  type: "test",
});
const activityMissingOk = activityMissing.status === 400;
console.log(
  `${activityMissingOk ? "OK" : "FAIL"} POST /api/activity/log (no SIWE fields) → ${activityMissing.status} (expect 400)`,
);
if (!activityMissingOk) failures.push(`${base}/api/activity/log`);

const activityBadSig = await post("/api/activity/log", {
  address: "0x0000000000000000000000000000000000000001",
  type: "test",
  message: "not-a-valid-siwe-message",
  signature: "0x" + "00".repeat(65),
});
const activityUnauthorized = activityBadSig.status === 401;
console.log(
  `${activityUnauthorized ? "OK" : "FAIL"} POST /api/activity/log (bad SIWE) → ${activityBadSig.status} (expect 401)`,
);
if (!activityUnauthorized) failures.push(`${base}/api/activity/log`);

const nonce = await get("/api/platform/siwe-nonce");
const nonceOk = nonce.status === 200;
console.log(`${nonceOk ? "OK" : "FAIL"} GET /api/platform/siwe-nonce → ${nonce.status}`);
if (!nonceOk) failures.push(nonce.url);

if (failures.length) {
  console.error("\nFailed checks:", failures.join(", "));
  console.error("Start the app: npm run dev:platform");
  process.exit(1);
}

console.log("\nAll checks passed.");
