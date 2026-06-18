/**
 * Normalize pasted / typed explorer search input.
 * Strips whitespace, zero-width chars, and adds 0x when missing.
 */
export function normalizeExplorerQuery(raw: string): string {
  let q = raw
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "")
    .trim();

  if (/^[0-9a-fA-F]{40}$/.test(q)) q = `0x${q}`;
  if (/^[0-9a-fA-F]{64}$/.test(q)) q = `0x${q}`;

  return q.toLowerCase();
}
