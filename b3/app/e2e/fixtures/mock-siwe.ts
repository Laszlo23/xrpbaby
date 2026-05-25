import type { Page } from "@playwright/test";

const TEST_ADDRESS = "0x0000000000000000000000000000000000000001";

/** Inject a minimal EIP-1193 provider for UI flows that expect a connected wallet. */
export async function injectMockWallet(page: Page, address = TEST_ADDRESS) {
  await page.addInitScript((addr: string) => {
    const provider = {
      isMetaMask: true,
      selectedAddress: addr,
      chainId: "0x2105",
      request: async ({ method }: { method: string; params?: unknown[] }) => {
        if (method === "eth_accounts" || method === "eth_requestAccounts") {
          return [addr];
        }
        if (method === "eth_chainId") {
          return "0x2105";
        }
        if (method === "personal_sign") {
          return "0x" + "ab".repeat(65);
        }
        throw new Error(`Unsupported mock method: ${method}`);
      },
    };
    (window as unknown as { ethereum?: unknown }).ethereum = provider;
  }, address);
}

export { TEST_ADDRESS };
