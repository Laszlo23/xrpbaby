import {
  BCC_ADDRESS,
  BCC_SYMBOL,
  BCC_UNISWAP_URL,
  buildBnbToBccRoutes,
  buildJumperBnbToBccUrl,
} from "@bc/bcc-kit";

const BINANCE_BNB_PRICE = "https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT";
const DEXSCREENER = `https://api.dexscreener.com/latest/dex/tokens/${BCC_ADDRESS}`;

export async function handleMarketBccBnbRouteGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const bnbAmount = Math.max(0.01, Number(url.searchParams.get("bnb") ?? "0.1") || 0.1);

  const [bnbPrice, bccPrice] = await Promise.all([fetchBnbUsd(), fetchBccUsd()]);

  const routes = buildBnbToBccRoutes();
  const recommended = routes[0];

  let estimate: Record<string, unknown> | null = null;
  if (bnbPrice && bccPrice) {
    const usd = bnbAmount * bnbPrice;
    const approxBcc = usd / bccPrice;
    estimate = {
      bnbAmount,
      bnbUsd: bnbPrice,
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
      chainNote:
        "BCC canonical on Base (8453). BNB Chain users bridge via aggregators — same token, no new coin.",
      recommended: {
        label: recommended.label,
        href: recommended.primaryHref,
        jumperBnb: buildJumperBnbToBccUrl("BNB"),
      },
      routes,
      estimate,
      uniswapUrl: BCC_UNISWAP_URL,
      nativeBscSwapNote:
        "Native BSC swap available when BCC OFT is deployed — use /bridge/bcc or BSC tab on /swap.",
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

async function fetchBnbUsd(): Promise<number | null> {
  try {
    const res = await fetch(BINANCE_BNB_PRICE, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { price?: string };
    const p = Number(data.price);
    return Number.isFinite(p) ? p : null;
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
