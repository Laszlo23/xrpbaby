import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

test.describe("Mobile drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await skipHomeIntroRedirect(page);
  });

  test("open menu and navigate to Trade", async ({ page }) => {
    await page.goto("/how-it-works");
    await page.waitForLoadState("load");
    await expect(page.locator("header[data-nav-interactive]")).toHaveAttribute("data-nav-interactive", "true", {
      timeout: 30_000,
    });
    const openBtn = page.getByRole("button", { name: "Open menu" });
    await openBtn.click();
    await expect(openBtn).toHaveAttribute("aria-expanded", "true");
    const drawer = page.locator("#mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    await drawer.locator('a[href="/trade"]').click();
    await expect(page).toHaveURL(/\/trade$/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
