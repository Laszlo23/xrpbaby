import addressesData from "@/data/addresses.json";
import { OG_AGENT_ID_DEFAULTS } from "@/lib/og-hackathon";
import { TALENTAPP_PROJECT_VERIFICATION } from "@/lib/seo";

export type GrantCheckStatus = "pass" | "warn" | "fail";

export type GrantCheck = {
  id: string;
  label: string;
  status: GrantCheckStatus;
  url?: string;
  detail?: string;
};

export type GrantVerificationPayload = {
  ok: boolean;
  generatedAt: string;
  origin: string;
  overallScore: number;
  checks: GrantCheck[];
  addresses: typeof addressesData;
  proofLinks: {
    grantProof: string;
    ogAgentId: string;
    investors: string;
    places: string;
    forest: string;
    artDrops: string;
    docs: string;
  };
  scopeBoundaries: {
    econLive: string;
    tradingAgent: string;
    groveSocial: string;
    notLegalAdvice: string;
  };
};

const ROUTE_PATHS = [
  "/forest",
  "/join",
  "/welcome",
  "/signal",
  "/roadmap",
  "/docs",
  "/drops/art",
  "/0g/agentid",
  "/grant-proof",
  "/investors",
  "/tg",
] as const;

async function fetchStatus(origin: string, path: string, timeoutMs = 20_000): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${origin}${path}`, { signal: controller.signal });
    return res.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(origin: string, path: string): Promise<string> {
  try {
    const res = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(20_000) });
    return res.ok ? await res.text() : "";
  } catch {
    return "";
  }
}

async function fetchJson(origin: string, path: string): Promise<unknown> {
  try {
    const res = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function addRouteChecks(
  origin: string,
  checks: GrantCheck[],
  results: PromiseSettledResult<number>[],
) {
  ROUTE_PATHS.forEach((path, i) => {
    const settled = results[i];
    const code = settled.status === "fulfilled" ? settled.value : 0;
    const status: GrantCheckStatus = code >= 200 && code < 400 ? "pass" : "fail";
    checks.push({
      id: `route_${path.replace(/\//g, "_").replace(/^_/, "") || "root"}`,
      label: `Route ${path}`,
      status,
      url: `${origin}${path}`,
      detail: code ? `HTTP ${code}` : "unreachable",
    });
  });
}

