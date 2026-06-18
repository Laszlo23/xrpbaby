import { useState } from "react";
import { BCC_ADDRESS, BCC_CHAIN_ID } from "@bc/bcc-kit";
import { parseUnits } from "viem";
import { useAccount, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { BCC_SWAP_CHAIN_ID } from "@/lib/bcc-swap-config";
import { base } from "@/lib/chains";
import { toast } from "sonner";

const rewardsAbi = [
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "proof", type: "bytes32[]" },
    ],
    outputs: [],
  },
  {
    name: "claimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "merkleRoot",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

function parseRewardsAddr(): `0x${string}` | "" {
  const v = import.meta.env.VITE_CULTURE_PASS_BCC_REWARDS?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as `0x${string}`;
  return "";
}

export function CulturePassBccClaimPanel() {
  const rewardsAddress = parseRewardsAddr();
  const [amount, setAmount] = useState("");
  const [proofJson, setProofJson] = useState("[]");
  const [pending, setPending] = useState(false);

  const { address, chainId, isConnected } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const onBase = chainId === BCC_SWAP_CHAIN_ID;

  const { data: alreadyClaimed } = useReadContract({
    address: rewardsAddress || undefined,
    abi: rewardsAbi,
    functionName: "claimed",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(rewardsAddress && address) },
  });

  const { data: merkleRoot } = useReadContract({
    address: rewardsAddress || undefined,
    abi: rewardsAbi,
    functionName: "merkleRoot",
    query: { enabled: Boolean(rewardsAddress) },
  });

  if (!rewardsAddress) {
    return (
      <section className="mt-10 rounded-2xl border border-[#C5FF41]/20 bg-black/30 p-6">
        <h3 className="font-display text-lg font-bold text-white">BCC allocation (Culture Pass)</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Merkle claims activate after treasury funds{" "}
          <code className="text-zinc-300">CulturePassBccRewards</code>. Set{" "}
          <code className="text-zinc-300">VITE_CULTURE_PASS_BCC_REWARDS</code> in env.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Canonical BCC on Base ({BCC_ADDRESS.slice(0, 10)}…) — no inflation; treasury-funded pool only.
        </p>
      </section>
    );
  }

  async function handleClaim() {
    if (!address || !rewardsAddress) return;
    setPending(true);
    try {
      const amountWei = parseUnits(amount || "0", 18);
      const proof = JSON.parse(proofJson) as `0x${string}`[];

      await writeContractAsync({
        address: rewardsAddress,
        abi: rewardsAbi,
        functionName: "claim",
        args: [amountWei, proof],
        chainId: BCC_CHAIN_ID,
      });

      toast.success("BCC allocation claimed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-[#C5FF41]/20 bg-black/30 p-6">
      <h3 className="font-display text-lg font-bold text-white">Claim your BCC allocation</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Culture Pass holders with an eligible allocation can claim canonical BCC on Base. Paste your
        merkle proof from the operator dashboard.
      </p>

      {!isConnected || !address ? (
        <p className="mt-4 text-sm text-zinc-500">Connect wallet on Base to claim.</p>
      ) : !onBase ? (
        <Button
          type="button"
          className="mt-4 rounded-full bg-[#C5FF41] font-bold text-black"
          disabled={switching}
          onClick={() => switchChain?.({ chainId: BCC_SWAP_CHAIN_ID })}
        >
          Switch to {base.name}
        </Button>
      ) : alreadyClaimed ? (
        <p className="mt-4 text-sm text-[#C5FF41]">You already claimed your allocation.</p>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-zinc-500">
            Root: {merkleRoot ? `${merkleRoot.slice(0, 14)}…` : "not set"}
          </p>
          <input
            type="text"
            placeholder="Amount (BCC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
          />
          <textarea
            placeholder='Merkle proof JSON e.g. ["0xabc..."]'
            value={proofJson}
            onChange={(e) => setProofJson(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-xs text-white"
          />
          <Button
            type="button"
            disabled={pending || !amount}
            onClick={() => void handleClaim()}
            className="rounded-full bg-[#C5FF41] font-bold text-black"
          >
            {pending ? "Claiming…" : `Claim ${amount || "BCC"}`}
          </Button>
        </div>
      )}
    </section>
  );
}
