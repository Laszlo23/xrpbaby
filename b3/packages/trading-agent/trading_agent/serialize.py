from __future__ import annotations

from typing import Any


def _token(t: Any) -> dict[str, Any]:
    return {
        "address": getattr(t, "token_address", None) or getattr(t, "address", None),
        "symbol": getattr(t, "symbol", None),
        "decimals": getattr(t, "decimals", None),
    }


def quote_to_dict(quote: Any) -> dict[str, Any]:
    """Best-effort JSON for sugar Quote objects across SDK versions."""
    out: dict[str, Any] = {}
    for key in (
        "amount_in",
        "amount_out",
        "price",
        "price_impact",
        "route",
        "gas",
        "min_amount_out",
    ):
        if hasattr(quote, key):
            val = getattr(quote, key)
            out[key] = str(val) if isinstance(val, int) else val
    if hasattr(quote, "token_in"):
        out["token_in"] = _token(quote.token_in)
    if hasattr(quote, "token_out"):
        out["token_out"] = _token(quote.token_out)
    if hasattr(quote, "from_token"):
        out["from_token"] = _token(quote.from_token)
    if hasattr(quote, "to_token"):
        out["to_token"] = _token(quote.to_token)
    return out


def pool_to_dict(pool: Any) -> dict[str, Any]:
    return {
        "address": getattr(pool, "pool_address", None) or getattr(pool, "address", None),
        "symbol": getattr(pool, "symbol", None),
        "type": getattr(pool, "type", None),
        "tvl": str(getattr(pool, "tvl", "")) if getattr(pool, "tvl", None) is not None else None,
        "apr": getattr(pool, "apr", None),
        "token0": _token(pool.token0) if hasattr(pool, "token0") else None,
        "token1": _token(pool.token1) if hasattr(pool, "token1") else None,
    }


def txs_to_list(txs: list[Any]) -> list[dict[str, str]]:
    return [
        {
            "from": str(tx.get("from", "")),
            "to": str(tx.get("to", "")),
            "data": str(tx.get("data", "")),
            "value": str(tx.get("value", "0")),
        }
        for tx in txs
    ]
