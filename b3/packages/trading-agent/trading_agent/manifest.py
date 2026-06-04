import os

from trading_agent.config import BASE_CHAIN_ID, default_bcc_address, trading_paper_mode


def build_manifest() -> dict:
    public = (os.environ.get("TRADING_AGENT_PUBLIC_ORIGIN") or os.environ.get("PUBLIC_APP_ORIGIN") or "").strip()
    base = public.rstrip("/") if public else None
    return {
        "schema_version": "1",
        "worker": "bc-trading-agent",
        "chainId": BASE_CHAIN_ID,
        "dex": "aerodrome",
        "sdk": "velodrome-sugar-sdk@0.4.2",
        "bcc": default_bcc_address(),
        "paperMode": trading_paper_mode(),
        "platform": {
            "note": "External agents should use BUILDCHAIN x402 URLs, not this port directly.",
            "manifest": f"{base}/api/trading/manifest" if base else None,
            "quote": f"{base}/api/trading/quote" if base else None,
            "health": f"{base}/api/trading/health" if base else None,
        },
    }
