import { expect, test } from "./fixtures/skip-onboarding";

async function expectSingleFooter(page: import("@playwright/test").Page) {
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
}

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

  test("single global footer on story and product routes", async ({ page }) => {
    for (const path of ["/", "/forest", "/signal", "/play", "/pass"] as const) {
      await page.goto(path);
      await expectSingleFooter(page);
    }
  });
});
