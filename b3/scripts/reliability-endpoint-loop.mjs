#!/usr/bin/env node
/**
 * ECO-001 reliability gate: probe P0 endpoints and optionally alert Slack.
 *
 * Usage:
 *   node scripts/reliability-endpoint-loop.mjs [baseUrl]
 *   RELIABILITY_SLACK_WEBHOOK_URL=https://hooks.slack.com/... node scripts/reliability-endpoint-loop.mjs
 *
 * Cron (every 4h): see scripts/install-reliability-cron.sh
 */
const base = (process.argv[2] ?? process.env.PUBLIC_APP_ORIGIN ?? "https://app.buildingcultureid.space").replace(
  /\/$/,
  "",
);

const ENDPOINTS = [
  { path: "/api/pulse/metrics", kind: "json", requiredOk: false },
  { path: "/api/market/bcc", kind: "json", requiredOk: true },
  { path: "/api/market/health", kind: "json", requiredOk: true },
  { path: "/api/trading/health", kind: "json", requiredOk: true, allowUnreachable: true },
  { path: "/api/marketing/grove/tick", kind: "json", requiredOk: true },
  { path: "/api/points/redeem/stats", kind: "json", requiredOk: true },
];

async function probe(endpoint) {
  const url = `${base}${endpoint.path}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    let body = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    let ok = res.ok;
    if (endpoint.kind === "json" && endpoint.requiredOk) {
      ok = res.ok && body && body.ok === true;
    } else if (endpoint.kind === "json" && endpoint.allowUnreachable && body?.reachable === false) {
      ok = true;
    } else if (endpoint.path.includes("/pulse/metrics")) {
      ok = res.ok;
    }
    return { url, status: res.status, ok, body };
  } catch (err) {
    return { url, status: 0, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function notifySlack(failures) {
  const webhook = process.env.RELIABILITY_SLACK_WEBHOOK_URL?.trim();
  if (!webhook || failures.length === 0) return;
  const text = [
    `:warning: *Building Culture reliability gate* — ${failures.length} endpoint(s) degraded`,
    `Origin: ${base}`,
    "",
    ...failures.map((f) => `• ${f.path} → ${f.status || "error"} ${f.error ?? ""}`.trim()),
  ].join("\n");
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

async function main() {
  console.log(`Reliability loop: ${base}\n`);
  const results = [];
  for (const ep of ENDPOINTS) {
    const r = await probe(ep);
    results.push({ ...ep, ...r });
    console.log(`${r.ok ? "OK" : "FAIL"} ${ep.path} → ${r.status || "ERR"}`);
  }

  const failures = results.filter((r) => !r.ok);
  const payload = {
    ok: failures.length === 0,
    checkedAt: new Date().toISOString(),
    base,
    results: results.map(({ path, status, ok, error }) => ({ path, status, ok, error })),
  };

  const outDir = process.env.RELIABILITY_OUT_DIR ?? "proof-bundles";
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, "reliability-latest.json");
    fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`\nWrote ${outFile}`);
  } catch {
    /* optional */
  }

  if (failures.length) {
    await notifySlack(failures);
    process.exit(1);
  }
  console.log("\nAll reliability endpoints healthy.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
