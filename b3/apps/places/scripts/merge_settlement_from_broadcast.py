#!/usr/bin/env python3
"""Read Foundry broadcast artifacts and print or merge settlement deploy addresses.

Supports:
  - broadcast/DeploySettlementBundle.s.sol/8453/run-latest.json (both contracts, preferred)
  - OR separate DeployPlatformSettlement + DeployPurchaseEscrowERC20 run-latest.json files

Usage:
  python3 scripts/merge_settlement_from_broadcast.py --print-token-only
  python3 scripts/merge_settlement_from_broadcast.py --write deployments/base-mainnet.json
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _extract_create(json_path: Path, contract_name: str) -> str | None:
    if not json_path.is_file():
        return None
    data = json.loads(json_path.read_text())
    for tx in data.get("transactions", []):
        if tx.get("transactionType") != "CREATE":
            continue
        if tx.get("contractName") == contract_name:
            addr = tx.get("contractAddress") or tx.get("contract_address")
            if addr:
                return addr
    return None


def _load_pair(root: Path) -> tuple[str | None, str | None]:
    bundle = root / "broadcast/DeploySettlementBundle.s.sol/8453/run-latest.json"
    tok_a = root / "broadcast/DeployPlatformSettlement.s.sol/8453/run-latest.json"
    esc_a = root / "broadcast/DeployPurchaseEscrowERC20.s.sol/8453/run-latest.json"

    if bundle.is_file():
        bt = _extract_create(bundle, "PlatformSettlementToken")
        be = _extract_create(bundle, "PurchaseEscrowERC20")
        if bt and be:
            return bt, be

    token = _extract_create(tok_a, "PlatformSettlementToken")
    escrow = _extract_create(esc_a, "PurchaseEscrowERC20")
    return token, escrow


def main() -> None:
    root = _repo_root()
    p = argparse.ArgumentParser()
    p.add_argument("--print-token-only", action="store_true")
    p.add_argument("--write", metavar="DEPLOYMENTS_JSON", help="Merge into deployments JSON")
    args = p.parse_args()

    token, escrow = _load_pair(root)

    if args.print_token_only:
        if not token:
            raise SystemExit(
                "Could not find PlatformSettlementToken in bundle or DeployPlatformSettlement broadcast."
            )
        print(token)
        return

    if args.write:
        path = Path(args.write)
        out = json.loads(path.read_text())
        if not token or not escrow:
            raise SystemExit(
                f"Missing addresses: token={token!r} escrow={escrow!r}. "
                "Run DeploySettlementBundle or both separate forge broadcasts."
            )
        out.setdefault("contracts", {})
        out["contracts"]["PlatformSettlementToken"] = token
        out["contracts"]["PurchaseEscrowERC20"] = escrow
        path.write_text(json.dumps(out, indent=2) + "\n")
        print(f"Updated {path}")
        print(f"  PlatformSettlementToken: {token}")
        print(f"  PurchaseEscrowERC20: {escrow}")
        return

    print("PlatformSettlementToken:", token or "(not found)")
    print("PurchaseEscrowERC20:", escrow or "(not found)")


if __name__ == "__main__":
    main()
