/**
 * Shared Thirdweb x402 settlement for GET JSON APIs.
 */
import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";

import { resolveX402ResourceUrl } from "@/lib/x402-resource-url";
import { getX402SettlementChain } from "@/lib/x402-network";

let facilitatorSingleton: ReturnType<typeof facilitator> | null = null;

function getServerWalletAddress(): `0x${string}` {
  const w = process.env.X402_SERVER_WALLET_ADDRESS?.trim();
  if (!w || !/^0x[a-fA-F0-9]{40}$/.test(w)) {
    throw new Error(
      "X402_SERVER_WALLET_ADDRESS is missing or invalid. Set a 0x-prefixed 40-hex address for the x402 server wallet.",
    );
  }
  return w as `0x${string}`;
}

function getThirdwebServerClient() {
  const secretKey = process.env.THIRDWEB_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("THIRDWEB_SECRET_KEY is required for server-side thirdweb (x402).");
  }
  return createThirdwebClient({ secretKey });
}

export function getX402Facilitator() {
  if (!facilitatorSingleton) {
    facilitatorSingleton = facilitator({
      client: getThirdwebServerClient(),
      serverWalletAddress: getServerWalletAddress(),
    });
  }
  return facilitatorSingleton;
}

export const x402CorsMethodsAndHeaders: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-payment, payment-signature, X-Payment, Payment-Signature, X-Trading-Internal-Secret",
  "Access-Control-Expose-Headers": "*",
};

export function x402CorsHeadersFor(request: Request): Record<string, string> {
  if (process.env.X402_ALLOW_ANY_ORIGIN === "1" || process.env.X402_ALLOW_ANY_ORIGIN === "true") {
    return { ...x402CorsMethodsAndHeaders, "Access-Control-Allow-Origin": "*" };
  }

  const origin = request.headers.get("origin");
  const pub = process.env.PUBLIC_APP_ORIGIN?.replace(/\/$/, "").trim();
  const extras = (process.env.X402_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = new Set<string>([...(pub ? [pub] : []), ...extras]);

  if (!origin) {
    return { ...x402CorsMethodsAndHeaders, "Access-Control-Allow-Origin": "*" };
  }

  if (allowed.size === 0) {
    return { ...x402CorsMethodsAndHeaders, "Access-Control-Allow-Origin": "*" };
  }

  if (allowed.has(origin)) {
    return {
      ...x402CorsMethodsAndHeaders,
      "Access-Control-Allow-Origin": origin,
      Vary: "Origin",
    };
  }

  return { ...x402CorsMethodsAndHeaders };
}

export function handleX402Options(request: Request): Response {
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
  return new Response(null, { status: 204, headers: x402CorsHeadersFor(request) });
}

export function optionalX402PayTo(): string | undefined {
  const raw = process.env.X402_PAY_TO?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw;
}

export type X402GetSettleOptions = {
  price: string;
  description: string;
  mimeType?: string;
};

export async function settleX402Get(
  request: Request,
  opts: X402GetSettleOptions,
  buildBody: () => object,
): Promise<Response> {
  const paymentData = request.headers.get("payment-signature") ?? request.headers.get("x-payment");
  const resourceUrl = resolveX402ResourceUrl(request);

  const result = await settlePayment({
    resourceUrl,
    method: "GET",
    paymentData,
    network: getX402SettlementChain(),
    price: opts.price,
    facilitator: getX402Facilitator(),
    payTo: optionalX402PayTo(),
    routeConfig: {
      description: opts.description,
      mimeType: opts.mimeType ?? "application/json",
    },
  });

  const cors = x402CorsHeadersFor(request);

  if (result.status === 200) {
    return Response.json(buildBody(), {
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
}
