import { expect, test } from "./fixtures/skip-onboarding";

test.describe("onboarding flow", () => {
  test("/join loads with plain-language steps", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByRole("heading", { name: /Connect your wallet/i })).toBeVisible();
    await expect(page.getByText(/Connect wallet/i).first()).toBeVisible();
  });

  test("back link goes to landing story", async ({ page }) => {
    await page.goto("/join");
    await page.getByRole("link", { name: /Back to the story/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /Who are you/i })).toBeVisible();
  });

  test("intent selection highlights choice", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByRole("heading", { name: /Connect your wallet/i })).toBeVisible();
  });

  test("shows connect panel when wallet not connected", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByText(/Email, Base Account, Coinbase/i)).toBeVisible();
  });
});
