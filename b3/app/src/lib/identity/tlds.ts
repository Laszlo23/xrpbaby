export const TLD_LABELS = [
  "culture",
  "build",
  "home",
  "eco",
  "capital",
  "city",
] as const;

export type TldLabel = (typeof TLD_LABELS)[number];

export const TLD_OPTIONS = TLD_LABELS.map((t) => `.${t}` as const);

export const IDENTITY_TLD_OPTIONS = TLD_OPTIONS;

export function tldLabelToId(tld: string): number | null {
  const clean = tld.replace(/^\./, "").toLowerCase();
  const idx = TLD_LABELS.indexOf(clean as TldLabel);
  return idx === -1 ? null : idx;
}

export function tldIdToLabel(tldId: number): TldLabel | null {
  return TLD_LABELS[tldId] ?? null;
}

export function parseIdentityFullName(fullName: string): {
  handle: string;
  tld: TldLabel;
  tldId: number;
} | null {
  const clean = fullName.toLowerCase().trim();
  const parts = clean.split(".");
  if (parts.length !== 2 || !parts[0]) return null;
  const tldId = tldLabelToId(parts[1]);
  if (tldId === null) return null;
  const handle = parts[0].replace(/[^a-z0-9]/g, "");
  if (!handle) return null;
  return { handle, tld: TLD_LABELS[tldId], tldId };
}
