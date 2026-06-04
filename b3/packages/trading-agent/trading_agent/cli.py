from __future__ import annotations

import argparse
import asyncio
import json
import sys

from trading_agent.arbitrage import arbitrage_scan
from trading_agent.service import TradingService


async def _run(args: argparse.Namespace) -> int:
    svc = TradingService()
    if args.command == "quote":
        out = await svc.quote(
            from_token=args.from_token,
            to_token=args.to_token,
            amount=args.amount,
            use_decimals=not args.wei,
            wallet=args.wallet,
        )
    elif args.command == "arbitrage-scan":
        out = await arbitrage_scan(
            svc,
            sol_amount=float(args.sol_amount),
            eth_amount=float(args.eth_amount),
            min_spread_bps=int(args.min_spread_bps),
        )
    elif args.command == "quote-bcc":
        out = await svc.bcc_buy_quote(eth_amount=args.amount, use_decimals=not args.wei)
    elif args.command == "pools":
        out = await svc.pools_for_token(token=args.token, limit=args.limit)
    elif args.command == "swap-preview":
        out = await svc.swap_preview(
            from_token=args.from_token,
            to_token=args.to_token,
            amount=args.amount,
            use_decimals=not args.wei,
            wallet=args.wallet or "",
        )
    else:
        return 2
    json.dump(out, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


def main() -> None:
    p = argparse.ArgumentParser(description="BC trading agent (sugar-sdk / Aerodrome on Base)")
    sub = p.add_subparsers(dest="command", required=True)

    q = sub.add_parser("quote", help="Read-only swap quote")
    q.add_argument("--from-token", required=True)
    q.add_argument("--to-token", required=True)
    q.add_argument("--amount", required=True)
    q.add_argument("--wallet")
    q.add_argument("--wei", action="store_true", help="Amount is raw wei")

    qb = sub.add_parser("quote-bcc", help="ETH → BCC quote")
    qb.add_argument("--amount", default="0.01")
    qb.add_argument("--wei", action="store_true")

    arb = sub.add_parser("arbitrage-scan", help="Multichain BCC spread scan (read-only)")
    arb.add_argument("--sol-amount", default="1")
    arb.add_argument("--eth-amount", default="0.01")
    arb.add_argument("--min-spread-bps", default="50")

    pl = sub.add_parser("pools", help="Pools containing token")
    pl.add_argument("--token", help="Defaults to BCC")
    pl.add_argument("--limit", type=int, default=10)

    sp = sub.add_parser("swap-preview", help="Unsigned swap txs (requires TRADING_AGENT_PAPER_MODE=0)")
    sp.add_argument("--from-token", required=True)
    sp.add_argument("--to-token", required=True)
    sp.add_argument("--amount", required=True)
    sp.add_argument("--wallet", required=True)
    sp.add_argument("--wei", action="store_true")

    args = p.parse_args()
    try:
        raise SystemExit(asyncio.run(_run(args)))
    except PermissionError as e:
        print(str(e), file=sys.stderr)
        raise SystemExit(1) from e
    except Exception as e:
        print(str(e), file=sys.stderr)
        raise SystemExit(1) from e


if __name__ == "__main__":
    main()
