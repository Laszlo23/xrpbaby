from __future__ import annotations

import asyncio
from typing import Any

from sugar.chains import AsyncBaseChain

from trading_agent.config import (
    BASE_CHAIN_ID,
    base_rpc_uri,
    bcc_uniswap_url,
    default_bcc_address,
    trading_paper_mode,
)
from trading_agent.serialize import pool_to_dict, quote_to_dict, txs_to_list


class TradingService:
    """Thin wrapper around sugar-sdk AsyncBaseChain for agent / HTTP use."""

    def __init__(self, rpc_uri: str | None = None) -> None:
        self._rpc_uri = rpc_uri or base_rpc_uri()
        self._token_cache: dict[str, Any] | None = None
        self._pools_cache: list[Any] | None = None
        self._lock = asyncio.Lock()
        self._warmup_error: str | None = None

    def _chain_ctx(self, wallet: str | None = None) -> AsyncBaseChain:
        kwargs: dict[str, Any] = {"rpc_uri": self._rpc_uri}
        if wallet:
            kwargs["signer_address"] = wallet
        return AsyncBaseChain(**kwargs)

    async def _tokens_by_address(self, chain: AsyncBaseChain) -> dict[str, Any]:
        async with self._lock:
            if self._token_cache is None:
                tokens = await chain.get_all_tokens()
                self._token_cache = {
                    (t.token_address or "").lower(): t for t in tokens if getattr(t, "token_address", None)
                }
        return self._token_cache

    async def resolve_token(self, chain: AsyncBaseChain, ref: str) -> Any:
        ref = ref.strip()
        sym = ref.lower()
        if sym in ("eth", "weth"):
            return chain.eth
        if sym == "usdc":
            return chain.usdc
        if sym in ("aero", "aerodrome"):
            return chain.aero
        if ref.startswith("0x"):
            addr = ref.lower()
            if addr == default_bcc_address().lower():
                return await self._resolve_bcc_token(chain)
            tokens = await self._tokens_by_address(chain)
            token = tokens.get(addr)
            if token is None:
                raise ValueError(f"Unknown token address on Base: {ref}")
            return token
        tokens = await self._tokens_by_address(chain)
        for t in tokens.values():
            if (getattr(t, "symbol", "") or "").lower() == sym:
                return t
        raise ValueError(f"Unknown token symbol on Base: {ref}")

    async def _resolve_bcc_token(self, chain: AsyncBaseChain) -> Any:
        """BCC by address without loading the full token registry when possible."""
        tokens = await self._tokens_by_address(chain)
        bcc = tokens.get(default_bcc_address().lower())
        if bcc is not None:
            return bcc
        raise ValueError(
            f"BCC not in Aerodrome token list at {default_bcc_address()}. "
            "Set SUGAR_RPC_URI_8453 to a dedicated Base RPC (Alchemy/QuickNode)."
        )

    async def quote(
        self,
        *,
        from_token: str,
        to_token: str,
        amount: str,
        use_decimals: bool = True,
        wallet: str | None = None,
    ) -> dict[str, Any]:
        async with self._chain_ctx(wallet) as chain:
            t_in = await self.resolve_token(chain, from_token)
            t_out = await self.resolve_token(chain, to_token)
            raw_amount = float(amount) if use_decimals else int(amount)
            if use_decimals:
                amount_wei = t_in.parse_units(raw_amount)
            else:
                amount_wei = int(raw_amount)
            quote = await chain.get_quote(from_token=t_in, to_token=t_out, amount=amount_wei)
            return {
                "chainId": BASE_CHAIN_ID,
                "paperMode": trading_paper_mode(),
                "quote": quote_to_dict(quote),
            }

    async def swap_preview(
        self,
        *,
        from_token: str,
        to_token: str,
        amount: str,
        wallet: str,
        use_decimals: bool = True,
    ) -> dict[str, Any]:
        if trading_paper_mode():
            raise PermissionError(
                "TRADING_AGENT_PAPER_MODE=1 — swap previews disabled. Set TRADING_AGENT_PAPER_MODE=0 to enable unsigned tx output."
            )
        async with self._chain_ctx(wallet) as chain:
            t_in = await self.resolve_token(chain, from_token)
            t_out = await self.resolve_token(chain, to_token)
            raw_amount = float(amount) if use_decimals else int(amount)
            amount_wei = t_in.parse_units(raw_amount) if use_decimals else int(raw_amount)
            quote = await chain.get_quote(from_token=t_in, to_token=t_out, amount=amount_wei)
            txs = await chain.swap_from_quote(quote)
            return {
                "chainId": BASE_CHAIN_ID,
                "quote": quote_to_dict(quote),
                "unsignedTxs": txs_to_list(txs),
            }

    async def _get_pools_cached(self, chain: AsyncBaseChain) -> list[Any]:
        async with self._lock:
            if self._pools_cache is None:
                self._pools_cache = await chain.get_pools()
        return self._pools_cache

    async def warmup(self) -> dict[str, Any]:
        """Pre-load token registry so first user quote is faster."""
        try:
            async with self._chain_ctx() as chain:
                await self._tokens_by_address(chain)
                self._warmup_error = None
                return {"ok": True, "tokensCached": len(self._token_cache or {})}
        except Exception as e:
            self._warmup_error = str(e)
            return {"ok": False, "error": str(e)}

    async def pools_for_token(self, *, token: str | None = None, limit: int = 10) -> dict[str, Any]:
        token_ref = (token or "aero").strip()
        bcc_addr = default_bcc_address().lower()
        if token_ref.lower() == bcc_addr or token_ref.lower() == "bcc":
            return {
                "chainId": BASE_CHAIN_ID,
                "token": {"address": default_bcc_address(), "symbol": "BCC"},
                "pools": [],
                "routing": "uniswap",
                "note": "BCC primary liquidity is on Uniswap (not Aerodrome).",
                "buyBccUrl": bcc_uniswap_url(),
            }
        async with self._chain_ctx() as chain:
            try:
                t = await self.resolve_token(chain, token_ref)
            except ValueError as e:
                raise ValueError(str(e)) from e
            pools = await self._get_pools_cached(chain)
            addr = (t.token_address or "").lower()
            matched = [
                p
                for p in pools
                if (p.token0.token_address or "").lower() == addr
                or (p.token1.token_address or "").lower() == addr
            ][:limit]
            return {
                "chainId": BASE_CHAIN_ID,
                "token": {"address": t.token_address, "symbol": t.symbol},
                "pools": [pool_to_dict(p) for p in matched],
            }

    async def bcc_buy_quote(self, *, eth_amount: str, use_decimals: bool = True) -> dict[str, Any]:
        """ETH → BCC on Aerodrome when listed; otherwise ETH→USDC proxy + Uniswap link."""
        try:
            direct = await self.quote(
                from_token="eth",
                to_token=default_bcc_address(),
                amount=eth_amount,
                use_decimals=use_decimals,
            )
            return {**direct, "routing": "aerodrome", "buyBccUrl": None}
        except ValueError:
            proxy = await self.quote(
                from_token="eth",
                to_token="usdc",
                amount=eth_amount,
                use_decimals=use_decimals,
            )
            return {
                **proxy,
                "routing": "uniswap_fallback",
                "targetToken": {
                    "address": default_bcc_address(),
                    "symbol": "BCC",
                },
                "note": "BCC is not routed on Aerodrome; use Uniswap for BCC. Proxy quote shows ETH→USDC on Aerodrome.",
                "buyBccUrl": bcc_uniswap_url(),
            }
