from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from trading_agent.xt_service import (
    XtConfirmRequired,
    XtWriteForbidden,
    assert_write_allowed,
    futures_open_or_close,
    get_futures,
    get_spot,
)

router = APIRouter(prefix="/cex/xt", tags=["xt-exchange"])


def _http_from_xt(exc: Exception) -> HTTPException:
    if isinstance(exc, XtWriteForbidden):
        return HTTPException(403, str(exc))
    if isinstance(exc, XtConfirmRequired):
        return HTTPException(400, str(exc))
    if isinstance(exc, RuntimeError):
        return HTTPException(502, str(exc))
    return HTTPException(502, str(exc))


class SpotOrderBody(BaseModel):
    symbol: str
    side: Literal["BUY", "SELL"]
    type: Literal["LIMIT", "MARKET"]
    price: float | str | None = None
    quantity: float | str | None = None
    quote_qty: float | str | None = None
    confirm: bool = False


class SpotTransferBody(BaseModel):
    from_account: str = Field(..., alias="from")
    to_account: str = Field(..., alias="to")
    currency: str
    amount: float | str
    confirm: bool = False

    model_config = {"populate_by_name": True}


class SpotWithdrawBody(BaseModel):
    currency: str
    chain: str
    amount: float | str
    address: str
    confirm: bool = False
    ack_irreversible: bool = False


class FuturesOpenBody(BaseModel):
    symbol: str
    action: Literal["open_long", "open_short", "close_long", "close_short"]
    qty: int | float
    price: float | str | None = None
    market: bool = False
    confirm: bool = False


# ── Spot public ──


@router.get("/spot/ticker")
def spot_ticker(symbol: str = Query(..., min_length=3)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().ticker(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/spot/ticker-24h")
def spot_ticker_24h(symbol: str = Query(..., min_length=3)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().ticker_24h(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/spot/depth")
def spot_depth(symbol: str = Query(...), limit: int | None = Query(None, ge=1, le=100)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().depth(symbol, limit=limit)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/spot/klines")
def spot_klines(
    symbol: str = Query(...),
    interval: str = Query("1h"),
    limit: int = Query(24, ge=1, le=500),
) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().klines(symbol, interval=interval, limit=limit)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/spot/symbol")
def spot_symbol(symbol: str = Query(...)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().symbol_info(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


# ── Spot authenticated reads ──


@router.get("/spot/balance")
def spot_balance(currency: str | None = None) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().balance(currency)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/spot/orders")
def spot_orders(symbol: str | None = None) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().open_orders(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/spot/history")
def spot_history(symbol: str | None = None, limit: int = Query(20, ge=1, le=200)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_spot().history_orders(symbol, limit=limit)}
    except Exception as e:
        raise _http_from_xt(e) from e


# ── Spot writes ──


@router.post("/spot/order")
def spot_place_order(body: SpotOrderBody) -> dict[str, Any]:
    try:
        assert_write_allowed(confirm=body.confirm)
        result = get_spot().place_order(
            symbol=body.symbol,
            side=body.side,
            order_type=body.type,
            price=body.price,
            quantity=body.quantity,
            quote_qty=body.quote_qty,
        )
        return {"ok": True, "result": result}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.delete("/spot/order/{order_id}")
def spot_cancel_order(order_id: str, confirm: bool = Query(False)) -> dict[str, Any]:
    try:
        assert_write_allowed(confirm=confirm)
        return {"ok": True, "result": get_spot().cancel_order(order_id)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.delete("/spot/orders")
def spot_cancel_all(symbol: str | None = None, confirm: bool = Query(False)) -> dict[str, Any]:
    try:
        assert_write_allowed(confirm=confirm)
        return {"ok": True, "result": get_spot().cancel_all(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.post("/spot/transfer")
def spot_transfer(body: SpotTransferBody) -> dict[str, Any]:
    try:
        assert_write_allowed(confirm=body.confirm)
        result = get_spot().transfer(body.from_account, body.to_account, body.currency, body.amount)
        return {"ok": True, "result": result}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.post("/spot/withdraw")
def spot_withdraw(body: SpotWithdrawBody) -> dict[str, Any]:
    try:
        assert_write_allowed(confirm=body.confirm, irreversible=True, ack_irreversible=body.ack_irreversible)
        result = get_spot().withdraw(body.currency, body.chain, body.amount, body.address)
        return {
            "ok": True,
            "warning": "Withdrawal submitted — irreversible on-chain transfer",
            "params": {
                "currency": body.currency,
                "chain": body.chain,
                "amount": str(body.amount),
                "address": body.address,
            },
            "result": result,
        }
    except Exception as e:
        raise _http_from_xt(e) from e


# ── Futures public ──


@router.get("/futures/ticker")
def futures_ticker(symbol: str = Query(...)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().ticker(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/futures/depth")
def futures_depth(symbol: str = Query(...), limit: int = Query(20, ge=1, le=100)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().depth(symbol, limit=limit)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/futures/funding-rate")
def futures_funding_rate(symbol: str = Query(...)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().funding_rate(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/futures/klines")
def futures_klines(
    symbol: str = Query(...),
    interval: str = Query("1h"),
    limit: int = Query(24, ge=1, le=500),
) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().klines(symbol, interval=interval, limit=limit)}
    except Exception as e:
        raise _http_from_xt(e) from e


# ── Futures authenticated reads ──


@router.get("/futures/account")
def futures_account() -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().account()}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/futures/positions")
def futures_positions(symbol: str | None = None) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().positions(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/futures/orders")
def futures_orders(symbol: str | None = None) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().open_orders(symbol)}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.get("/futures/history")
def futures_history(symbol: str | None = None, limit: int = Query(20, ge=1, le=200)) -> dict[str, Any]:
    try:
        return {"ok": True, "result": get_futures().history_orders(symbol, limit=limit)}
    except Exception as e:
        raise _http_from_xt(e) from e


# ── Futures writes ──


@router.post("/futures/open")
def futures_open(body: FuturesOpenBody) -> dict[str, Any]:
    try:
        result = futures_open_or_close(
            body.action,
            symbol=body.symbol,
            qty=body.qty,
            price=body.price,
            market=body.market,
            confirm=body.confirm,
        )
        return {"ok": True, "action": body.action, "result": result}
    except Exception as e:
        raise _http_from_xt(e) from e


@router.delete("/futures/order/{order_id}")
def futures_cancel_order(order_id: str, confirm: bool = Query(False)) -> dict[str, Any]:
    try:
        assert_write_allowed(confirm=confirm)
        return {"ok": True, "result": get_futures().cancel_order(order_id)}
    except Exception as e:
        raise _http_from_xt(e) from e
