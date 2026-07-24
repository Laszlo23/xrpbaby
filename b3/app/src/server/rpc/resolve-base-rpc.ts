/** Base mainnet RPC — prefers explicit BASE_RPC_URL, then Alchemy from ALCHEMY_API_KEY. */
export function resolveBaseRpcUrl(): string {
  const explicit =
    process.env.BASE_RPC_URL?.trim() || process.env.VITE_BASE_RPC_URL?.trim();
  if (explicit && !explicit.includes("mainnet.base.org")) {
    return explicit;
  }

  const key = process.env.ALCHEMY_API_KEY?.trim();
  if (key) {
    return `https://base-mainnet.g.alchemy.com/v2/${key}`;
  }

  return explicit || "https://mainnet.base.org";
}
