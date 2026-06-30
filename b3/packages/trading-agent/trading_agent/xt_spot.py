from __future__ import annotations

import hashlib
import hmac
import json
import time
import uuid
from copy import deepcopy
from typing import Any

import requests

from trading_agent.xt_config import load_xt_credentials, xt_spot_host

DEFAULT_TIMEOUT = 10


class XtSpot:
    """XT.COM spot API client (sapi.xt.com)."""

    def __init__(
        self,
        host: str | None = None,
        access_key: str | None = None,
        secret_key: str | None = None,
    ) -> None:
        self.host = host or xt_spot_host()
        if access_key and secret_key:
            self.access_key, self.secret_key = access_key, secret_key
        else:
            self.access_key, self.secret_key = load_xt_credentials()
        self.anonymous = not (self.access_key and self.secret_key)
        self.timeout = DEFAULT_TIMEOUT
        self.headers = {
            "Content-type": "application/json",
            "User-Agent": "bc-trading-agent/1.0",
        }

    @staticmethod
    def _create_sign(
        url: str,
        method: str,
        sign_headers: dict[str, str],
        secret_key: str,
        params: dict[str, Any] | None = None,
        body: dict[str, Any] | None = None,
    ) -> str:
        query_str = ""
        if params:
            query_str = "&".join(
                f"{k}={json.dumps(params[k]) if isinstance(params[k], (dict, list)) else params[k]}"
                for k in sorted(params)
            )
        body_str = json.dumps(body) if body else ""
        parts = [p for p in [method, url, query_str, body_str] if p]
        payload = "#" + "#".join(parts)
        header_str = "&".join(f"{k}={sign_headers[k]}" for k in sorted(sign_headers))
        sign_str = header_str + payload
        return hmac.new(
            secret_key.encode("utf-8"),
            sign_str.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest().upper()

    def _auth_headers(
        self,
        url: str,
        method: str,
        params: dict[str, Any] | None = None,
        body: dict[str, Any] | None = None,
    ) -> dict[str, str]:
        h = {
            "xt-validate-timestamp": str(int((time.time() - 30) * 1000)),
            "xt-validate-appkey": self.access_key,
            "xt-validate-recvwindow": "60000",
            "xt-validate-algorithms": "HmacSHA256",
        }
        h["xt-validate-signature"] = self._create_sign(
            url, method, h, self.secret_key, params=params, body=body
        )
        merged = deepcopy(self.headers)
        merged.update(h)
        return merged

    def _req(
        self,
        url: str,
        method: str = "GET",
        params: dict[str, Any] | None = None,
        body: dict[str, Any] | None = None,
        auth: bool = True,
    ) -> Any:
        if auth and self.anonymous:
            raise RuntimeError(
                "XT API key required. Set XT_ACCESS_KEY and XT_SECRET_KEY or ~/.xt-exchange/credentials.json"
            )
        full_url = self.host + url
        headers = self._auth_headers(url, method, params=params, body=body) if auth else self.headers

        kwargs: dict[str, Any] = {"headers": headers, "timeout": self.timeout}
        if params:
            kwargs["params"] = params
        if body:
            kwargs["json"] = body

        resp = requests.request(method, full_url, **kwargs)
        resp.raise_for_status()
        res = resp.json()
        if res.get("rc", 0) != 0:
            mc = res.get("mc", "UNKNOWN")
            raise RuntimeError(f"XT spot API error [{mc}]: {res}")
        return res.get("result")

    def ticker(self, symbol: str) -> Any:
        return self._req("/v4/public/ticker/price", params={"symbol": symbol}, auth=False)

    def ticker_24h(self, symbol: str) -> Any:
        return self._req("/v4/public/ticker/24h", params={"symbol": symbol}, auth=False)

    def depth(self, symbol: str, limit: int | None = None) -> Any:
        params: dict[str, Any] = {"symbol": symbol}
        if limit is not None:
            params["limit"] = limit
        return self._req("/v4/public/depth", params=params, auth=False)

    def klines(self, symbol: str, interval: str = "1h", limit: int = 24) -> Any:
        params = {"symbol": symbol, "interval": interval, "limit": limit}
        return self._req("/v4/public/kline", params=params, auth=False)

    def symbol_info(self, symbol: str) -> Any:
        return self._req("/v4/public/symbol", params={"symbol": symbol}, auth=False)

    def balance(self, currency: str | None = None) -> Any:
        if currency:
            return self._req("/v4/balance", params={"currency": currency})
        return self._req("/v4/balances")

    def open_orders(self, symbol: str | None = None) -> Any:
        params: dict[str, Any] = {"bizType": "SPOT", "page": 1, "pageSize": 300}
        if symbol:
            params["symbol"] = symbol
        return self._req("/v4/open-order", params=params)

    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        price: float | str | None = None,
        quantity: float | str | None = None,
        quote_qty: float | str | None = None,
    ) -> Any:
        body: dict[str, Any] = {
            "symbol": symbol,
            "side": side,
            "type": order_type,
            "bizType": "SPOT",
            "timeInForce": "IOC" if order_type == "MARKET" else "GTC",
        }
        if price is not None:
            body["price"] = str(price)
        if quantity is not None:
            body["quantity"] = str(quantity)
        if quote_qty is not None:
            body["quoteQty"] = str(quote_qty)
        return self._req("/v4/order", method="POST", body=body)

    def cancel_order(self, order_id: str) -> Any:
        return self._req(f"/v4/order/{order_id}", method="DELETE")

    def cancel_all(self, symbol: str | None = None) -> Any:
        body: dict[str, Any] = {"bizType": "SPOT"}
        if symbol:
            body["symbol"] = symbol
        return self._req("/v4/open-order", method="DELETE", body=body)

    def history_orders(self, symbol: str | None = None, limit: int = 20) -> Any:
        params: dict[str, Any] = {"bizType": "SPOT", "limit": limit}
        if symbol:
            params["symbol"] = symbol
        return self._req("/v4/history-order", params=params)

    def transfer(self, from_account: str, to_account: str, currency: str, amount: float | str) -> Any:
        body = {
            "bizId": f"bc_{uuid.uuid4().hex[:16]}",
            "from": from_account,
            "to": to_account,
            "currency": currency.lower(),
            "amount": str(amount),
        }
        return self._req("/v4/balance/transfer", method="POST", body=body)

    def withdraw(self, currency: str, chain: str, amount: float | str, address: str) -> Any:
        body = {
            "currency": currency.lower(),
            "chain": chain,
            "amount": str(amount),
            "address": address,
        }
        return self._req("/v4/withdraw", method="POST", body=body)
