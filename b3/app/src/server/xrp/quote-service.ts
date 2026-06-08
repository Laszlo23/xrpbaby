export type XrpQuoteMode = "learn" | "live";

export type XrpQuoteInput = {
  base: string;
  quote: string;
  amount: number;
  mode: XrpQuoteMode;
};

export type XrpQuoteResult =
  | {
      ok: true;
      mode: XrpQuoteMode;
      executionEnabled: boolean;
      quote: {
        price: string;
        estimatedOutput: string;
        slippageBps: number;
      };
      liquidity: {
        source: "fallback";
        depthScore: number;
      };
      learningHint: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export function xrpQuoteEnabled(): boolean {
  return (process.env.XRPL_QUOTE_ENABLED ?? "0").trim() === "1";
}

export function xrpExecutionEnabled(): boolean {
  return (process.env.XRPL_EXECUTION_ENABLED ?? "0").trim() === "1";
}

export function buildXrpQuote(input: XrpQuoteInput): XrpQuoteResult {
  if (!xrpQuoteEnabled()) {
    return { ok: false, status: 503, error: "xrp_quote_disabled" };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, status: 400, error: "invalid_amount" };
  }
  if (!input.base || !input.quote) {
    return { ok: false, status: 400, error: "invalid_pair" };
  }

  const fallback = Number(process.env.XRPL_XRP_USD_FALLBACK ?? "0.5231");
  const price = Number.isFinite(fallback) && fallback > 0 ? fallback : 0.5231;
  const slippageBps = input.amount > 1000 ? 90 : input.amount > 250 ? 65 : 40;
  const estimatedOutput = input.amount * price * ((10_000 - slippageBps) / 10_000);
  const depthScore = input.amount > 1000 ? 0.58 : input.amount > 250 ? 0.68 : 0.78;
  const mode = input.mode;
  const executionEnabled = xrpExecutionEnabled();

  return {
    ok: true,
    mode,
    executionEnabled,
    quote: {
      price: price.toFixed(6),
      estimatedOutput: estimatedOutput.toFixed(6),
      slippageBps,
    },
    liquidity: {
      source: "fallback",
      depthScore,
    },
    learningHint:
      slippageBps >= 80
        ? "Your size is high for current depth. Try a smaller amount first."
        : "Compare multiple sizes to understand slippage before using live mode.",
  };
}
