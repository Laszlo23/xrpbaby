/** Merch edition ladder — unit #1 cheapest, price steps until edition cap. */

export const MERCH_EDITION_CAP_DEFAULT = 77;
export const MERCH_BASE_USD_DEFAULT = 7.7;
export const MERCH_STEP_USD_DEFAULT = 0.77;
export const MERCH_PRODUCTION_TARGET_USD_DEFAULT = 2500;

function parseEnvNumber(key: string, fallback: number): number {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function merchEditionCap(): number {
  return Math.floor(parseEnvNumber("MERCH_EDITION_CAP", MERCH_EDITION_CAP_DEFAULT));
}

export function merchBaseUsd(): number {
  return parseEnvNumber("MERCH_BASE_USD", MERCH_BASE_USD_DEFAULT);
}

export function merchStepUsd(): number {
  return parseEnvNumber("MERCH_STEP_USD", MERCH_STEP_USD_DEFAULT);
}

export function merchProductionTargetUsd(): number {
  return parseEnvNumber("MERCH_PRODUCTION_TARGET_USD", MERCH_PRODUCTION_TARGET_USD_DEFAULT);
}

/** Price for a specific serial unit (1-based). */
export function priceUsdForUnitNumber(unitNumber: number): number {
  const n = Math.max(1, Math.floor(unitNumber));
  const raw = merchBaseUsd() + (n - 1) * merchStepUsd();
  return Math.round(raw * 100) / 100;
}

/** Sum of ladder prices from unit 1 through cap — gross at sell-out. */
export function ladderGrossAtCap(cap = merchEditionCap()): number {
  const editionCap = Math.max(1, Math.floor(cap));
  let sum = 0;
  for (let i = 1; i <= editionCap; i++) {
    sum += priceUsdForUnitNumber(i);
  }
  return Math.round(sum * 100) / 100;
}

export function unitsRemaining(soldCount: number, cap = merchEditionCap()): number {
  return Math.max(0, cap - Math.max(0, Math.floor(soldCount)));
}

export function nextUnitNumber(soldCount: number, cap = merchEditionCap()): number | null {
  const sold = Math.max(0, Math.floor(soldCount));
  if (sold >= cap) return null;
  return sold + 1;
}

export type MerchLadderQuote = {
  unitNumber: number;
  priceUsd: number;
  nextPriceUsd: number | null;
  unitsRemaining: number;
  editionCap: number;
};

export function merchLadderQuote(
  soldCount: number,
  cap = merchEditionCap(),
): MerchLadderQuote | null {
  const unitNumber = nextUnitNumber(soldCount, cap);
  if (!unitNumber) return null;
  return {
    unitNumber,
    priceUsd: priceUsdForUnitNumber(unitNumber),
    nextPriceUsd: unitNumber < cap ? priceUsdForUnitNumber(unitNumber + 1) : null,
    unitsRemaining: unitsRemaining(soldCount, cap),
    editionCap: cap,
  };
}

export function merchX402PriceLabel(priceUsd: number): string {
  return `$${priceUsd.toFixed(priceUsd % 1 ? 2 : 0)}`;
}

export function formatMerchUsd(usd: number): string {
  if (usd % 1 === 0) return `$${usd.toFixed(0)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatLadderLine(quote: MerchLadderQuote): string {
  const next =
    quote.nextPriceUsd != null ? ` — next unit ${formatMerchUsd(quote.nextPriceUsd)}` : "";
  return `You're buying #${quote.unitNumber} of ${quote.editionCap} — ${formatMerchUsd(quote.priceUsd)}${next}`;
}

/** True when ladder gross meets or exceeds production target. */
export function isProductionTargetMet(cap = merchEditionCap()): boolean {
  return ladderGrossAtCap(cap) >= merchProductionTargetUsd();
}
