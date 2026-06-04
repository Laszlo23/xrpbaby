import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseEther } from "viem";
import { toast } from "sonner";
import {
  BCC_ADDRESS,
  BCC_DISCOUNT_LABEL,
  BCC_SYMBOL,
  erc20ApproveAbi,
  hubAbi,
  hubAddress,
  hubV2Abi,
  hubV2Address,
  isHubConfigured,
  isHubV2Configured,
  type ArtworkSlug,
  editionIds,
} from "@/modules/art/lib/contracts";
import { useEdition } from "@/modules/art/hooks/useEdition";
import { blockExplorerUrl } from "@/modules/art/lib/chains";
import { useOpenWallet } from "@/modules/art/hooks/useOpenWallet";

function writeContractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "shortMessage" in err) {
    const msg = (err as { shortMessage?: unknown }).shortMessage;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return err instanceof Error ? err.message : "Transaction failed";
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatEur } from "@/modules/art/lib/format";

type MintTicketButtonProps = {
  slug: ArtworkSlug;
  fallbackPriceEur: number;
  className?: string;
};

type MintTicketCoreProps = MintTicketButtonProps & {
  onConnectWallet: () => void;
};

function MintTicketCore({
  slug,
  fallbackPriceEur,
  className,
  onConnectWallet,
}: MintTicketCoreProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [payWithBcc, setPayWithBcc] = useState(false);
  const { isConnected } = useAccount();
  const edition = useEdition(slug);
  const editionId = editionIds[slug];
  const bccEnabled = isHubV2Configured;
  const activeHub = payWithBcc && isHubV2Configured ? hubV2Address : hubAddress;
  const activeAbi = payWithBcc && isHubV2Configured ? hubV2Abi : hubAbi;

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: bccQuoteWei } = useReadContract({
    address: payWithBcc && isHubV2Configured ? hubV2Address : undefined,
    abi: hubV2Abi,
    functionName: "quoteTicketsWithBcc",
    args: [editionId, BigInt(quantity)],
    query: { enabled: payWithBcc && isHubV2Configured && quantity >= 1 },
  });

  const maxSupply = edition.maxSupply ?? 0;
  const sold = edition.sold ?? 0;
  const remaining = Math.max(0, maxSupply - sold);
  const priceWei = edition.ticketPriceWei;
  const priceLabel =
    edition.ticketPriceEth != null
      ? `${Number(edition.ticketPriceEth).toFixed(4)} ETH`
      : formatEur(fallbackPriceEur);

  const fallbackEth =
    Number.isFinite(fallbackPriceEur) && fallbackPriceEur > 0
      ? String(fallbackPriceEur * 0.00001)
      : "0";
  const totalCostEth = priceWei != null ? priceWei * BigInt(quantity) : parseEther(fallbackEth);
  const totalCostBcc = typeof bccQuoteWei === "bigint" ? bccQuoteWei : undefined;

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    toast.success("Tickets minted on Base", {
      description: (
        <a
          href={`${blockExplorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          View on Basescan
        </a>
      ),
    });
    reset();
    setOpen(false);
    void edition.refetch();
  }, [isSuccess, txHash, reset, edition]);

  function handleMint() {
    if (!isHubConfigured && !isHubV2Configured) {
      toast.error("Contracts not deployed", {
        description: "Set VITE_HUB_ADDRESS or VITE_HUB_V2_ADDRESS in .env after deploying to Base.",
      });
      return;
    }
    if (payWithBcc && !isHubV2Configured) {
      toast.error(`${BCC_SYMBOL} rail not configured`, {
        description: "Set VITE_HUB_V2_ADDRESS after deploying BuildingCultureHubV2.",
      });
      return;
    }
    if (!isConnected) {
      onConnectWallet();
      return;
    }
    if (remaining <= 0) {
      toast.error("Edition sold out");
      return;
    }
    if (quantity > remaining) {
      toast.error(`Only ${remaining} tickets left`);
      return;
    }

    if (payWithBcc && isHubV2Configured) {
      if (totalCostBcc === undefined) {
        toast.error(`Could not load ${BCC_SYMBOL} quote`);
        return;
      }
      writeContract(
        {
          address: BCC_ADDRESS,
          abi: erc20ApproveAbi,
          functionName: "approve",
          args: [hubV2Address, totalCostBcc],
        },
        {
          onSuccess: () => {
            writeContract({
              address: hubV2Address,
              abi: hubV2Abi,
              functionName: "mintTicketsWithBcc",
              args: [editionId, BigInt(quantity)],
            });
          },
          onError: (err) =>
            toast.error(`${BCC_SYMBOL} approve failed`, {
              description: writeContractErrorMessage(err),
            }),
        },
      );
      return;
    }

    writeContract(
      {
        address: activeHub,
        abi: activeAbi,
        functionName: "mintTickets",
        args: [editionId, BigInt(quantity)],
        value: totalCostEth,
      },
      {
        onError: (err) =>
          toast.error("Mint failed", { description: writeContractErrorMessage(err) }),
      },
    );
  }

  const busy = isPending || isConfirming;
  const label = edition.drawn
    ? "Edition complete"
    : remaining === 0 && (isHubConfigured || isHubV2Configured)
      ? "Sold out"
      : `Enter raffle · ${priceLabel}`;

  const totalLabel =
    payWithBcc && totalCostBcc !== undefined
      ? `${formatUnits(totalCostBcc, 18)} ${BCC_SYMBOL} (${BCC_DISCOUNT_LABEL})`
      : priceWei != null
        ? `${(Number(priceWei) * quantity) / 1e18} ETH`
        : formatEur(fallbackPriceEur * quantity);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={
            (edition.drawn || (remaining === 0 && (isHubConfigured || isHubV2Configured))) ?? false
          }
          className={
            className ??
            "px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform glow-gold disabled:opacity-50 disabled:pointer-events-none"
          }
        >
          {label}
        </button>
      </DialogTrigger>
      <DialogContent className="glass border-border/60 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Enter the artwork raffle</DialogTitle>
          <DialogDescription>
            Each ticket is one entry to win the physical painting. When all tickets sell, verifiable
            randomness picks one winner on Base. Most entries do not win — that is the raffle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground uppercase tracking-[0.2em] text-xs">
              Quantity
            </span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={quantity <= 1 || busy}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </Button>
              <span className="font-mono w-8 text-center">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={quantity >= Math.min(10, remaining) || busy}
                onClick={() => setQuantity((q) => Math.min(10, remaining, q + 1))}
              >
                +
              </Button>
            </div>
          </div>

          <div className="rounded-xl border hairline p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price each</span>
              <span>{payWithBcc ? `${BCC_SYMBOL} (discounted)` : priceLabel}</span>
            </div>
            <div className="flex justify-between font-display text-lg">
              <span>Total</span>
              <span>{totalLabel}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {isHubConfigured || isHubV2Configured
                ? remaining > 0
                  ? `${remaining} tickets remaining onchain`
                  : "Sold out"
                : "Deploy contracts to enable minting"}
            </p>
          </div>

          {bccEnabled ? (
            <button
              type="button"
              onClick={() => setPayWithBcc((v) => !v)}
              className={`w-full rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-wider ${
                payWithBcc
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {payWithBcc
                ? `Paying with ${BCC_SYMBOL}`
                : `Pay with ${BCC_SYMBOL} (${BCC_DISCOUNT_LABEL})`}
            </button>
          ) : null}

          <Button
            type="button"
            className="w-full uppercase tracking-[0.2em]"
            disabled={busy || ((isHubConfigured || isHubV2Configured) && remaining === 0)}
            onClick={handleMint}
          >
            {busy
              ? "Confirm in wallet…"
              : isConnected
                ? "Enter raffle on Base"
                : "Connect wallet to enter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MintTicketButtonWithWallet(props: MintTicketButtonProps) {
  const { openWallet } = useOpenWallet();
  return <MintTicketCore {...props} onConnectWallet={openWallet} />;
}

export function MintTicketButton(props: MintTicketButtonProps) {
  return <MintTicketButtonWithWallet {...props} />;
}
