import { test, expect } from "./fixtures/skip-onboarding";

test.describe("wallet and packs", () => {
  test("wallet page loads", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.getByRole("heading", { name: /culture wallet/i })).toBeVisible();
  });

  test("packs page lists tiers", async ({ page }) => {
    await page.goto("/wallet/packs");
    await expect(page.getByRole("heading", { name: /culture packs/i })).toBeVisible();
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByText("Whale", { exact: true })).toBeVisible();
  });

  test("pass page shows wallet CTA before connect", async ({ page }) => {
    await page.goto("/pass");
    const signIn = page.getByRole("button", { name: /sign in for wallet/i });
    const connect = page.getByRole("button", { name: /connect wallet/i });
    await expect(signIn.or(connect)).toBeVisible();
  });

  test("wallet hub shows Pay & earn tiles", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.getByText("Pay & earn")).toBeVisible();
    await expect(page.getByRole("link", { name: /Culture packs/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Presale \(on-chain\)/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /API billing/i })).toBeVisible();
  });

  test("pack deep link highlights pack card", async ({ page }) => {
    await page.goto("/wallet/packs?pack=pack_7");
    await expect(page.getByRole("heading", { name: /culture packs/i })).toBeVisible();
    const cultureCard = page.locator("#pack-pack_7");
    await expect(cultureCard).toBeVisible();
    await expect(cultureCard).toHaveClass(/ring-2/);
  });

  test("pass page shows Base / BNB network selector", async ({ page }) => {
    await page.goto("/pass");
    await expect(page.getByRole("group", { name: /identity network/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^base$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /bnb chain/i })).toBeVisible();
  });

  test("buy BCC button visible on pass page", async ({ page }) => {
    await page.goto("/pass");
    await expect(
      page.getByRole("button", { name: /pay with \$bcc|buy \$bcc|buy bcc/i }).first(),
    ).toBeVisible();
  });
});
