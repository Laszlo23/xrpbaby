from __future__ import annotations

import hashlib
import hmac
import time
from typing import Any

import requests

from trading_agent.xt_config import load_xt_credentials, xt_futures_host

DEFAULT_TIMEOUT = 10


class XtFutures:
    """XT.COM USDT-M perpetual futures client (fapi.xt.com)."""

    def __init__(
        self,
        host: str | None = None,
        access_key: str | None = None,
        secret_key: str | None = None,
    ) -> None:
        self.host = host or xt_futures_host()
        if access_key and secret_key:
            self.access_key, self.secret_key = access_key, secret_key
        else:
            self.access_key, self.secret_key = load_xt_credentials()
        self.anonymous = not (self.access_key and self.secret_key)
        self.timeout = DEFAULT_TIMEOUT

    def _make_sign(self, path: str, params: dict[str, Any] | None = None) -> tuple[str, str]:
        ts = str(int(time.time() * 1000))
        msg = f"xt-validate-appkey={self.access_key}&xt-validate-timestamp={ts}"
        if params:
            param_str = "&".join(f"{k}={params[k]}" for k in sorted(params))
            msg += f"#{path}#{param_str}"
        else:
            msg += f"#{path}"
        sig = hmac.new(
            self.secret_key.encode("utf-8"),
            msg.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return ts, sig

    def _auth_headers(self, path: str, params: dict[str, Any] | None = None) -> dict[str, str]:
        ts, sig = self._make_sign(path, params)
        return {
            "Content-type": "application/x-www-form-urlencoded",
            "xt-validate-appkey": self.access_key,
            "xt-validate-timestamp": ts,
            "xt-validate-signature": sig,
            "xt-validate-algorithms": "HmacSHA256",
            "xt-validate-recvwindow": "60000",
        }

    def _req(
        self,
        path: str,
        method: str = "GET",
        params: dict[str, Any] | None = None,
        auth: bool = True,
    ) -> Any:
        if auth and self.anonymous:
            raise RuntimeError(
                "XT API key required. Set XT_ACCESS_KEY and XT_SECRET_KEY or ~/.xt-exchange/credentials.json"
            )
        full_url = self.host + path

        if auth:
            headers = self._auth_headers(path, params)
            if method == "GET":
                resp = requests.get(full_url, params=params, headers=headers, timeout=self.timeout)
            else:
                resp = requests.post(full_url, params=params, headers=headers, timeout=self.timeout)
        else:
            headers = {"Content-type": "application/json"}
            resp = requests.request(method, full_url, params=params, headers=headers, timeout=self.timeout)

        resp.raise_for_status()
        res = resp.json()
        rc = res.get("returnCode", res.get("rc", 0))
        if rc != 0:
            mc = res.get("msgInfo", res.get("mc", "UNKNOWN"))
            raise RuntimeError(f"XT futures API error [{mc}]: {res}")
        return res.get("result", res.get("data", res))

    def ticker(self, symbol: str) -> Any:
        return self._req(
            "/future/market/v1/public/q/ticker",
            params={"symbol": symbol},
            auth=False,
        )

    def depth(self, symbol: str, limit: int = 20) -> Any:
        return self._req(
            "/future/market/v1/public/q/depth",
            params={"symbol": symbol, "level": limit},
            auth=False,
        )

    def funding_rate(self, symbol: str) -> Any:
        return self._req(
            "/future/market/v1/public/q/funding-rate",
            params={"symbol": symbol},
            auth=False,
        )

    def klines(self, symbol: str, interval: str = "1h", limit: int = 24) -> Any:
        return self._req(
            "/future/market/v1/public/q/kline",
            params={"symbol": symbol, "interval": interval, "limit": limit},
            auth=False,
        )

    def account(self) -> Any:
        return self._req("/future/user/v1/balance/list")

    def positions(self, symbol: str | None = None) -> Any:
        params: dict[str, Any] = {}
        if symbol:
            params["symbol"] = symbol
        return self._req("/future/user/v1/position/list", params=params)

    def open_orders(self, symbol: str | None = None) -> Any:
        params: dict[str, Any] = {"state": "UNFINISHED", "page": 1, "size": 50}
        if symbol:
            params["symbol"] = symbol
        return self._req("/future/trade/v1/order-entrust/list", params=params)

    def place_order(
        self,
        symbol: str,
        side: str,
        position_side: str,
        order_type: str,
        qty: int | float,
        price: float | str | None = None,
    ) -> Any:
        params: dict[str, Any] = {
            "symbol": symbol,
            "orderSide": side,
            "positionSide": position_side,
            "orderType": order_type,
            "origQty": int(qty),
        }
        if price is not None and order_type == "LIMIT":
            params["price"] = str(price)
        return self._req("/future/trade/v1/order/create", method="POST", params=params)

    def cancel_order(self, order_id: str) -> Any:
        return self._req(
            "/future/trade/v1/order/cancel",
            method="POST",
            params={"orderId": str(order_id)},
        )

    def history_orders(self, symbol: str | None = None, limit: int = 20) -> Any:
        params: dict[str, Any] = {"page": 1, "size": limit}
        if symbol:
            params["symbol"] = symbol
        return self._req("/future/trade/v1/order/list-history", params=params)

    def open_long(
        self,
        symbol: str,
        qty: int | float,
        price: float | str | None = None,
        market: bool = False,
    ) -> Any:
        order_type = "MARKET" if market else "LIMIT"
        return self.place_order(symbol, "BUY", "LONG", order_type, qty, price=price)

    def open_short(
        self,
        symbol: str,
        qty: int | float,
        price: float | str | None = None,
        market: bool = False,
    ) -> Any:
        order_type = "MARKET" if market else "LIMIT"
        return self.place_order(symbol, "SELL", "SHORT", order_type, qty, price=price)

    def close_long(
        self,
        symbol: str,
        qty: int | float,
        price: float | str | None = None,
        market: bool = False,
    ) -> Any:
        order_type = "MARKET" if market else "LIMIT"
        return self.place_order(symbol, "SELL", "LONG", order_type, qty, price=price)

    def close_short(
        self,
        symbol: str,
        qty: int | float,
        price: float | str | None = None,
        market: bool = False,
    ) -> Any:
        order_type = "MARKET" if market else "LIMIT"
        return self.place_order(symbol, "BUY", "SHORT", order_type, qty, price=price)
