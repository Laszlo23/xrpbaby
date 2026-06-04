import {
  BCC_ADDRESS,
  BCC_SYMBOL,
  BCC_UNISWAP_URL,
  buildJumperSolToBccUrl,
  buildSolanaToBccRoutes,
} from "@bc/bcc-kit";

import { proxyTradingAgent } from "@/server/trading-agent-proxy";

const JUPITER_PRICE = "https://api.jup.ag/price/v2?ids=SOL";
const DEXSCREENER = `https://api.dexscreener.com/latest/dex/tokens/${BCC_ADDRESS}`;

export async function handleMarketBccSolanaRouteGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const solAmount = Math.max(0.01, Number(url.searchParams.get("sol") ?? "1") || 1);

  const [solPrice, bccPrice, arb] = await Promise.all([
    fetchSolUsd(),
    fetchBccUsd(),
    proxyTradingAgent(
      `/arbitrage/scan?sol_amount=${solAmount}&eth_amount=0.01&min_spread_bps=50`,
      { method: "GET", timeoutMs: 120_000 },
    ),
  ]);

  const routes = buildSolanaToBccRoutes();
  const recommended = routes[0];

  let estimate: Record<string, unknown> | null = null;
  if (solPrice && bccPrice) {
    const usd = solAmount * solPrice;
    const approxBcc = usd / bccPrice;
    estimate = {
      solAmount,
      solUsd: solPrice,
      bccUsd: bccPrice,
      notionalUsd: Math.round(usd * 100) / 100,
      approxBccAfterFees: Math.round(approxBcc * 0.992 * 1000) / 1000,
      disclaimer: "Approximate; bridge fees and slippage not included.",
    };
  }

  return Response.json(
    {
      ok: true,
      symbol: BCC_SYMBOL,
      bccToken: BCC_ADDRESS,
      chainNote: "BCC settles on Base (8453). Solana wallets bridge or swap via aggregators.",
      recommended: {
        label: recommended.label,
        href: recommended.primaryHref,
        jumperSol: buildJumperSolToBccUrl("SOL"),
      },
      routes,
      estimate,
      uniswapUrl: BCC_UNISWAP_URL,
      arbitrage: arb.ok ? arb.data : { reachable: false, error: arb.error },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

async function fetchSolUsd(): Promise<number | null> {
  try {
    const res = await fetch(JUPITER_PRICE, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { SOL?: { price?: number } } };
    const p = data.data?.SOL?.price;
    return typeof p === "number" ? p : null;
  } catch {
    return null;
  }
}

async function fetchBccUsd(): Promise<number | null> {
  try {
    const res = await fetch(DEXSCREENER, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      pairs?: Array<{ chainId?: string | number; priceUsd?: string; liquidity?: { usd?: number } }>;
    };
    const pairs = data.pairs ?? [];
    const onBase = pairs.filter(
      (p) => String(p.chainId).toLowerCase() === "base" || p.chainId === 8453,
    );
    const list = onBase.length ? onBase : pairs;
    if (!list.length) return null;
    const best = list.reduce((a, b) =>
      Number(b.liquidity?.usd ?? 0) > Number(a.liquidity?.usd ?? 0) ? b : a,
    );
    const px = Number(best.priceUsd);
    return Number.isFinite(px) ? px : null;
  } catch {
    return null;
  }
}
