import { BCC_SYMBOL } from "@bc/bcc-kit";
import { useReadContract } from "wagmi";
import {
  BCC_TOKEN_ADDRESS,
  primaryShareSaleBccAbi,
  primaryShareSaleErc20Abi,
} from "@/lib/contracts";
import { getListingsChainId } from "@/lib/listings-config";
import { getPrimarySaleForProperty, type PrimarySaleEntry } from "@/lib/primary-sales-config";

const zero = "0x0000000000000000000000000000000000000000" as const;

export type PrimarySaleQuote = {
  config: PrimarySaleEntry | undefined;
  saleAddress: `0x${string}`;
  bccSaleAddress: `0x${string}`;
  onChainSale: boolean;
  bccOnChainSale: boolean;
  pricePerShare: bigint | undefined;
  bccCost: bigint | undefined;
  paymentToken: `0x${string}`;
  bccToken: `0x${string}`;
  effectiveDecimals: number;
  bccDecimals: number;
  paySymbol: string;
  shareTokenFromSale: `0x${string}` | undefined;
  isShareTokenSuccess: boolean;
};

type Options = {
  /** When true, quote the BCC rail (`PrimaryShareSaleBcc`) instead of USDC ERC-20 sale */
  payWithBcc?: boolean;
  wholeShares?: bigint;
};

/**
 * Read-only primary sale binding: config from primary-sales.json + on-chain shareToken, price, payment.
 * Reuse for Invest journey and Trade primary panel to avoid duplicating contract read logic.
 */
export function usePrimarySaleQuote(
  shareTokenAddress: `0x${string}` | undefined,
  propertyId: bigint | undefined,
  options: Options = {},
) {
  const { payWithBcc = false, wholeShares = 1n } = options;
  const listingsChainId = getListingsChainId();
  const [config, setConfig] = useState<PrimarySaleEntry | undefined>(undefined);

  useEffect(() => {
    if (propertyId === undefined) {
      setConfig(undefined);
      return;
    }
    setConfig(getPrimarySaleForProperty(propertyId, listingsChainId));
  }, [propertyId, listingsChainId]);

  const saleAddr = (config?.saleAddress ?? zero) as `0x${string}`;
  const bccSaleAddr = (config?.bccSaleAddress?.trim() || zero) as `0x${string}`;
  const activeSaleAddr = payWithBcc && bccSaleAddr !== zero ? bccSaleAddr : saleAddr;

  const { data: saleShareTok, isSuccess: isShareTokenSuccess } = useReadContract({
    address: activeSaleAddr !== zero ? activeSaleAddr : undefined,
    abi: payWithBcc ? primaryShareSaleBccAbi : primaryShareSaleErc20Abi,
    functionName: "shareToken",
    query: { enabled: activeSaleAddr !== zero },
  });

  const onChainSale = useMemo(() => {
    if (!config || saleAddr === zero || !shareTokenAddress || payWithBcc) return false;
    if (typeof saleShareTok !== "string") return false;
    return saleShareTok.toLowerCase() === shareTokenAddress.toLowerCase();
  }, [config, saleAddr, shareTokenAddress, saleShareTok, payWithBcc]);

  const bccOnChainSale = useMemo(() => {
    if (!config || bccSaleAddr === zero || !shareTokenAddress || !payWithBcc) return false;
    if (typeof saleShareTok !== "string") return false;
    return saleShareTok.toLowerCase() === shareTokenAddress.toLowerCase();
  }, [config, bccSaleAddr, shareTokenAddress, saleShareTok, payWithBcc]);

  const saleActive = payWithBcc ? bccOnChainSale : onChainSale;

  const { data: pricePerShare } = useReadContract({
    address: onChainSale ? saleAddr : undefined,
    abi: primaryShareSaleErc20Abi,
    functionName: "pricePerShare",
    query: { enabled: onChainSale },
  });

  const { data: paymentTokRead } = useReadContract({
    address: onChainSale ? saleAddr : undefined,
    abi: primaryShareSaleErc20Abi,
    functionName: "paymentToken",
    query: { enabled: onChainSale },
  });

  const { data: bccCostRead } = useReadContract({
    address: bccOnChainSale ? bccSaleAddr : undefined,
    abi: primaryShareSaleBccAbi,
    functionName: "quoteBccCost",
    args: [wholeShares >= 1n ? wholeShares : 1n],
    query: { enabled: bccOnChainSale && wholeShares >= 1n },
  });

  const paymentToken = (typeof paymentTokRead === "string" ? paymentTokRead : zero) as `0x${string}`;

  const effectiveDecimals = config?.paymentDecimals ?? 6;
  const paySymbol = payWithBcc ? BCC_SYMBOL : (config?.paymentSymbol ?? "USDC");

  const quote: PrimarySaleQuote = useMemo(
    () => ({
      config,
      saleAddress: saleAddr,
      bccSaleAddress: bccSaleAddr,
      onChainSale,
      bccOnChainSale,
      pricePerShare,
      bccCost: typeof bccCostRead === "bigint" ? bccCostRead : undefined,
      paymentToken: payWithBcc ? BCC_TOKEN_ADDRESS : paymentToken,
      bccToken: BCC_TOKEN_ADDRESS,
      effectiveDecimals: payWithBcc ? 18 : effectiveDecimals,
      bccDecimals: 18,
      paySymbol,
      shareTokenFromSale: typeof saleShareTok === "string" ? (saleShareTok as `0x${string}`) : undefined,
      isShareTokenSuccess,
    }),
    [
      config,
      saleAddr,
      bccSaleAddr,
      onChainSale,
      bccOnChainSale,
      pricePerShare,
      bccCostRead,
      paymentToken,
      effectiveDecimals,
      paySymbol,
      saleShareTok,
      isShareTokenSuccess,
      payWithBcc,
    ],
  );

  const activeOnChain = saleActive;

  return { ...quote, activeOnChain, activeSaleAddress: activeSaleAddr };
}
