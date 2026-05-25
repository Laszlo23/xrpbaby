import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { isAddress, parseAbi } from "viem";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { sendTransaction } from "thirdweb";
import { getContract } from "thirdweb";
import { createListing, getAllValidListings } from "thirdweb/extensions/marketplace";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { thirdwebChainFromId } from "@/lib/thirdweb-chain";
import {
  getMarketplaceContractAddress,
  getMarketplaceFeeRecipientAddress,
  getMarketplacePlatformFeeBps,
} from "@/lib/marketplace-config";
import { explorerAddressUrl } from "@/lib/explorer";
import { getMarketplaceChain, parseMarketplaceNetwork } from "@/lib/chains";
import { assertMarketplaceBytecode, mapMarketplaceRpcError } from "@/lib/marketplace-read-guard";

const erc721SellerAbi = parseAbi([
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
]);

export const Route = createFileRoute("/marketplace/sell")({
  head: () =>
    pageHead({
      title: `Sell an NFT — ${BRAND_DISPLAY_NAME}`,
      description:
        "List an ERC-721 on the Build Culture marketplace: approve the contract, set your price in ETH, and publish a direct listing on Base.",
      path: "/marketplace/sell",
      keywords: ["Build Culture", "sell NFT", "marketplace", "listing", "Base"],
    }),
  component: MarketplaceSellPage,
});

function MarketplaceSellPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const twAccount = useActiveAccount();
  const { switchChain, isPending: switchPending } = useSwitchChain();

  const marketplaceChain = getMarketplaceChain();
  const marketplaceAddress = getMarketplaceContractAddress();
  const marketplaceNetworkLabel = parseMarketplaceNetwork();
  const feeBps = getMarketplacePlatformFeeBps();
  const feeRecipient = getMarketplaceFeeRecipientAddress();
  const feePercent = feeBps !== undefined ? (feeBps / 100).toFixed(2) : undefined;

  const [assetInput, setAssetInput] = useState("");
  const [tokenIdInput, setTokenIdInput] = useState("0");
  const [priceInput, setPriceInput] = useState("0.01");

  const assetAddress = useMemo(() => {
    const t = assetInput.trim();
    return isAddress(t) ? (t as `0x${string}`) : undefined;
  }, [assetInput]);

  const tokenIdBig = useMemo(() => {
    try {
      const t = tokenIdInput.trim();
      if (!t) return undefined;
      return BigInt(t);
    } catch {
      return undefined;
    }
  }, [tokenIdInput]);

  const wrongChain = chainId !== marketplaceChain.id;

  const ownerRead = useReadContract({
    chainId: marketplaceChain.id,
    address: assetAddress,
    abi: erc721SellerAbi,
    functionName: "ownerOf",
    args: tokenIdBig !== undefined ? [tokenIdBig] : undefined,
    query: {
      enabled:
        !!assetAddress &&
        tokenIdBig !== undefined &&
        !wrongChain &&
        chainId === marketplaceChain.id,
    },
  });

  const approvedRead = useReadContract({
    chainId: marketplaceChain.id,
    address: assetAddress,
    abi: erc721SellerAbi,
    functionName: "isApprovedForAll",
    args: address && assetAddress && marketplaceAddress ? [address, marketplaceAddress] : undefined,
    query: {
      enabled:
        !!assetAddress &&
        !!address &&
        !!marketplaceAddress &&
        !wrongChain &&
        chainId === marketplaceChain.id,
    },
  });

  const { writeContractAsync, isPending: approveWriting } = useWriteContract();

  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();

  const approveReceipt = useWaitForTransactionReceipt({
    hash: approveHash,
    chainId: marketplaceChain.id,
  });

  const isApproved = approvedRead.data === true;
  const owner = ownerRead.data;
  const youOwn =
    address && owner && typeof owner === "string" && owner.toLowerCase() === address.toLowerCase();

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!assetAddress || !marketplaceAddress) throw new Error("Missing addresses");
      const hash = await writeContractAsync({
        chainId: marketplaceChain.id,
        address: assetAddress,
        abi: erc721SellerAbi,
        functionName: "setApprovalForAll",
        args: [marketplaceAddress, true],
      });
      setApproveHash(hash);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Approval failed");
    },
  });

  const listMutation = useMutation({
    mutationFn: async () => {
      if (!thirdwebClient || !marketplaceAddress || !assetAddress || tokenIdBig === undefined) {
        toast.error("Configure marketplace and enter a valid asset + token ID.");
        return;
      }
      if (!twAccount) {
        toast.error("Wallet not ready — reconnect or try again.");
        return;
      }
      const contract = getContract({
        client: thirdwebClient,
        chain: thirdwebChainFromId(marketplaceChain.id),
        address: marketplaceAddress,
      });
      await assertMarketplaceBytecode(contract, marketplaceChain.name);
      const pricePerToken = priceInput.trim();
      if (!pricePerToken || Number(pricePerToken) <= 0) {
        toast.error("Enter a valid price (e.g. 0.01 for ETH).");
        return;
      }
      const tx = createListing({
        contract,
        assetContractAddress: assetAddress,
        tokenId: tokenIdBig,
        pricePerToken,
      });
      await sendTransaction({ transaction: tx, account: twAccount });
    },
    onSuccess: async () => {
      toast.success("Listing submitted");
      await queryClient.invalidateQueries({
        queryKey: ["marketplace-listings", marketplaceChain.id, marketplaceAddress],
      });
      try {
        if (
          thirdwebClient &&
          marketplaceAddress &&
          assetAddress !== undefined &&
          tokenIdBig !== undefined
        ) {
          const contract = getContract({
            client: thirdwebClient,
            chain: thirdwebChainFromId(marketplaceChain.id),
            address: marketplaceAddress,
          });
          await assertMarketplaceBytecode(contract, marketplaceChain.name);
          const listings = await getAllValidListings({ contract, count: 100n });
          const match = listings.find(
            (l) =>
              l.assetContractAddress.toLowerCase() === assetAddress.toLowerCase() &&
              BigInt(l.tokenId) === tokenIdBig,
          );
          if (match) {
            void navigate({
              to: "/marketplace/$listingId",
              params: { listingId: String(match.id) },
            });
            return;
          }
        }
      } catch {
        /* fall through */
      }
      void navigate({ to: "/marketplace" });
    },
    onError: (e) => {
      toast.error(mapMarketplaceRpcError(e).message);
    },
  });

  useEffect(() => {
    if (!approveReceipt.isSuccess) return;
    void queryClient.invalidateQueries();
  }, [approveReceipt.isSuccess, queryClient]);

  const approvalBusy = approveWriting || approveMutation.isPending || approveReceipt.isLoading;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </Link>

      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Sell an NFT</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Direct listings use native ETH on this marketplace contract. Raffle ticket mints live
          elsewhere — this flow is only for standard ERC-721 secondary listings.
        </p>
      </div>

      {!thirdwebClient && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          Set <span className="font-mono">VITE_THIRDWEB_CLIENT_ID</span> to enable transactions.
        </p>
      )}

      {!marketplaceAddress && (
        <p className="rounded-lg border border-muted px-4 py-3 text-sm text-muted-foreground">
          Set <span className="font-mono">VITE_MARKETPLACE_CONTRACT_ADDRESS</span> on{" "}
          {marketplaceChain.name} (network:{" "}
          <span className="font-semibold">{marketplaceNetworkLabel}</span>
          ).
        </p>
      )}

      {marketplaceAddress ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Marketplace fee (thirdweb Marketplace V3)</p>
          {feeBps !== undefined && feeRecipient ? (
            <p className="mt-2 space-y-2">
              <span>
                Documented platform fee: <span className="text-foreground">{feePercent}%</span> (
                {feeBps} bps), paid to{" "}
                <a
                  href={explorerAddressUrl(marketplaceChain.id, feeRecipient)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-xs text-neon underline"
                >
                  {feeRecipient}
                </a>
                . Confirm on-chain reads on the marketplace contract if env drifts from deploy.
              </span>
            </p>
          ) : (
            <p className="mt-2">
              Set <span className="font-mono">VITE_MARKETPLACE_PLATFORM_FEE_BPS</span> and{" "}
              <span className="font-mono">VITE_MARKETPLACE_FEE_RECIPIENT</span> to mirror the live
              deployment (treasury Safe). Fees are enforced by the marketplace contract — update env
              after <span className="font-mono">setMarketplaceFee</span> / recipient changes.
            </p>
          )}
        </div>
      ) : null}

      {!isConnected && (
        <p className="rounded-lg border border-white/10 px-4 py-3 text-sm text-muted-foreground">
          Connect your wallet using the site header controls, then return here to list.
        </p>
      )}

      {isConnected && wrongChain && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm space-y-3">
          <p>
            Switch to <span className="font-semibold">{marketplaceChain.name}</span> to approve and
            list.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={switchPending}
            onClick={() => switchChain?.({ chainId: marketplaceChain.id })}
          >
            {switchPending ? "Switching…" : `Switch to ${marketplaceChain.name}`}
          </Button>
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-white/10 bg-black/25 p-5">
        <div className="space-y-2">
          <Label htmlFor="asset">NFT contract (ERC-721)</Label>
          <Input
            id="asset"
            value={assetInput}
            onChange={(e) => setAssetInput(e.target.value)}
            placeholder="0x…"
            className="font-mono text-xs"
            autoComplete="off"
          />
          {assetInput.trim() && !assetAddress ? (
            <p className="text-xs text-destructive">Enter a valid contract address.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tokenId">Token ID</Label>
          <Input
            id="tokenId"
            value={tokenIdInput}
            onChange={(e) => setTokenIdInput(e.target.value)}
            placeholder="0"
            inputMode="numeric"
            className="font-mono text-xs"
          />
          {tokenIdBig === undefined && tokenIdInput.trim() ? (
            <p className="text-xs text-destructive">Invalid token ID.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price per token (ETH)</Label>
          <Input
            id="price"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="0.01"
            inputMode="decimal"
            className="font-mono text-xs"
          />
        </div>

        {ownerRead.isFetching && assetAddress && tokenIdBig !== undefined && !wrongChain ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking token owner…
          </p>
        ) : null}

        {ownerRead.error && assetAddress && tokenIdBig !== undefined ? (
          <p className="text-xs text-destructive">
            Could not read ownerOf — confirm the contract is ERC-721 and the token exists.
          </p>
        ) : null}

        {owner && address && !youOwn ? (
          <p className="text-xs text-amber-200/90">
            Connected wallet does not own this token. Switch to the holder wallet to list.
          </p>
        ) : null}

        {youOwn && isApproved ? (
          <p className="flex items-center gap-2 text-xs text-emerald-300/95">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Marketplace can transfer this NFT (approval set).
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="secondary"
            className="rounded-full"
            disabled={
              !assetAddress ||
              tokenIdBig === undefined ||
              !marketplaceAddress ||
              !youOwn ||
              isApproved ||
              wrongChain ||
              !isConnected ||
              approvalBusy ||
              !thirdwebClient
            }
            onClick={() => approveMutation.mutate()}
          >
            {approvalBusy ? "Confirm in wallet…" : "Approve marketplace"}
          </Button>

          <Button
            type="button"
            className="rounded-full"
            disabled={
              !assetAddress ||
              tokenIdBig === undefined ||
              !marketplaceAddress ||
              !youOwn ||
              !isApproved ||
              wrongChain ||
              !isConnected ||
              !twAccount ||
              listMutation.isPending ||
              !thirdwebClient
            }
            onClick={() => listMutation.mutate()}
          >
            {listMutation.isPending ? "Confirm in wallet…" : "Create listing"}
          </Button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          The marketplace may charge protocol fees on settlement; you set the gross listing price
          above. Buyers pay gas for purchases.
        </p>
      </div>
    </div>
  );
}
