"use client";

import { useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ComplianceStatus, useCompliance } from "@/components/ComplianceStatus";
import { erc20Abi, lendingPoolAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";

export default function LendPage() {
  const { address, isConnected } = useAccount();
  const { blocked } = useCompliance();
  const { lendingPool: pool, weth } = useProtocolAddresses();

  const unset = pool === "0x0000000000000000000000000000000000000000";

  const { data: collateralAddr } = useReadContract({
    address: pool,
    abi: lendingPoolAbi,
    functionName: "COLLATERAL",
    query: { enabled: !unset },
  });

  const { data: collateral } = useReadContract({
    address: pool,
    abi: lendingPoolAbi,
    functionName: "collateralOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !unset },
  });

  const { data: debt } = useReadContract({
    address: pool,
    abi: lendingPoolAbi,
    functionName: "debtOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !unset },
  });

  const { data: maxBorrow } = useReadContract({
    address: pool,
    abi: lendingPoolAbi,
    functionName: "maxBorrow",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !unset },
  });

  const [depositAmt, setDepositAmt] = useState("100");
  const [borrowAmt, setBorrowAmt] = useState("0.01");
  const [repayAmt, setRepayAmt] = useState("0.01");

  const depWei = useMemo(() => {
    try {
      return parseEther(depositAmt || "0");
    } catch {
      return 0n;
    }
  }, [depositAmt]);
  const borrowWei = useMemo(() => {
    try {
      return parseEther(borrowAmt || "0");
    } catch {
      return 0n;
    }
  }, [borrowAmt]);
  const repayWei = useMemo(() => {
    try {
      return parseEther(repayAmt || "0");
    } catch {
      return 0n;
    }
  }, [repayAmt]);

  const { data: allowanceColl } = useReadContract({
    address: collateralAddr as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && collateralAddr ? [address, pool as `0x${string}`] : undefined,
    query: { enabled: !!address && !!collateralAddr && !unset },
  });

  const { data: allowanceWeth } = useReadContract({
    address: weth as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, pool as `0x${string}`] : undefined,
    query: {
      enabled: !!address && weth !== "0x0000000000000000000000000000000000000000" && !unset,
    },
  });

  const { writeContract, data: tx1 } = useWriteContract();
  const { writeContract: approveC, data: h1 } = useWriteContract();
  const { writeContract: approveW, data: h2 } = useWriteContract();
  const { isLoading: w1 } = useWaitForTransactionReceipt({ hash: tx1 });
  const { isLoading: a1 } = useWaitForTransactionReceipt({ hash: h1 });
  const { isLoading: a2 } = useWaitForTransactionReceipt({ hash: h2 });

  const needCollApprove = allowanceColl !== undefined && depWei > 0n && allowanceColl < depWei;
  const needWethApprove = allowanceWeth !== undefined && repayWei > 0n && allowanceWeth < repayWei;

  const busy = w1 || a1 || a2;

  function deposit() {
    if (!address || blocked) return;
    writeContract({
      address: pool,
      abi: lendingPoolAbi,
      functionName: "depositCollateral",
      args: [depWei],
    });
  }

  function borrow() {
    if (!address || blocked) return;
    writeContract({
      address: pool,
      abi: lendingPoolAbi,
      functionName: "borrow",
      args: [borrowWei],
    });
  }

  function repay() {
    if (!address || blocked) return;
    writeContract({
      address: pool,
      abi: lendingPoolAbi,
      functionName: "repay",
      args: [repayWei],
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Lend</h1>
      <p className="text-sm text-zinc-500">
        SimpleLendingPool: deposit property share collateral, borrow WETH against MockPriceOracle. Deploy with{" "}
        <span className="font-mono">forge script script/DeployLending.s.sol</span> after a share token exists.
      </p>
      <ComplianceStatus />

      {unset ? (
        <p className="text-amber-400">Set NEXT_PUBLIC_LENDING_POOL and collateral in env after deployment.</p>
      ) : !isConnected ? (
        <p className="text-zinc-400">Connect wallet to manage your position.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-sm">
            <p>Collateral token: {collateralAddr?.slice(0, 10)}…</p>
            <p className="mt-2">Your collateral: {collateral !== undefined ? formatEther(collateral) : "…"}</p>
            <p className="mt-1">Debt (WETH): {debt !== undefined ? formatEther(debt) : "…"}</p>
            <p className="mt-1 text-zinc-500">Max borrow: {maxBorrow !== undefined ? formatEther(maxBorrow) : "…"}</p>
          </div>

          {blocked && (
            <p className="text-xs text-amber-400">Verified wallet required to interact with restricted collateral.</p>
          )}

          <div className="max-w-md space-y-2 rounded-lg border border-zinc-800 p-4">
            <h2 className="text-sm font-medium text-zinc-200">Deposit collateral</h2>
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm"
              value={depositAmt}
              onChange={(e) => setDepositAmt(e.target.value)}
            />
            {needCollApprove && collateralAddr && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  approveC({
                    address: collateralAddr as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [pool as `0x${string}`, 2n ** 256n - 1n],
                  })
                }
                className="w-full rounded border border-zinc-600 py-2 text-sm"
              >
                Approve collateral
              </button>
            )}
            <button
              type="button"
              disabled={busy || blocked || depWei === 0n || !!needCollApprove}
              onClick={deposit}
              className="w-full rounded bg-emerald-600 py-2 text-sm text-white disabled:opacity-40"
            >
              Deposit
            </button>
          </div>

          <div className="max-w-md space-y-2 rounded-lg border border-zinc-800 p-4">
            <h2 className="text-sm font-medium text-zinc-200">Borrow WETH</h2>
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm"
              value={borrowAmt}
              onChange={(e) => setBorrowAmt(e.target.value)}
            />
            <button
              type="button"
              disabled={busy || blocked || borrowWei === 0n}
              onClick={borrow}
              className="w-full rounded bg-emerald-700 py-2 text-sm text-white disabled:opacity-40"
            >
              Borrow
            </button>
          </div>

          <div className="max-w-md space-y-2 rounded-lg border border-zinc-800 p-4">
            <h2 className="text-sm font-medium text-zinc-200">Repay WETH</h2>
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm"
              value={repayAmt}
              onChange={(e) => setRepayAmt(e.target.value)}
            />
            {needWethApprove && weth !== "0x0000000000000000000000000000000000000000" && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  approveW({
                    address: weth as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [pool as `0x${string}`, 2n ** 256n - 1n],
                  })
                }
                className="w-full rounded border border-zinc-600 py-2 text-sm"
              >
                Approve WETH
              </button>
            )}
            <button
              type="button"
              disabled={busy || blocked || repayWei === 0n || !!needWethApprove}
              onClick={repay}
              className="w-full rounded bg-zinc-700 py-2 text-sm text-white disabled:opacity-40"
            >
              Repay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
