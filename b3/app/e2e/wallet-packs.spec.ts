import { test, expect } from "@playwright/test";

test.describe("wallet and packs", () => {
  test("wallet page loads", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.getByRole("heading", { name: /culture wallet/i })).toBeVisible();
  });

  test("packs page lists tiers", async ({ page }) => {
    await page.goto("/wallet/packs");
    await expect(page.getByRole("heading", { name: /culture packs/i })).toBeVisible();
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByText("Whale")).toBeVisible();
  });

  test("pass page prompts sign-in when privy configured", async ({ page }) => {
    await page.goto("/pass");
    const privyId = process.env.VITE_PRIVY_APP_ID?.trim();
    if (privyId) {
      await expect(page.getByRole("button", { name: /sign in for wallet/i })).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
    }
  });
});
