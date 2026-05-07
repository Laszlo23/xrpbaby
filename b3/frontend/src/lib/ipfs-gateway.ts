/** Normalize NFT media URLs for `<img src>` (Insight sometimes returns ipfs://). */
export function ipfsToHttp(url: string | undefined): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith("ipfs://")) {
    const path = trimmed.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
    return `https://ipfs.io/ipfs/${path}`;
  }
  return trimmed;
}
