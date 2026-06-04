from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from trading_agent.config import base_rpc_uri, default_bcc_address, trading_paper_mode
from trading_agent.manifest import build_manifest
from trading_agent.arbitrage import arbitrage_scan
from trading_agent.service import TradingService

logger = logging.getLogger("trading_agent")
_service = TradingService()
_warmup: dict = {"ok": False}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _warmup
    logger.info("Warming sugar-sdk cache (RPC=%s)...", base_rpc_uri()[:48])
    _warmup = await _service.warmup()
    if _warmup.get("ok"):
        logger.info("Warmup ok — %s tokens cached", _warmup.get("tokensCached"))
    else:
        logger.warning("Warmup failed: %s", _warmup.get("error"))
    yield


app = FastAPI(
    title="BC Trading Agent",
    description="Aerodrome/Velodrome quotes via sugar-sdk — unsigned txs only; caller signs.",
    version="0.1.0",
    lifespan=lifespan,
)


class QuoteBody(BaseModel):
    from_token: str = Field(..., description="Symbol (eth) or 0x address")
    to_token: str = Field(..., description="Symbol or 0x address")
    amount: str
    use_decimals: bool = True
    wallet: str | None = None


class SwapPreviewBody(QuoteBody):
    wallet: str = Field(..., description="0x address for unsigned tx `from` field")


@app.get("/health")
async def health() -> dict:
    return {
        "ok": True,
        "chainId": 8453,
        "paperMode": trading_paper_mode(),
        "bcc": default_bcc_address(),
        "rpc": base_rpc_uri()[:56] + ("…" if len(base_rpc_uri()) > 56 else ""),
        "warmup": _warmup,
        "rentableVia": "x402 on BUILDCHAIN /api/trading/*",
    }


@app.get("/manifest")
async def manifest() -> dict:
    return build_manifest()


@app.post("/quote")
async def quote(body: QuoteBody) -> dict:
    try:
        return await _service.quote(
            from_token=body.from_token,
            to_token=body.to_token,
            amount=body.amount,
            use_decimals=body.use_decimals,
            wallet=body.wallet,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e


@app.post("/swap/preview")
async def swap_preview(body: SwapPreviewBody) -> dict:
    try:
        return await _service.swap_preview(
            from_token=body.from_token,
            to_token=body.to_token,
            amount=body.amount,
            use_decimals=body.use_decimals,
            wallet=body.wallet,
        )
    except PermissionError as e:
        raise HTTPException(403, str(e)) from e
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e


@app.get("/quote/bcc")
async def quote_bcc(
    eth_amount: str = Query("0.01", description="ETH amount (human units)"),
    use_decimals: bool = True,
) -> dict:
    try:
        return await _service.bcc_buy_quote(eth_amount=eth_amount, use_decimals=use_decimals)
    except Exception as e:
        raise HTTPException(502, str(e)) from e


@app.get("/arbitrage/scan")
async def arbitrage(
    sol_amount: float = Query(1.0, ge=0.001, le=10_000),
    eth_amount: float = Query(0.01, ge=0.0001, le=100),
    min_spread_bps: int = Query(50, ge=0, le=5000),
) -> dict:
    try:
        return await arbitrage_scan(
            _service,
            sol_amount=sol_amount,
            eth_amount=eth_amount,
            min_spread_bps=min_spread_bps,
        )
    except Exception as e:
        raise HTTPException(502, str(e)) from e


@app.get("/pools")
async def pools(
    token: str | None = Query(None, description="Symbol or 0x; default aero"),
    limit: int = Query(10, ge=1, le=50),
) -> dict:
    try:
        return await _service.pools_for_token(token=token, limit=limit)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e


def main() -> None:
    import uvicorn

    logging.basicConfig(level=logging.INFO)
    port = int(os.environ.get("TRADING_AGENT_PORT", "8765"))
    uvicorn.run("trading_agent.server:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
