import type { Connector } from "wagmi";

/** Prefer Brave → generic injected → MetaMask for legacy browser-wallet connects. */
export function pickInjectedConnector(connectors: readonly Connector[]): Connector | undefined {
  const find = (pred: (c: Connector) => boolean) => connectors.find(pred);

  return (
    find((c) => c.id === "braveWallet" || c.name.toLowerCase().includes("brave")) ??
    find((c) => c.id === "injected" && c.name.toLowerCase().includes("brave")) ??
    find((c) => c.id === "metaMask" || c.name.toLowerCase().includes("metamask")) ??
    find((c) => c.id === "injected") ??
    find((c) => c.type === "injected" && c.id !== "worldApp")
  );
}

export function findBraveConnector(connectors: readonly Connector[]): Connector | undefined {
  return connectors.find((c) => c.id === "braveWallet" || c.name.toLowerCase().includes("brave"));
}
