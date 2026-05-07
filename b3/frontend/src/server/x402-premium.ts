/**
 * Server-only x402 handler — imported dynamically from API route handlers only.
 * Mirrors thirdweb’s facilitator + settlePayment flow (GET + x-payment header).
 */
import { settlePayment } from "thirdweb/x402";

import { homeDrops } from "@/content/home-drops";
import { getX402Facilitator } from "@/lib/thirdweb-server";
import { resolveX402ResourceUrl } from "@/lib/x402-resource-url";
import { getX402SettlementChain } from "@/lib/x402-network";

const corsMethodsAndHeaders: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-payment, payment-signature, X-Payment, Payment-Signature",
  "Access-Control-Expose-Headers": "*",
};

/**
 * Defaults: allow browsers only from `PUBLIC_APP_ORIGIN` and optional `X402_CORS_ORIGINS`
 * (comma-separated). Agents/curl (no `Origin`) get `*`. Set `X402_ALLOW_ANY_ORIGIN=1` only if
 * you intentionally need global `*` (not recommended for production).
 */
export function premiumCorsHeadersFor(request: Request): Record<string, string> {
  if (process.env.X402_ALLOW_ANY_ORIGIN === "1" || process.env.X402_ALLOW_ANY_ORIGIN === "true") {
    return { ...corsMethodsAndHeaders, "Access-Control-Allow-Origin": "*" };
  }

  const origin = request.headers.get("origin");
  const pub = process.env.PUBLIC_APP_ORIGIN?.replace(/\/$/, "").trim();
  const extras = (process.env.X402_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = new Set<string>([...(pub ? [pub] : []), ...extras]);

  if (!origin) {
    return { ...corsMethodsAndHeaders, "Access-Control-Allow-Origin": "*" };
  }

  if (allowed.size === 0) {
    return { ...corsMethodsAndHeaders, "Access-Control-Allow-Origin": "*" };
  }

  if (allowed.has(origin)) {
    return {
      ...corsMethodsAndHeaders,
      "Access-Control-Allow-Origin": origin,
      Vary: "Origin",
    };
  }

  return { ...corsMethodsAndHeaders };
}

export function handlePremiumOptions(request: Request): Response {
  const origin = request.headers.get("origin");
  if (
    origin &&
    !(process.env.X402_ALLOW_ANY_ORIGIN === "1" || process.env.X402_ALLOW_ANY_ORIGIN === "true")
  ) {
    const pub = process.env.PUBLIC_APP_ORIGIN?.replace(/\/$/, "").trim();
    const extras = (process.env.X402_CORS_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const allowed = new Set<string>([...(pub ? [pub] : []), ...extras]);
    if (allowed.size > 0 && !allowed.has(origin)) {
      return new Response(null, { status: 403 });
    }
  }
  return new Response(null, { status: 204, headers: premiumCorsHeadersFor(request) });
}

function optionalPayTo(): string | undefined {
  const raw = process.env.X402_PAY_TO?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw;
}

function x402Price(): string {
  return (process.env.X402_PRICE?.trim() || "$0.01") as string;
}

/** Paid feed: public copy only — expand with Strapi when editorial workflow is ready. */
function buildPremiumDropAnnouncementsFeed() {
  return {
    ok: true as const,
    feed: "buildchain_premium_drop_teasers_v1",
    description:
      "x402-paid JSON feed of active vault drop titles and timing hints. Counsel-approved public copy only.",
    items: homeDrops.map((d) => ({
      slug: d.slug,
      title: d.title,
      rarity: d.rarity,
      endsAt: d.endsAt.toISOString(),
      assetLine: d.assetValueLabel,
    })),
    generatedAt: new Date().toISOString(),
  };
}

export async function handlePremiumX402Get(request: Request): Promise<Response> {
  try {
    const paymentData =
      request.headers.get("payment-signature") ?? request.headers.get("x-payment");
    const resourceUrl = resolveX402ResourceUrl(request);

    const result = await settlePayment({
      resourceUrl,
      method: "GET",
      paymentData,
      network: getX402SettlementChain(),
      price: x402Price(),
      facilitator: getX402Facilitator(),
      payTo: optionalPayTo(),
      routeConfig: {
        description: "Premium BUILDCHAIN drop teaser feed (JSON, x402)",
        mimeType: "application/json",
      },
    });

    const cors = premiumCorsHeadersFor(request);

    if (result.status === 200) {
      return Response.json(buildPremiumDropAnnouncementsFeed(), {
        headers: { ...cors, ...result.responseHeaders },
      });
    }

    return new Response(JSON.stringify(result.responseBody), {
      status: result.status,
      headers: {
        "Content-Type": "application/json",
        ...result.responseHeaders,
        ...cors,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "x402 configuration or settlement failed";
    return Response.json(
      { error: message },
      { status: 503, headers: premiumCorsHeadersFor(request) },
    );
  }
}
