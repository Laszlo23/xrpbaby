from __future__ import annotations

import logging
from typing import Any

import httpx

from trading_agent.config import default_bcc_address

logger = logging.getLogger(__name__)

DEXSCREENER_TOKEN_URL = "https://api.dexscreener.com/latest/dex/tokens/{address}"
JUPITER_PRICE_URL = "https://api.jup.ag/price/v2"
JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote"

SOL_MINT = "So11111111111111111111111111111111111111112"
SOL_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"


async def fetch_bcc_usd_on_base() -> dict[str, Any] | None:
    """Spot USD price for BCC on Base from Dexscreener."""
    addr = default_bcc_address()
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(DEXSCREENER_TOKEN_URL.format(address=addr))
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Dexscreener BCC fetch failed: %s", e)
        return None

    pairs = data.get("pairs") or []
    base_pairs = [
        p
        for p in pairs
        if str(p.get("chainId", "")).lower() in ("base", "8453")
        or (p.get("chainId") == 8453)
    ]
    if not base_pairs:
        base_pairs = pairs[:3]
    if not base_pairs:
        return None

    best = max(base_pairs, key=lambda p: float(p.get("liquidity", {}).get("usd", 0) or 0))
    price = best.get("priceUsd")
    if price is None:
        return None
    return {
        "usd": float(price),
        "dex": best.get("dexId"),
        "pairAddress": best.get("pairAddress"),
        "liquidityUsd": float((best.get("liquidity") or {}).get("usd", 0) or 0),
        "source": "dexscreener",
    }


async def fetch_sol_usd() -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(JUPITER_PRICE_URL, params={"ids": "SOL"})
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Jupiter SOL price failed: %s", e)
        return None

    sol = (data.get("data") or {}).get("SOL") or {}
    price = sol.get("price")
    if price is None:
        return None
    return {"usd": float(price), "source": "jupiter"}


async def fetch_jupiter_sol_to_usdc_quote(*, sol_amount: float) -> dict[str, Any] | None:
    """Human SOL amount → USDC out on Solana (for cross-chain cost modeling)."""
    lamports = int(sol_amount * 1_000_000_000)
    if lamports <= 0:
        return None
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                JUPITER_QUOTE_URL,
                params={
                    "inputMint": SOL_MINT,
                    "outputMint": SOL_USDC_MINT,
                    "amount": str(lamports),
                    "slippageBps": "50",
                },
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Jupiter quote failed: %s", e)
        return None

    out_amount = int(data.get("outAmount", 0))
    usdc_out = out_amount / 1_000_000
    price_impact = data.get("priceImpactPct")
    return {
        "solIn": sol_amount,
        "usdcOut": usdc_out,
        "priceImpactPct": float(price_impact) if price_impact is not None else None,
        "source": "jupiter",
    }
