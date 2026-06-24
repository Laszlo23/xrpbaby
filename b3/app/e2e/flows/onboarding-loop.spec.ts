import { expect, test } from "../fixtures/skip-onboarding";

test.describe("onboarding loop", () => {
  test("join page loads with wallet CTA", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByRole("heading", { name: /Connect your wallet/i })).toBeVisible();
  });

  test("welcome route reachable", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page).toHaveURL(/\/welcome/);
  });
});
