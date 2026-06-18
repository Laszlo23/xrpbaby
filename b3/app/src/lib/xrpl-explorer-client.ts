/** Client-safe XRPL explorer URLs (defaults to testnet). */

function clientXrplNetwork(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_XRPL_NETWORK) {
    return String(import.meta.env.VITE_XRPL_NETWORK).toLowerCase();
  }
  return "testnet";
}

export function xrplAccountExplorerUrl(address: string): string {
  const network = clientXrplNetwork();
  if (network === "mainnet") {
    return `https://livenet.xrpl.org/accounts/${address}`;
  }
  if (network === "devnet") {
    return `https://devnet.xrpl.org/accounts/${address}`;
  }
  return `https://testnet.xrpl.org/accounts/${address}`;
}
