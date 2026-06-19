import { test } from "./fixtures/skip-onboarding";

const walletE2e = process.env.CI_WALLET_E2E === "1";

test.describe("wallet on-chain e2e", () => {
  test.skip(!walletE2e, "Set CI_WALLET_E2E=1 with Anvil for on-chain specs");

  test("placeholder for Anvil BCC grant payment flow", async () => {
    // Requires local Anvil + BCC deploy + funded test wallet.
    // Extend when CI_WALLET_E2E=1 in audit-gate optional job.
  });
});
