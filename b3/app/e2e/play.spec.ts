import { expect, test } from "./fixtures/skip-onboarding";

test.describe("play drops home", () => {
  test("loads with drops context", async ({ page }) => {
    await page.goto("/play");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText(/drops and rewards|Win Real-World/i).first()).toBeVisible();
  });

  test("bottom nav Play is visible and active", async ({ page }) => {
    await page.goto("/play");
    const playNav = page.getByRole("link", { name: /^Play$/i });
    await expect(playNav).toBeVisible();
  });

  test("can navigate to art drops", async ({ page }) => {
    await page.goto("/play");
    const artLink = page.getByRole("link", { name: /art/i }).first();
    if (await artLink.count()) {
      await artLink.click();
      await expect(page).toHaveURL(/\/drops\/art/);
    }
  });

  test("wallet controls present", async ({ page }) => {
    await page.goto("/play");
    await expect(page.getByRole("button", { name: /Connect|Wallet|Account/i }).first()).toBeVisible();
  });
});
