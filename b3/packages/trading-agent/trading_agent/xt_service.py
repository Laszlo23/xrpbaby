from __future__ import annotations

from typing import Any, Literal

from trading_agent.xt_config import xt_paper_mode, xt_trading_enabled
from trading_agent.xt_futures import XtFutures
from trading_agent.xt_spot import XtSpot

_spot: XtSpot | None = None
_futures: XtFutures | None = None


class XtWriteForbidden(Exception):
    pass


class XtConfirmRequired(Exception):
    pass


def get_spot() -> XtSpot:
    global _spot
    if _spot is None:
        _spot = XtSpot()
    return _spot


def get_futures() -> XtFutures:
    global _futures
    if _futures is None:
        _futures = XtFutures()
    return _futures


def assert_write_allowed(*, confirm: bool, irreversible: bool = False, ack_irreversible: bool = False) -> None:
    if not xt_trading_enabled():
        raise XtWriteForbidden("XT trading writes disabled (set XT_TRADING_ENABLED=1)")
    if xt_paper_mode():
        raise XtWriteForbidden("XT paper mode blocks writes (set XT_PAPER_MODE=0 for live trading)")
    if not confirm:
        raise XtConfirmRequired("confirm: true required for write operations")
    if irreversible and not ack_irreversible:
        raise XtConfirmRequired("ack_irreversible: true required for withdrawals")


def spot_ticker_price(symbol: str) -> float | None:
    """Best-effort spot last price for arbitrage."""
    result = get_spot().ticker(symbol)
    items = result if isinstance(result, list) else [result]
    if not items:
        return None
    row = items[0] if isinstance(items[0], dict) else {}
    raw = row.get("p") or row.get("c") or row.get("price")
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


FuturesAction = Literal["open_long", "open_short", "close_long", "close_short"]


def futures_open_or_close(
    action: FuturesAction,
    *,
    symbol: str,
    qty: int | float,
    price: float | str | None = None,
    market: bool = False,
    confirm: bool,
) -> Any:
    assert_write_allowed(confirm=confirm)
    client = get_futures()
    if action == "open_long":
        return client.open_long(symbol, qty, price=price, market=market)
    if action == "open_short":
        return client.open_short(symbol, qty, price=price, market=market)
    if action == "close_long":
        return client.close_long(symbol, qty, price=price, market=market)
    if action == "close_short":
        return client.close_short(symbol, qty, price=price, market=market)
    raise ValueError(f"unknown futures action: {action}")