export async function buildGrantVerificationPayload(
  origin: string,
): Promise<GrantVerificationPayload> {
  const base = origin.replace(/\/$/, "");
  const checks: GrantCheck[] = [];

  const routeResults = await Promise.allSettled(ROUTE_PATHS.map((path) => fetchStatus(base, path)));
  addRouteChecks(base, checks, routeResults);

  const agentCard = await fetchJson(base, "/.well-known/agent.json");
  checks.push({
    id: "agent_card",
    label: "Agent card (.well-known/agent.json)",
    status: agentCard && typeof agentCard === "object" ? "pass" : "fail",
    url: `${base}/.well-known/agent.json`,
  });

  const siwe = await fetchJson(base, "/api/platform/siwe-nonce");
  const siweOk =
    siwe &&
    typeof siwe === "object" &&
    "nonce" in siwe &&
    typeof (siwe as { nonce?: unknown }).nonce === "string";
  checks.push({
    id: "siwe_nonce",
    label: "SIWE nonce endpoint",
    status: siweOk ? "pass" : "fail",
    url: `${base}/api/platform/siwe-nonce`,
  });

  const homeHtml = await fetchText(base, "/");
  checks.push({
    id: "talentapp_verification",
    label: "Talent Protocol project verification meta",
    status: homeHtml.includes(TALENTAPP_PROJECT_VERIFICATION) ? "pass" : "fail",
    url: `${base}/`,
    detail: "talentapp:project_verification",
  });

  const ogHtml = await fetchText(base, "/0g/agentid");
  const ogOk = ogHtml.includes(OG_AGENT_ID_DEFAULTS.contract.toLowerCase());
  checks.push({
    id: "og_agentid_proof",
    label: "0G AgentId proof page",
    status: ogOk ? "pass" : "fail",
    url: `${base}/0g/agentid`,
    detail: OG_AGENT_ID_DEFAULTS.contract,
  });

  const artHtml = await fetchText(base, "/drops/art");
  checks.push({
    id: "art_mint_ui",
    label: "Art drops mint UI",
    status: artHtml.includes("Enter raffle") ? "pass" : "fail",
    url: `${base}/drops/art`,
  });

  const marketHealth = await fetchJson(base, "/api/market/health");
  checks.push({
    id: "market_health",
    label: "Market health API",
    status:
      marketHealth &&
      typeof marketHealth === "object" &&
      (marketHealth as { ok?: boolean }).ok === true
        ? "pass"
        : "fail",
    url: `${base}/api/market/health`,
  });

  const marketBcc = await fetchJson(base, "/api/market/bcc");
  checks.push({
    id: "market_bcc",
    label: "BCC market API",
    status:
      marketBcc && typeof marketBcc === "object" && (marketBcc as { ok?: boolean }).ok === true
        ? "pass"
        : "fail",
    url: `${base}/api/market/bcc`,
  });

  const tradingHealth = await fetchJson(base, "/api/trading/health");
  let tradingStatus: GrantCheckStatus = "fail";
  if (
    tradingHealth &&
    typeof tradingHealth === "object" &&
    (tradingHealth as { ok?: boolean }).ok === true
  ) {
    tradingStatus = "pass";
  } else if (
    tradingHealth &&
    typeof tradingHealth === "object" &&
    (tradingHealth as { reachable?: boolean }).reachable === false
  ) {
    tradingStatus = "warn";
  }
  checks.push({
    id: "trading_health",
    label: "Trading agent health",
    status: tradingStatus,
    url: `${base}/api/trading/health`,
    detail: tradingStatus === "warn" ? "upstream trading agent offline" : undefined,
  });

  const groveTick = await fetchJson(base, "/api/marketing/grove/tick");
  const groveOk =
    groveTick && typeof groveTick === "object" && (groveTick as { ok?: boolean }).ok === true;
  checks.push({
    id: "grove_tick",
    label: "Grove marketing tick",
    status: groveOk ? "pass" : "warn",
    url: `${base}/api/marketing/grove/tick`,
  });

  if (groveTick && typeof groveTick === "object") {
    const g = groveTick as { xConfigured?: boolean; farcasterConfigured?: boolean };
    if (!g.xConfigured) {
      checks.push({
        id: "grove_x",
        label: "Grove X outbound",
        status: "warn",
        detail: "credentials not set",
      });
    }
    if (!g.farcasterConfigured) {
      checks.push({
        id: "grove_farcaster",
        label: "Grove Farcaster outbound",
        status: "warn",
        detail: "signer not set",
      });
    }
  }

  const quidliWebhook = await fetchJson(base, "/api/webhooks/quidli");
  const quidliHookOk =
    quidliWebhook &&
    typeof quidliWebhook === "object" &&
    (quidliWebhook as { configured?: boolean }).configured === true;
  checks.push({
    id: "quidli_webhook_registered",
    label: "Quidli Connect webhook endpoint",
    status: quidliHookOk ? "pass" : "warn",
    url: `${base}/api/webhooks/quidli`,
    detail: quidliHookOk ? "API key configured" : "set QUIDLI_API_KEY + register URL in Connect",
  });

  const quidliStatus = await fetchJson(base, "/api/marketing/quidli/status");
  const quidliBccOk =
    quidliStatus &&
    typeof quidliStatus === "object" &&
    (quidliStatus as { rewardConfigured?: boolean }).rewardConfigured === true;
  checks.push({
    id: "quidli_bcc_configured",
    label: "Quidli BCC reward rails",
    status: quidliBccOk ? "pass" : "warn",
    url: `${base}/api/marketing/quidli/status`,
    detail: quidliBccOk
      ? "BCC on Base + caps configured"
      : "set QUIDLI_REWARD_* env and fund Quidli treasury",
  });

  const hardChecks = checks.filter((c) => c.status !== "warn");
  const passed = hardChecks.filter((c) => c.status === "pass").length;
  const overallScore = hardChecks.length > 0 ? Math.round((passed / hardChecks.length) * 100) : 0;

  return {
    ok: checks.every((c) => c.status !== "fail"),
    generatedAt: new Date().toISOString(),
    origin: base,
    overallScore,
    checks,
    addresses: addressesData,
    proofLinks: {
      grantProof: `${base}/grant-proof`,
      ogAgentId: `${base}/0g/agentid`,
      investors: `${base}/investors`,
      places: `${base}/places`,
      forest: `${base}/forest`,
      artDrops: `${base}/drops/art`,
      docs: `${base}/docs`,
    },
    scopeBoundaries: {
      econLive: "ECON_LIVE=0 — full economics gated per deploy/VERIFY_GATE.md",
      tradingAgent: "/api/trading/health may warn until trading sidecar is deployed",
      groveSocial: "X/Farcaster outbound optional until credentials are set",
      notLegalAdvice: "Technical verification — not a securities disclosure",
    },
  };
}

export async function handleGrantVerificationGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? url.host;
  const origin = `${proto}://${host}`;

  const payload = await buildGrantVerificationPayload(origin);
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
}
