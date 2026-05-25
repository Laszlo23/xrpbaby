#!/usr/bin/env python3
"""Emit web/.env.local lines from a deployments/*.json file.

- Default / 0G (e.g. deployments/testnet.json, chainId 16602): NEXT_PUBLIC_OG_RPC, NEXT_PUBLIC_* (0G).
- Base mainnet (deployments/base-mainnet.json, chainId 8453): NEXT_PUBLIC_BASE_RPC, NEXT_PUBLIC_BASE_EXPLORER, NEXT_PUBLIC_BASE_*.

Merge into one .env.local: run twice and append, or concatenate outputs:

  python3 scripts/sync_web_env.py deployments/testnet.json > web/.env.local
  python3 scripts/sync_web_env.py deployments/base-mainnet.json >> web/.env.local
"""
import json
import sys
from pathlib import Path


def emit_lines(data: dict) -> list[str]:
    chain_id = data.get("chainId")
    rpc = data.get("rpcUrl", "https://evmrpc-testnet.0g.ai")
    c = data["contracts"]
    zero = "0x0000000000000000000000000000000000000000"
    comp = c.get("ComplianceRegistry", zero)
    proof = c.get("PropertyShareProof", zero)
    staking = c.get("OgStaking", zero)
    lending = c.get("SimpleLendingPool", zero)
    site_url = data.get("siteUrl") or data.get("site_url") or ""
    explorer = (data.get("explorer") or "").rstrip("/")

    if chain_id == 8453:
        platform = c.get("PlatformSettlementToken", zero)
        escrow20 = c.get("PurchaseEscrowERC20", zero)
        lines = [
            f"NEXT_PUBLIC_BASE_RPC={rpc}",
            f"NEXT_PUBLIC_BASE_EXPLORER={explorer}",
            f"NEXT_PUBLIC_BASE_REGISTRY={c['PropertyRegistry']}",
            f"NEXT_PUBLIC_BASE_SHARE_FACTORY={c['PropertyShareFactory']}",
            f"NEXT_PUBLIC_BASE_COMPLIANCE_REGISTRY={comp}",
            f"NEXT_PUBLIC_BASE_WETH={c['WETH9']}",
            f"NEXT_PUBLIC_BASE_ROUTER={c['OgRouter']}",
            f"NEXT_PUBLIC_BASE_LENDING_POOL={lending}",
            f"NEXT_PUBLIC_BASE_PREDICTION_MARKET={c['BinaryPredictionMarket']}",
            f"NEXT_PUBLIC_BASE_PROOF_NFT={proof}",
            f"NEXT_PUBLIC_BASE_STAKING={staking}",
            f"NEXT_PUBLIC_BASE_PLATFORM_TOKEN={platform}",
            f"NEXT_PUBLIC_BASE_PURCHASE_ESCROW_ERC20={escrow20}",
        ]
    else:
        lines = [
            f"NEXT_PUBLIC_OG_RPC={rpc}",
            f"NEXT_PUBLIC_REGISTRY={c['PropertyRegistry']}",
            f"NEXT_PUBLIC_SHARE_FACTORY={c['PropertyShareFactory']}",
            f"NEXT_PUBLIC_COMPLIANCE_REGISTRY={comp}",
            f"NEXT_PUBLIC_WETH={c['WETH9']}",
            f"NEXT_PUBLIC_ROUTER={c['OgRouter']}",
            f"NEXT_PUBLIC_LENDING_POOL={lending}",
            f"NEXT_PUBLIC_PREDICTION_MARKET={c['BinaryPredictionMarket']}",
            f"NEXT_PUBLIC_PROOF_NFT={proof}",
            f"NEXT_PUBLIC_STAKING={staking}",
            f"NEXT_PUBLIC_EXPLORER={data.get('explorer', 'https://chainscan-galileo.0g.ai')}",
        ]
        if site_url:
            lines.append(f"NEXT_PUBLIC_SITE_URL={site_url.rstrip('/')}")

    return lines


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: sync_web_env.py deployments/testnet.json\n"
            "       sync_web_env.py deployments/base-mainnet.json  # Base mainnet NEXT_PUBLIC_BASE_*",
            file=sys.stderr,
        )
        sys.exit(1)
    path = Path(sys.argv[1])
    data = json.loads(path.read_text())
    lines = emit_lines(data)
    print("\n".join(lines))


if __name__ == "__main__":
    main()
