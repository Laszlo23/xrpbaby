import { expect, test } from "./fixtures/skip-onboarding";

test.describe("app shell chrome", () => {
  test("BottomNav hidden on landing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".nav-dock")).toHaveCount(0);
  });

  test("BottomNav hidden on join and forest", async ({ page }) => {
    await page.goto("/join");
    await expect(page.locator(".nav-dock")).toHaveCount(0);
    await page.goto("/forest");
    await expect(page.locator(".nav-dock")).toHaveCount(0);
  });

  test("BottomNav visible on play", async ({ page }) => {
    await page.goto("/play");
    await expect(page.locator(".nav-dock")).toBeVisible();
  });

  test("landing has single footer (LandingFooter)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toBeVisible();
    const footers = page.getByRole("contentinfo");
    await expect(footers).toHaveCount(1);
  });
});
