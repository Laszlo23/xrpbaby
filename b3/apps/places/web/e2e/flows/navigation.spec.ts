import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

test.describe("Desktop header navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await skipHomeIntroRedirect(page);
  });

  test("primary nav links reach expected URLs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header[data-nav-interactive]")).toHaveAttribute("data-nav-interactive", "true", {
      timeout: 30_000,
    });

    const mainNav = page.locator("header").getByRole("navigation", { name: "Main" });

    await mainNav.getByRole("link", { name: "Properties", exact: true }).click();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(page.getByRole("main")).toBeVisible();

    await page.goto("/");
    await mainNav.getByRole("link", { name: "Culture Land", exact: true }).click();
    await expect(page).toHaveURL(/\/culture-land$/);
    await expect(page.getByRole("main")).toBeVisible();

    await page.goto("/");
    await mainNav.getByRole("link", { name: "Community", exact: true }).click();
    await expect(page).toHaveURL(/\/community$/);
    await expect(page.getByRole("main")).toBeVisible();

    const financePaths = ["/invest", "/trade", "/portfolio", "/pool", "/stake"];

    for (const path of financePaths) {
      await page.goto("/");
      const financeTrigger = page.getByTestId("nav-finance-trigger");
      await expect(financeTrigger).toBeVisible();
      await financeTrigger.click();
      const financeMenu = page.getByTestId("nav-finance-menu");
      await expect(financeMenu).toBeVisible();
      await financeMenu.locator(`a[href="${path}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${path.replace("?", "\\?")}$`));
      await expect(page.getByRole("main")).toBeVisible();
    }
  });

  test("logo opens immersive story from /mission", async ({ page }) => {
    await page.goto("/mission");
    await page.getByRole("link", { name: /Building Culture/i }).click();
    await expect(page).toHaveURL(/\/experience$/);
  });
});
