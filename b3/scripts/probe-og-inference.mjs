#!/usr/bin/env node
/**
 * Verify 0G inference is reachable with current deploy/.env (Router or Direct).
 */
const routerKey =
  process.env.OG_COMPUTE_ROUTER_API_KEY?.trim() ||
  process.env.ZERO_G_ROUTER_API_KEY?.trim();

const directUrl = process.env.OG_COMPUTE_DIRECT_URL?.trim();
const directKey = process.env.OG_COMPUTE_DIRECT_API_KEY?.trim();

const network =
  process.env.OG_COMPUTE_NETWORK?.trim().toLowerCase() === "testnet" ? "testnet" : "mainnet";

const routerBase =
  process.env.OG_COMPUTE_ROUTER_URL?.trim() ||
  (network === "testnet"
    ? "https://router-api-testnet.integratenetwork.work/v1"
    : "https://router-api.0g.ai/v1");

const model =
  process.env.OG_COMPUTE_MODEL?.trim() ||
  process.env.AGENT_LLM_MODEL?.trim() ||
  "zai-org/GLM-5-FP8";

const messages = [
  { role: "system", content: "Reply with exactly: 0G_OK" },
  { role: "user", content: "ping" },
];

async function probe(url, apiKey, label) {
  const base = url.replace(/\/$/, "");
  const endpoints = base.includes("/chat/completions")
    ? [base]
    : [`${base}/chat/completions`, `${base}/v1/chat/completions`, `${base}/v1/proxy/chat/completions`];

  let lastErr = "";
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, max_tokens: 16, temperature: 0 }),
        signal: AbortSignal.timeout(60_000),
      });
      const text = await res.text();
      if (!res.ok) {
        lastErr = `${label} HTTP ${res.status}: ${text.slice(0, 200)}`;
        continue;
      }
      const json = JSON.parse(text);
      const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
      console.log(`✓ ${label} OK — endpoint=${endpoint} reply=${JSON.stringify(reply.slice(0, 80))}`);
      return reply;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(lastErr || `${label} failed`);
}

async function main() {
  if (routerKey) {
    await probe(routerBase, routerKey, "0G Router");
    return;
  }
  if (directUrl && directKey) {
    await probe(directUrl, directKey, "0G Direct");
    return;
  }
  console.error("No 0G inference configured.");
  console.error("Set OG_COMPUTE_ROUTER_API_KEY (pc.0g.ai) or run setup-agent-0g.sh for Direct.");
  process.exit(1);
}

main().catch((e) => {
  console.error("✗", e.message);
  if (String(e.message).includes("402")) {
    console.error("  → Top up 0G balance at https://pc.0g.ai (Router) or 0g-compute-cli deposit (Direct)");
  }
  process.exit(1);
});
