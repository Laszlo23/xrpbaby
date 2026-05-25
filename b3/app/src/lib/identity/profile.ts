/** Deterministic placeholder profile for mint preview cards (not onchain data). */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function shortHex(n: number, len = 4) {
  return n.toString(16).padStart(8, "0").slice(0, len);
}

export function profileFor(fullName: string) {
  const clean = fullName.toLowerCase().trim();
  const parts = clean.split(".");
  const handle = parts[0] || "unknown";
  const tld = parts[1] || "culture";
  const seed = hash(clean);
  const address =
    "0x" +
    shortHex(seed, 8) +
    shortHex(hash(`${clean}a`) >>> 0, 8) +
    shortHex(hash(`${clean}b`) >>> 0, 8) +
    shortHex(hash(`${clean}c`) >>> 0, 8) +
    shortHex(hash(`${clean}d`) >>> 0, 8);
  const xp = 800 + (seed % 9200);
  return {
    fullName: `${handle}.${tld}`,
    handle,
    tld,
    address,
    shortAddress: `${address.slice(0, 6)}…${address.slice(-4)}`,
    xp,
  };
}
