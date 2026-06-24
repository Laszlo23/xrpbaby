import { test, expect } from "./fixtures/skip-onboarding";

test.describe("wallet session navbar", () => {
  test("wallet account menu trigger is present on wallet page when disconnected", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.getByRole("heading", { name: /culture wallet/i })).toBeVisible();
    const connect = page.getByRole("button", { name: /connect/i });
    const menu = page.getByRole("button", { name: /wallet account menu/i });
    await expect(connect.or(menu)).toBeVisible();
  });

  test("navbar connect chip persists across hub routes", async ({ page }) => {
    await page.goto("/forest");
    const connect = page.getByRole("button", { name: /^connect$/i });
    const menu = page.getByRole("button", { name: /wallet account menu/i });
    await expect(connect.or(menu).first()).toBeVisible();

    await page.goto("/profile");
    await expect(connect.or(menu).first()).toBeVisible();

    await page.goto("/wallet");
    await expect(connect.or(menu).first()).toBeVisible();
  });

  test("wallet account menu exposes settings link when connected", async ({ page }) => {
    await page.goto("/wallet");
    const menu = page.getByRole("button", { name: /wallet account menu/i });
    if (!(await menu.isVisible())) {
      test.skip(true, "No connected wallet in this environment");
    }
    await menu.click();
    await expect(page.getByRole("menuitem", { name: /wallet & settings/i })).toBeVisible();
  });
});
