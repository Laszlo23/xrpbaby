import os

BASE_CHAIN_ID = 8453

DEFAULT_BCC_ADDRESS = "0xb890a5289f789f1346032ccc1847939e855fab07"
DEFAULT_WETH_ADDRESS = "0x4200000000000000000000000000000000000006"


def default_bcc_address() -> str:
    return (os.environ.get("BCC_TOKEN_ADDRESS") or os.environ.get("VITE_BCC_TOKEN_ADDRESS") or DEFAULT_BCC_ADDRESS).strip()


def base_rpc_uri() -> str:
    return (
        os.environ.get("SUGAR_RPC_URI_8453")
        or os.environ.get("BASE_RPC_URL")
        or os.environ.get("VITE_BASE_RPC_URL")
        or "https://mainnet.base.org"
    ).strip()


def trading_paper_mode() -> bool:
    """When true, never return unsigned swap txs — quotes and pool reads only."""
    raw = os.environ.get("TRADING_AGENT_PAPER_MODE", "1").strip().lower()
    return raw not in ("0", "false", "no")


def bcc_uniswap_url() -> str:
    return (
        os.environ.get("VITE_BCC_UNISWAP_URL")
        or os.environ.get("BCC_UNISWAP_URL")
        or "https://app.uniswap.org/swap?outputCurrency=0xB890a5289F789f1346032Ccc1847939e855FAb07&chain=base"
    ).strip()


def bcc_aerodrome_pool_address() -> str | None:
    raw = (
        os.environ.get("VITE_BCC_AERODROME_POOL")
        or os.environ.get("BCC_AERODROME_POOL")
        or ""
    ).strip()
    return raw if raw.startswith("0x") and len(raw) == 42 else None
