/** External explorer links (Base Blockscout). */
const BLOCKSCOUT_BASE = "https://base.blockscout.com";

export function blockscoutTxUrl(hash: string): string {
  return `${BLOCKSCOUT_BASE}/tx/${hash}`;
}

export function blockscoutAddressUrl(address: string): string {
  return `${BLOCKSCOUT_BASE}/address/${address}`;
}
