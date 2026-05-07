import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { formatUnits, maxUint256, parseEther, type Address, type Hex } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { bcdFixedPriceSaleAbi } from "@bc/contracts-sdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBcdEconomy } from "@/contexts/BcdEconomyContext";
import {
  BCD_SYMBOL,
  getBcdSaleAddress,
  getBcdSaleEligibilityBase,
  getBcdSaleRoundId,
  getBcdGenesisClaimAddress,
  getDemoBcdBalanceDisplay,
  getBcdPerWholeEth,
  getBcdTokenAddress,
} from "@/lib/bcd-config";
import { erc20Abi } from "@/lib/bcd-abi";
import { formatEthWeiAsBcd } from "@/lib/bcd-price";
import { parseBcdChainId, getWagmiChainById } from "@/lib/chains";
import { saleBuyerPaysWei } from "@/lib/bcd-sale-payment";
import { markBcdTutorialSeen } from "@/lib/playerProgress";
import { explorerTxUrl } from "@/lib/explorer";
import { toast } from "sonner";

const MERKLE_ROOT_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

type SaleRound = {
  start: bigint;
  end: bigint;
  merkleRoot: Hex;
  paymentPerWholeBcd: bigint;
  maxBcdWei: bigint;
  perWalletPublicCapWei: bigint;
};

type SaleEligibilityPayload = {
  maxBcdWei: string;
  proof: string[];
};

function formatUnixTs(sec: bigint): string {
  try {
    return new Date(Number(sec) * 1000).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(sec);
  }
}

