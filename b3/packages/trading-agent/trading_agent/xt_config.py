from __future__ import annotations

import json
import os
from pathlib import Path

DEFAULT_SPOT_HOST = "https://sapi.xt.com"
DEFAULT_FUTURES_HOST = "https://fapi.xt.com"
CREDENTIALS_FILE = Path.home() / ".xt-exchange" / "credentials.json"


def xt_spot_host() -> str:
    return (os.environ.get("XT_SPOT_HOST") or DEFAULT_SPOT_HOST).strip().rstrip("/")


def xt_futures_host() -> str:
    return (os.environ.get("XT_FUTURES_HOST") or DEFAULT_FUTURES_HOST).strip().rstrip("/")


def xt_trading_enabled() -> bool:
    raw = os.environ.get("XT_TRADING_ENABLED", "0").strip().lower()
    return raw in ("1", "true", "yes")


def xt_paper_mode() -> bool:
    raw = os.environ.get("XT_PAPER_MODE", "1").strip().lower()
    return raw not in ("0", "false", "no")


def xt_bcc_symbol() -> str:
    return (os.environ.get("XT_BCC_SYMBOL") or "bcc_usdt").strip().lower()


def load_xt_credentials() -> tuple[str, str]:
    ak = os.environ.get("XT_ACCESS_KEY", "").strip()
    sk = os.environ.get("XT_SECRET_KEY", "").strip()
    if ak and sk:
        return ak, sk

    if CREDENTIALS_FILE.is_file():
        try:
            creds = json.loads(CREDENTIALS_FILE.read_text(encoding="utf-8"))
            ak = str(creds.get("access_key", "")).strip()
            sk = str(creds.get("secret_key", "")).strip()
            if ak and sk:
                return ak, sk
        except (OSError, json.JSONDecodeError):
            pass

    return "", ""


def xt_health_meta() -> dict:
    ak, sk = load_xt_credentials()
    return {
        "enabled": xt_trading_enabled(),
        "paperMode": xt_paper_mode(),
        "spotHost": xt_spot_host(),
        "futuresHost": xt_futures_host(),
        "authenticated": bool(ak and sk),
        "bccSymbol": xt_bcc_symbol(),
    }
