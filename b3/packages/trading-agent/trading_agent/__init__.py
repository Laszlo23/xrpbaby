"""BC trading agent — Aerodrome quotes and unsigned swap txs via Velodrome sugar-sdk."""

from trading_agent.config import BASE_CHAIN_ID, default_bcc_address
from trading_agent.service import TradingService

__all__ = ["BASE_CHAIN_ID", "TradingService", "default_bcc_address"]