export function GetBcdModal() {
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const { getBcdOpen, closeGetBcd } = useBcdEconomy();
  const { switchChain, isPending: switching } = useSwitchChain();

  const sale = getBcdSaleAddress();
  const token = getBcdTokenAddress();
  const genesisClaim = getBcdGenesisClaimAddress();
  const ratio = getBcdPerWholeEth();
  const bcdChainId = parseBcdChainId();
  const bcdChain = getWagmiChainById(bcdChainId);
  const wrongChain = isConnected && walletChainId !== bcdChainId;
  const roundId = getBcdSaleRoundId();

  const [ethAmount, setEthAmount] = useState("1");
  const [bcdHumanAmount, setBcdHumanAmount] = useState("100");

  const [eligibility, setEligibility] = useState<SaleEligibilityPayload | null>(null);
  const [eligLoading, setEligLoading] = useState(false);
  const [pasteJson, setPasteJson] = useState("");

  useEffect(() => {
    if (!getBcdOpen || !address) return;
    markBcdTutorialSeen(address);
  }, [getBcdOpen, address]);

  const saleEnabled = !!sale;

  const { data: roundRaw } = useReadContract({
    chainId: bcdChainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "rounds",
    args: [roundId],
    query: { enabled: saleEnabled },
  });

  const round = roundRaw as SaleRound | undefined;

  const { data: feeBpsRaw } = useReadContract({
    chainId: bcdChainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "feeBps",
    query: { enabled: saleEnabled },
  });

  const { data: salePaused } = useReadContract({
    chainId: bcdChainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "paused",
    query: { enabled: saleEnabled },
  });

  const { data: paymentToken } = useReadContract({
    chainId: bcdChainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "paymentToken",
    query: { enabled: saleEnabled },
  });

  const payTok = paymentToken as Address | undefined;
  const isEthSale = payTok === undefined || payTok === "0x0000000000000000000000000000000000000000";

  const { data: payDecimals } = useReadContract({
    chainId: bcdChainId,
    address: payTok,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: saleEnabled && !isEthSale && !!payTok },
  });

  const { data: paySymbol } = useReadContract({
    chainId: bcdChainId,
    address: payTok,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: saleEnabled && !isEthSale && !!payTok },
  });

  const { data: soldWei, refetch: refetchSold } = useReadContract({
    chainId: bcdChainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "roundSoldBcdWei",
    args: [roundId],
    query: { enabled: saleEnabled },
  });

  const { data: walletBought, refetch: refetchWalletBought } = useReadContract({
    chainId: bcdChainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "walletBoughtBcdWei",
    args: address ? [roundId, address] : undefined,
    query: { enabled: saleEnabled && !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    chainId: bcdChainId,
    address: payTok,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && sale ? [address, sale] : undefined,
    query: { enabled: saleEnabled && !isEthSale && !!payTok && !!address && !!sale },
  });

  const fetchSaleEligibility = useCallback(async () => {
    const base = getBcdSaleEligibilityBase();
    if (!base || !address) {
      setEligibility(null);
      return;
    }
    setEligLoading(true);
    try {
      const res = await fetch(`${base}/${address.toLowerCase()}-${roundId}.json`, {
        method: "GET",
      });
      if (!res.ok) {
        setEligibility(null);
        return;
      }
      const json = (await res.json()) as SaleEligibilityPayload;
      if (!json.maxBcdWei || !Array.isArray(json.proof)) {
        setEligibility(null);
        return;
      }
      setEligibility(json);
    } catch {
      setEligibility(null);
    } finally {
      setEligLoading(false);
    }
  }, [address, roundId]);

  useEffect(() => {
    void fetchSaleEligibility();
  }, [fetchSaleEligibility]);

  function applyPasteJson() {
    try {
      const json = JSON.parse(pasteJson) as SaleEligibilityPayload;
      if (!json.maxBcdWei || !Array.isArray(json.proof)) {
        toast.error("JSON needs maxBcdWei (string) and proof (0x32 byte array).");
        return;
      }
      setEligibility(json);
      toast.success("Private sale eligibility loaded.");
    } catch {
      toast.error("Invalid JSON.");
    }
  }

  let previewBcd = "0";
  try {
    const wei = parseEther(ethAmount as `${number}`);
    previewBcd = formatEthWeiAsBcd(wei, ratio);
  } catch {
    previewBcd = "—";
  }

  let bcdWeiParsed: bigint | undefined;
  try {
    bcdWeiParsed = parseEther(bcdHumanAmount as `${number}`);
  } catch {
    bcdWeiParsed = undefined;
  }

  const feeBps = (feeBpsRaw as bigint | undefined) ?? 0n;
  const isRoundConfigured = !!(round && round.maxBcdWei > 0n);
  const isPrivateRound =
    !!round && round.merkleRoot?.toLowerCase() !== MERKLE_ROOT_ZERO.toLowerCase();

  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const roundActive =
    !!round &&
    isRoundConfigured &&
    nowSec >= round.start &&
    nowSec <= round.end &&
    !salePaused;

  const merkleMaxWei = useMemo(() => {
    if (!eligibility?.maxBcdWei) return undefined;
    try {
      return BigInt(eligibility.maxBcdWei);
    } catch {
      return undefined;
    }
  }, [eligibility]);

  const payQuote = useMemo(() => {
    if (!bcdWeiParsed || bcdWeiParsed <= 0n || !round || !isRoundConfigured) return undefined;
    return saleBuyerPaysWei(bcdWeiParsed, round.paymentPerWholeBcd, feeBps);
  }, [bcdWeiParsed, round, isRoundConfigured, feeBps]);

  const approveW = useWriteContract();
  const buyW = useWriteContract();

  useEffect(() => {
    const e = approveW.error ?? buyW.error;
    if (!e) return;
    toast.error(e.message.slice(0, 160));
  }, [approveW.error, buyW.error]);

  const { isLoading: approveBusy } = useWaitForTransactionReceipt({ hash: approveW.data });
  const { isLoading: buyBusy } = useWaitForTransactionReceipt({ hash: buyW.data });

  useEffect(() => {
    if (!approveW.isSuccess || !approveW.data) return;
    void refetchAllowance();
    toast.success("Token approval confirmed.");
  }, [approveW.isSuccess, approveW.data, refetchAllowance]);

  useEffect(() => {
    if (!buyW.isSuccess || !buyW.data) return;
    void refetchSold();
    void refetchWalletBought();
    void refetchAllowance();
    toast.success(
      <span>
        Purchase confirmed.{" "}
        <a
          href={explorerTxUrl(bcdChainId, buyW.data)}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          View tx
        </a>
      </span>,
    );
  }, [buyW.isSuccess, buyW.data, bcdChainId, refetchSold, refetchWalletBought, refetchAllowance]);

  const genesisReady = !!(genesisClaim && token);
  const canBuyOnChain = !!sale && !!token;

  const proofHex = useMemo(
    () => (eligibility?.proof ? (eligibility.proof as Hex[]) : ([] as Hex[])),
    [eligibility],
  );

  const needsApprove =
    !isEthSale &&
    payQuote &&
    allowance !== undefined &&
    (allowance as bigint) < payQuote.totalWei;

  const privateReady = !isPrivateRound || (!!merkleMaxWei && eligibility && proofHex.length > 0);

  const buyDisabledReason = (() => {
    if (!canBuyOnChain) return "Configure token + sale env";
    if (!isConnected || !address) return "Connect wallet";
    if (wrongChain) return `Switch to ${bcdChain?.name ?? `chain ${bcdChainId}`}`;
    if (!isRoundConfigured) return "Round not configured on-chain";
    if (salePaused) return "Sale paused";
    if (!roundActive) return "Round inactive";
    if (!bcdWeiParsed || bcdWeiParsed <= 0n) return "Enter a valid BCD amount";
    if (!payQuote) return "—";
    if (isPrivateRound && !privateReady) return "Load private eligibility (or paste JSON)";
    if (
      isPrivateRound &&
      merkleMaxWei !== undefined &&
      bcdWeiParsed &&
      bcdWeiParsed > merkleMaxWei
    ) {
      return "Amount exceeds your whitelist max for this round";
    }
    if (!isEthSale && needsApprove) return "Approve payment token first";
    return null;
  })();

  function onApprove() {
    if (!sale || !payTok || isEthSale) return;
    if (wrongChain) {
      switchChain?.({ chainId: bcdChainId });
      return;
    }
    approveW.writeContract({
      chainId: bcdChainId,
      address: payTok,
      abi: erc20Abi,
      functionName: "approve",
      args: [sale, maxUint256],
    });
  }

  function onBuy() {
    if (!sale || !round || !bcdWeiParsed || !payQuote) return;
    if (wrongChain) {
      switchChain?.({ chainId: bcdChainId });
      return;
    }
    const merkleArg = isPrivateRound ? (merkleMaxWei ?? 0n) : 0n;
    const args = [roundId, bcdWeiParsed, merkleArg, proofHex] as const;
    if (isEthSale) {
      buyW.writeContract({
        chainId: bcdChainId,
        address: sale,
        abi: bcdFixedPriceSaleAbi,
        functionName: "buy",
        args,
        value: payQuote.totalWei,
      });
    } else {
      buyW.writeContract({
        chainId: bcdChainId,
        address: sale,
        abi: bcdFixedPriceSaleAbi,
        functionName: "buy",
        args,
        value: 0n,
      });
    }
  }

  const payLabel =
    payQuote && !isEthSale && payDecimals !== undefined
      ? `${formatUnits(payQuote.totalWei, payDecimals as number)} ${(paySymbol as string) || "TOKEN"}`
      : payQuote && isEthSale
        ? `${formatUnits(payQuote.totalWei, 18)} ETH`
        : "—";

  const txBusy =
    approveW.isPending || buyW.isPending || approveBusy || buyBusy || switching;

  return (
    <Dialog open={getBcdOpen} onOpenChange={(o) => !o && closeGetBcd()}>
      <DialogContent className="glass border-white/[0.08] sm:max-w-md sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Get {BCD_SYMBOL}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Building Culture Dollar is your on-app currency for drops—stack it, then mint tickets
            when campaigns go live.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {saleEnabled && round ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Live sale · round #{String(roundId)}
              </p>
              {!isRoundConfigured ? (
                <p className="text-sm text-zinc-500">
                  Sale contract is set, but this round id has not been configured on-chain yet (
                  <span className="font-mono">configureRound</span>).
                </p>
              ) : (
                <>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {isPrivateRound ? (
                      <span className="text-zinc-300">Private round</span>
                    ) : (
                      <span className="text-zinc-300">Public round</span>
                    )}{" "}
                    · {isEthSale ? "Pay in ETH" : `Pay in ${(paySymbol as string) || "ERC-20"}`} · Fee{" "}
                    {feeBps.toString()} bps
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    {formatUnixTs(round.start)} → {formatUnixTs(round.end)}
                    {salePaused ? (
                      <span className="ml-2 text-amber-500/90">· Paused</span>
                    ) : roundActive ? (
                      <span className="ml-2 text-emerald-500/90">· Active</span>
                    ) : nowSec < round.start ? (
                      <span className="ml-2">· Not started</span>
                    ) : (
                      <span className="ml-2">· Ended</span>
                    )}
                  </p>
                  {soldWei !== undefined ? (
                    <p className="font-mono text-[11px] text-zinc-500">
                      Round sold {formatUnits(soldWei as bigint, 18)} / {formatUnits(round.maxBcdWei, 18)}{" "}
                      {BCD_SYMBOL}
                      {walletBought !== undefined && address ? (
                        <span className="ml-2">
                          · You {formatUnits(walletBought as bigint, 18)} {BCD_SYMBOL}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                  <label className="block text-xs text-zinc-500" htmlFor="bcd-buy-amt">
                    Amount ({BCD_SYMBOL})
                  </label>
                  <Input
                    id="bcd-buy-amt"
                    inputMode="decimal"
                    value={bcdHumanAmount}
                    onChange={(e) => setBcdHumanAmount(e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="100"
                  />
                  <p className="text-center font-heading text-lg font-semibold text-emerald text-glow-emerald">
                    ≈ {payLabel}
                  </p>
                  {isPrivateRound ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-600">
                        Whitelist proofs: publish JSON at{" "}
                        <span className="font-mono text-zinc-400">
                          {getBcdSaleEligibilityBase()
                            ? `${getBcdSaleEligibilityBase()}/…`
                            : "VITE_BCD_SALE_ELIGIBILITY_BASE"}
                          /{"{wallet}"}-{String(roundId)}.json
                        </span>
                        . Uses leaf{" "}
                        <span className="font-mono">
                          keccak256(abi.encode(roundId, account, maxBcdWei))
                        </span>
                        .
                      </p>
                      {eligLoading ? (
                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                          Checking eligibility…
                        </p>
                      ) : !eligibility ? (
                        <p className="text-xs text-zinc-500">
                          No eligibility file loaded for this wallet.
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-600/90">
                          Loaded max {merkleMaxWei !== undefined ? formatUnits(merkleMaxWei, 18) : "—"} {BCD_SYMBOL}{" "}
                          allowance for this round.
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Paste eligibility JSON…"
                          value={pasteJson}
                          onChange={(e) => setPasteJson(e.target.value)}
                          className="font-mono text-[11px]"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={applyPasteJson}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  {wrongChain ? (
                    <p className="text-xs text-amber-500">
                      Connected to chain {walletChainId}; switch to {bcdChainId} ({bcdChain?.name ?? "BCD network"}
                      ).
                    </p>
                  ) : null}
                  {!isEthSale && needsApprove ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      disabled={txBusy || !payTok}
                      onClick={() => void onApprove()}
                    >
                      {approveW.isPending || approveBusy ? (
                        <>
                          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                          Approving…
                        </>
                      ) : (
                        `Approve ${(paySymbol as string) || "token"}`
                      )}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    disabled={!!buyDisabledReason || txBusy}
                    className="w-full rounded-full border border-white/15 bg-transparent text-white hover:bg-white/[0.06]"
                    title={buyDisabledReason ?? undefined}
                    onClick={() => void onBuy()}
                  >
                    {buyW.isPending || buyBusy ? (
                      <>
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                        Confirm purchase…
                      </>
                    ) : wrongChain ? (
                      `Switch to ${bcdChain?.name ?? `chain ${bcdChainId}`}`
                    ) : (
                      `Buy ${BCD_SYMBOL}`
                    )}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Preview (fixed-rate display)
              </p>
              <label className="mt-3 block text-xs text-zinc-500" htmlFor="bcd-eth">
                ETH amount
              </label>
              <Input
                id="bcd-eth"
                inputMode="decimal"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="mt-1 font-mono"
                placeholder="1"
              />
              <p className="mt-4 text-center font-heading text-2xl font-semibold text-emerald text-glow-emerald">
                ≈ {previewBcd} {BCD_SYMBOL}
              </p>
              <p className="mt-2 text-center text-[11px] text-zinc-600">
                Rate: {ratio.toString()} {BCD_SYMBOL} per 1 ETH (display preview when no sale address).
              </p>
            </div>
          )}
          {!token ? (
            <p className="text-sm text-zinc-500">
              Demo mode: treat your balance as{" "}
              <strong className="text-zinc-300">{getDemoBcdBalanceDisplay()}</strong> {BCD_SYMBOL} in the
              UI. Set <span className="font-mono">VITE_BCD_TOKEN_ADDRESS</span> for live reads.
            </p>
          ) : null}
          {genesisReady ? (
            <p className="text-sm leading-relaxed text-zinc-500">
              <strong className="text-zinc-200">Genesis is live:</strong> claim your whitelist allocation on the
              Mission page (merkle proof).
            </p>
          ) : null}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => closeGetBcd()}
          >
            Close
          </Button>
          {genesisReady ? (
            <Button
              type="button"
              asChild
              className="w-full rounded-full bg-[var(--b3-purple)] text-white hover:bg-[var(--base-blue-hover)] sm:w-auto"
            >
              <Link to="/mission" onClick={() => closeGetBcd()}>
                Genesis claim ({BCD_SYMBOL})
              </Link>
            </Button>
          ) : null}
          {!saleEnabled ? (
            <Button
              type="button"
              disabled={!canBuyOnChain}
              className="w-full rounded-full border border-white/15 bg-transparent text-white hover:bg-white/[0.06] sm:w-auto disabled:opacity-40"
              title={
                canBuyOnChain ? undefined : "Connect sale contract via VITE_BCD_SALE_ADDRESS when deployed"
              }
            >
              {canBuyOnChain ? `Buy ${BCD_SYMBOL}` : "Sale (coming)"}
            </Button>
          ) : null}
        </DialogFooter>
        <p className="text-center text-[11px] text-zinc-600">
          <Link
            to="/mission"
            className="text-zinc-400 underline-offset-2 hover:text-white"
            onClick={() => closeGetBcd()}
          >
            Mission · Building Culture DAO
          </Link>
          {" · "}
          <Link
            to="/faq"
            className="text-zinc-400 underline-offset-2 hover:text-white"
            onClick={() => closeGetBcd()}
          >
            FAQ
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
