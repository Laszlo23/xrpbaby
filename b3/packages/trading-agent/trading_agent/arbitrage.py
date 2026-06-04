from __future__ import annotations

from typing import Any

from trading_agent.config import BASE_CHAIN_ID, bcc_uniswap_url, default_bcc_address, trading_paper_mode
from trading_agent.prices import (
    fetch_bcc_usd_on_base,
    fetch_jupiter_sol_to_usdc_quote,
    fetch_sol_usd,
)
from trading_agent.service import TradingService


# Estimated bridge + second-leg friction (bps) for Solana → Base → BCC modeling.
DEFAULT_BRIDGE_FRICTION_BPS = 80


async def arbitrage_scan(
    service: TradingService,
    *,
    sol_amount: float = 1.0,
    eth_amount: float = 0.01,
    min_spread_bps: int = 50,
    bridge_friction_bps: int = DEFAULT_BRIDGE_FRICTION_BPS,
) -> dict[str, Any]:
    """
    Compare multichain acquisition paths for BCC and Base DEX quotes.
    Returns read-only opportunities for agents (no auto-execution).
    """
    bcc_addr = default_bcc_address()
    bcc_usd = await fetch_bcc_usd_on_base()
    sol_usd = await fetch_sol_usd()
    jup_sol_usdc = await fetch_jupiter_sol_to_usdc_quote(sol_amount=sol_amount)

    base_eth_usdc: dict[str, Any] | None = None
    base_eth_bcc: dict[str, Any] | None = None
    base_errors: list[str] = []

    try:
        base_eth_usdc = await service.quote(
            from_token="eth",
            to_token="usdc",
            amount=str(eth_amount),
            use_decimals=True,
        )
    except Exception as e:
        base_errors.append(f"base_eth_usdc: {e}")

    try:
        base_eth_bcc = await service.bcc_buy_quote(eth_amount=str(eth_amount), use_decimals=True)
    except Exception as e:
        base_errors.append(f"base_eth_bcc: {e}")

    prices: dict[str, Any] = {
        "bccOnBase": bcc_usd,
        "solOnSolana": sol_usd,
        "jupiterSolToUsdc": jup_sol_usdc,
        "baseEthToUsdc": base_eth_usdc,
        "baseEthToBcc": base_eth_bcc,
    }

    opportunities: list[dict[str, Any]] = []

    if bcc_usd and sol_usd and jup_sol_usdc:
        usdc_per_sol = jup_sol_usdc["usdcOut"] / sol_amount if sol_amount > 0 else 0
        implied_bcc_from_sol = usdc_per_sol / bcc_usd["usd"] if bcc_usd["usd"] > 0 else 0
        friction = 1.0 - bridge_friction_bps / 10_000
        effective_bcc = implied_bcc_from_sol * friction
        direct_bcc_per_sol = sol_usd["usd"] / bcc_usd["usd"] if bcc_usd["usd"] > 0 else 0
        spread_bps = 0
        if direct_bcc_per_sol > 0:
            spread_bps = int((effective_bcc / direct_bcc_per_sol - 1.0) * 10_000)

        opportunities.append(
            {
                "id": "solana_bridge_vs_spot_bcc",
                "type": "cross_chain_bcc_buy",
                "chains": ["solana", "base"],
                "description": (
                    f"Model: {sol_amount} SOL → USDC (Jupiter) → bridge → BCC on Base "
                    f"vs spot BCC/USD on Base."
                ),
                "spreadBps": spread_bps,
                "actionable": abs(spread_bps) >= min_spread_bps,
                "paperOnly": True,
                "metrics": {
                    "solAmount": sol_amount,
                    "impliedBccPerSolAfterBridge": round(effective_bcc, 6),
                    "spotBccPerSolUsdParity": round(direct_bcc_per_sol, 6),
                    "bridgeFrictionBps": bridge_friction_bps,
                },
                "links": {
                    "buyBccUniswap": bcc_uniswap_url(),
                    "jumperSolToBcc": _jumper_sol_to_bcc_url(),
                },
            }
        )

    if base_eth_bcc and base_eth_usdc:
        routing = base_eth_bcc.get("routing")
        if routing == "uniswap_fallback":
            q = (base_eth_bcc.get("quote") or {}).get("amount_out")
            opportunities.append(
                {
                    "id": "base_bcc_uniswap_only",
                    "type": "base_routing",
                    "chains": ["base"],
                    "description": "BCC not on Aerodrome; ETH→BCC uses Uniswap. ETH→USDC Aerodrome quote is a proxy.",
                    "spreadBps": 0,
                    "actionable": False,
                    "paperOnly": True,
                    "metrics": {"ethAmount": eth_amount, "proxyUsdcOut": q},
                    "links": {"buyBccUniswap": bcc_uniswap_url()},
                }
            )
        elif routing == "aerodrome":
            opportunities.append(
                {
                    "id": "base_bcc_aerodrome_direct",
                    "type": "base_routing",
                    "chains": ["base"],
                    "description": "Direct ETH→BCC on Aerodrome (pool listed).",
                    "spreadBps": 0,
                    "actionable": True,
                    "paperOnly": trading_paper_mode(),
                    "metrics": {"ethAmount": eth_amount},
                    "links": {"buyBccUniswap": bcc_uniswap_url()},
                }
            )

    if bcc_usd and base_eth_usdc:
        try:
            raw_out = (base_eth_usdc.get("quote") or {}).get("amount_out", 0)
            usdc_out = float(raw_out) / 1_000_000 if raw_out else 0.0
            bcc_from_eth_proxy = usdc_out / bcc_usd["usd"] if bcc_usd["usd"] > 0 else 0
            opportunities.append(
                {
                    "id": "base_eth_usdc_bcc_implied",
                    "type": "base_two_hop",
                    "chains": ["base"],
                    "description": (
                        f"Implied BCC from {eth_amount} ETH via Aerodrome ETH→USDC "
                        f"then Uniswap USDC→BCC at Dexscreener price."
                    ),
                    "spreadBps": 0,
                    "actionable": False,
                    "paperOnly": True,
                    "metrics": {
                        "ethAmount": eth_amount,
                        "usdcFromAerodrome": usdc_out,
                        "impliedBcc": round(bcc_from_eth_proxy, 4),
                        "bccUsd": bcc_usd["usd"],
                    },
                    "links": {"buyBccUniswap": bcc_uniswap_url()},
                }
            )
        except (TypeError, ValueError):
            pass

    actionable = [o for o in opportunities if o.get("actionable")]

    return {
        "chainId": BASE_CHAIN_ID,
        "paperMode": trading_paper_mode(),
        "bccToken": bcc_addr,
        "minSpreadBps": min_spread_bps,
        "prices": prices,
        "opportunities": opportunities,
        "actionableCount": len(actionable),
        "errors": base_errors,
        "agentNotes": [
            "Read-only scan. Execute via signed txs on each chain; bridge latency and fees are estimates.",
            "Solana path: use Jumper/deBridge links in market API / bcc-kit for user-facing buy flow.",
            "Set TRADING_AGENT_PAPER_MODE=0 only when swap previews are approved for live legs on Base.",
        ],
    }


def _jumper_sol_to_bcc_url() -> str:
    params = (
        "fromChain=SOL&fromToken=SOL&toChain=8453&toToken="
        + default_bcc_address()
    )
    return f"https://jumper.exchange/?{params}"
