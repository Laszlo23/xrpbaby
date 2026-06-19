import { describe, expect, it } from "vitest";
import type { Connector } from "wagmi";
import { findBraveConnector, pickInjectedConnector } from "./wallet-connectors";

function mockConnector(
  partial: Partial<Connector> & Pick<Connector, "id" | "name" | "uid">,
): Connector {
  return {
    type: "injected",
    ...partial,
  } as Connector;
}

describe("wallet-connectors", () => {
  it("prefers Brave over generic injected and MetaMask", () => {
    const connectors = [
      mockConnector({ id: "worldApp", name: "World App", uid: "1" }),
      mockConnector({ id: "metaMask", name: "MetaMask", uid: "2" }),
      mockConnector({ id: "braveWallet", name: "Brave Wallet", uid: "3" }),
      mockConnector({ id: "injected", name: "Injected", uid: "4" }),
    ];

    expect(pickInjectedConnector(connectors)?.id).toBe("braveWallet");
    expect(findBraveConnector(connectors)?.id).toBe("braveWallet");
  });

  it("falls back to injected when Brave is absent", () => {
    const connectors = [
      mockConnector({ id: "worldApp", name: "World App", uid: "1" }),
      mockConnector({ id: "injected", name: "Injected", uid: "2" }),
    ];

    expect(pickInjectedConnector(connectors)?.id).toBe("injected");
    expect(findBraveConnector(connectors)).toBeUndefined();
  });
});
