import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BSC_USDC, BSC_USDT, erc20Abi } from "@bc/bcc-kit";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { ModuleShell } from "@/components/ModuleShell";
import { WalletControls } from "@/components/WalletControls";
import { Button } from "@/components/ui/button";
import { BSC_BCC_SWAP_CHAIN_ID } from "@/lib/bcc-bsc-swap-config";
import { bsc } from "@/lib/chains";
import { pageHead } from "@/lib/seo";
import { toast } from "sonner";

const fairLaunchSaleAbi = [
  {
    name: "buy",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "wbccAmountWei", type: "uint256" },
      { name: "merkleMaxWbccWei", type: "uint256" },
      { name: "proof", type: "bytes32[]" },
    ],
    outputs: [],
  },
  {
    name: "rounds",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [
      { name: "start", type: "uint64" },
      { name: "end", type: "uint64" },
      { name: "merkleRoot", type: "bytes32" },
      { name: "paymentToken", type: "address" },
      { name: "paymentPerWholeWbcc", type: "uint256" },
      { name: "maxWbccWei", type: "uint256" },
      { name: "perWalletCapWei", type: "uint256" },
    ],
  },
  {
    name: "roundSoldWbccWei",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function parseSaleAddr(): `0x${string}` | "" {
  const v = import.meta.env.VITE_BCC_FAIR_LAUNCH_SALE?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as `0x${string}`;
  return "";
}

export const Route = createFileRoute("/bcc/fair-launch")({
  head: () =>
    pageHead({
      title: "BCC Fair Launch — BNB Chain",
      description: "Fixed-price wBCC sale on BNB Chain. Pre-bridged inventory — no inflation.",
      path: "/bcc/fair-launch",
    }),
  component: FairLaunchPage,
});

function FairLaunchPage() {
  const saleAddress = parseSaleAddr();
  const roundId = BigInt(import.meta.env.VITE_BCC_FAIR_LAUNCH_ROUND_ID?.trim() || "0");

  return (
    <ModuleShell
      moduleId="signal"
      title="BCC Fair Launch"
      subtitle="Buy wBCC on BNB Chain with BNB, USDC, or USDT. Inventory is pre-bridged from treasury — no new canonical BCC minted."
      hideHero
    >
      {!saleAddress ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          Sale contract not configured. Set{" "}
          <code className="text-amber-50">VITE_BCC_FAIR_LAUNCH_SALE</code> after deploy.
        </div>
      ) : (
        <FairLaunchPanel saleAddress={saleAddress} roundId={roundId} />
      )}
      <p className="mt-6 text-xs text-zinc-500">
        Culture Pass holders can claim canonical BCC on Base via{" "}
        <Link to="/pass" className="text-[#C5FF41] hover:underline">
          /pass
        </Link>
        . Supply dashboard:{" "}
        <Link to="/bcc/dashboard" className="text-[#C5FF41] hover:underline">
          /bcc/dashboard
        </Link>
        .
      </p>
    </ModuleShell>
  );
}

function FairLaunchPanel({
  saleAddress,
  roundId,
}: {
  saleAddress: `0x${string}`;
  roundId: bigint;
}) {
  const [amount, setAmount] = useState("1000");
  const [payment, setPayment] = useState<"bnb" | "usdc" | "usdt">("bnb");
  const [pending, setPending] = useState(false);

  const { address, chainId, isConnected } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const onBsc = chainId === BSC_BCC_SWAP_CHAIN_ID;

  const { data: round } = useReadContract({
    address: saleAddress,
    abi: fairLaunchSaleAbi,
    functionName: "rounds",
    args: [roundId],
  });

  const { data: sold } = useReadContract({
    address: saleAddress,
    abi: fairLaunchSaleAbi,
    functionName: "roundSoldWbccWei",
    args: [roundId],
  });

  const paymentToken = useMemo(() => {
    if (payment === "usdc") return BSC_USDC;
    if (payment === "usdt") return BSC_USDT;
    return null;
  }, [payment]);

  const amountWei = useMemo(() => {
    try {
      return parseUnits(amount || "0", 18);
    } catch {
      return 0n;
    }
  }, [amount]);

  const roundActive = useMemo(() => {
    if (!round) return false;
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now >= round[0] && now <= round[1] && round[4] > 0n;
  }, [round]);

  async function handleBuy() {
    if (!address || amountWei <= 0n) return;
    setPending(true);
    try {
      if (paymentToken) {
        await writeContractAsync({
          address: paymentToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [saleAddress, amountWei * (round?.[4] ?? 1n)],
          chainId: BSC_BCC_SWAP_CHAIN_ID,
        });
      }

      await writeContractAsync({
        address: saleAddress,
        abi: fairLaunchSaleAbi,
        functionName: "buy",
        args: [roundId, amountWei, 0n, []],
        value: payment === "bnb" ? amountWei * (round?.[4] ?? 1n) / 10n ** 18n : 0n,
        chainId: BSC_BCC_SWAP_CHAIN_ID,
      });

      toast.success("Purchase submitted — wBCC sent to your wallet");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setPending(false);
    }
  }

  if (!isConnected || !address) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">Connect on BNB Chain to participate.</p>
        <WalletControls />
      </div>
    );
  }

  if (!onBsc) {
    return (
      <Button
        type="button"
        disabled={switching}
        onClick={() => switchChain?.({ chainId: BSC_BCC_SWAP_CHAIN_ID })}
        className="rounded-full bg-[#F0B90B] font-bold text-black"
      >
        {switching ? "Switching…" : `Switch to ${bsc.name}`}
      </Button>
    );
  }

  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex gap-2">
        {(["bnb", "usdc", "usdt"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPayment(p)}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold uppercase ${
              payment === p
                ? "border-[#F0B90B]/50 bg-[#F0B90B]/15 text-[#F0B90B]"
                : "border-white/10 text-zinc-400"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        Round {roundId.toString()} · Sold {formatUnits(sold ?? 0n, 18)} /{" "}
        {round ? formatUnits(round[5], 18) : "—"} wBCC
        {!roundActive ? " · inactive" : ""}
      </p>

      <label className="block text-xs text-zinc-500">wBCC amount</label>
      <input
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-white"
      />

      <Button
        type="button"
        disabled={pending || !roundActive || amountWei <= 0n}
        onClick={() => void handleBuy()}
        className="w-full rounded-full bg-gradient-to-r from-[#C5FF41] to-[#F0B90B] font-bold text-black"
      >
        {pending ? "Buying…" : "Buy wBCC"}
      </Button>
    </div>
  );
}
