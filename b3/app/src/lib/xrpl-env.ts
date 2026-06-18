/** XRPL network + execution guards — mainnet settlement blocked unless explicitly policy-approved. */

export type XrplNetwork = "testnet" | "mainnet" | "devnet";

export function getXrplNetwork(): XrplNetwork {
  const raw = (process.env.XRPL_NETWORK ?? "testnet").trim().toLowerCase();
  if (raw === "mainnet") return "mainnet";
  if (raw === "devnet") return "devnet";
  return "testnet";
}

export function getXrplRpcUrl(): string {
  const custom = process.env.XRPL_RPC_URL?.trim();
  if (custom) return custom;
  const network = getXrplNetwork();
  if (network === "mainnet") return "wss://xrplcluster.com";
  if (network === "devnet") return "wss://s.devnet.rippletest.net:51233";
  return "wss://s.altnet.rippletest.net:51233";
}

export function getXrplTreasuryIntakeAddress(): string | null {
  const raw = process.env.XRPL_TREASURY_INTAKE_ADDRESS?.trim();
  if (!raw || !/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(raw)) return null;
  return raw;
}

export function xrpExecutionEnabledFlag(): boolean {
  return (process.env.XRPL_EXECUTION_ENABLED ?? "0").trim() === "1";
}

/** Execution (intake observation, settlement demos) only on testnet/devnet unless counsel approves mainnet. */
export function isXrplExecutionAllowed(): boolean {
  if (!xrpExecutionEnabledFlag()) return false;
  const network = getXrplNetwork();
  return network === "testnet" || network === "devnet";
}

export function xrplExplorerAccountUrl(address: string): string {
  const network = getXrplNetwork();
  if (network === "mainnet") {
    return `https://livenet.xrpl.org/accounts/${address}`;
  }
  if (network === "devnet") {
    return `https://devnet.xrpl.org/accounts/${address}`;
  }
  return `https://testnet.xrpl.org/accounts/${address}`;
}

export function xrplExplorerTxUrl(hash: string): string {
  const network = getXrplNetwork();
  if (network === "mainnet") return `https://livenet.xrpl.org/transactions/${hash}`;
  if (network === "devnet") return `https://devnet.xrpl.org/transactions/${hash}`;
  return `https://testnet.xrpl.org/transactions/${hash}`;
}
