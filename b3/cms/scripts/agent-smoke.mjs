#!/usr/bin/env node
/**
 * Sanity-check Strapi Content API + key routes (exit 0 on success).
 *
 * Usage:
 *   STRAPI_URL=http://127.0.0.1:1337 node scripts/agent-smoke.mjs
 *   STRAPI_URL=… STRAPI_API_TOKEN=splat_… node scripts/agent-smoke.mjs
 *
 * Without STRAPI_API_TOKEN, only public GETs are checked.
 */
const base = (process.env.STRAPI_URL || "http://127.0.0.1:1337").replace(/\/$/, "");
const token = process.env.STRAPI_API_TOKEN?.trim();

async function get(path) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { res, text: text.slice(0, 500), json };
}

function ok(name, condition, detail) {
  if (condition) {
    console.log(`OK  ${name}`);
    return true;
  }
  console.error(`FAIL ${name}`, detail ?? "");
  return false;
}

let failed = false;

const checks = [
  ["/api/site-narrative", "Site narrative (single type)"],
  ["/api/roadmap-items?pagination[limit]=5", "Roadmap items"],
  ["/api/articles?pagination[limit]=1", "Articles"],
  ["/api/global?populate=*", "Global single type"],
];

for (const [path, label] of checks) {
  try {
    const { res } = await get(path);
    if (!ok(label, res.ok, `HTTP ${res.status}`)) failed = true;
  } catch (e) {
    ok(label, false, e);
    failed = true;
  }
}

// Custom wallet route should respond (400/422 ok if body missing — proves route exists)
try {
  const res = await fetch(`${base}/api/community-profiles/wallet/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ address: "0x0000000000000000000000000000000000000001" }),
  });
  ok(
    "POST /api/community-profiles/wallet/nonce",
    res.status < 500,
    `status ${res.status}`,
  );
  if (res.status >= 500) failed = true;
} catch (e) {
  ok("POST /api/community-profiles/wallet/nonce", false, e);
  failed = true;
}

if (token) {
  try {
    const { res } = await get("/api/site-narrative");
    ok("Authenticated GET (token)", res.ok, res.status);
    if (!res.ok) failed = true;
  } catch (e) {
    ok("Authenticated GET (token)", false, e);
    failed = true;
  }
} else {
  console.log("SKIP token-authenticated checks (set STRAPI_API_TOKEN for full access smoke)");
}

console.log(failed ? "\nagent-smoke: some checks failed" : "\nagent-smoke: all checks passed");
process.exit(failed ? 1 : 0);
