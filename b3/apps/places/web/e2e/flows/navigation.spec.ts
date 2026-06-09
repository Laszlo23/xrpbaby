import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

test.describe("Desktop header navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await skipHomeIntroRedirect(page);
  });

  test("primary nav links reach expected URLs", async ({ page }) => {
    const routes = [
      "/marketplace",
      "/culture-land",
      "/community",
      "/invest",
      "/trade",
      "/dashboard",
      "/pool",
      "/stake",
    ];

    for (const path of routes) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${path.replace("?", "\\?")}$`));
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("header").getByRole("navigation", { name: "Main" })).toBeVisible();
    }
  });

  test("header exposes primary destinations", async ({ page }) => {
    await page.goto("/");
    const mainNav = page.locator("header").getByRole("navigation", { name: "Main" });
    for (const label of ["Marketplace", "Culture Land", "Community"]) {
      await expect(mainNav.getByRole("link", { name: label, exact: true })).toBeVisible({
        timeout: 30_000,
      });
    }
  });

  test("logo opens immersive story from /mission", async ({ page }) => {
    await page.goto("/mission");
    await page.getByRole("link", { name: /Building Culture/i }).click();
    await expect(page).toHaveURL(/\/experience$/);
  });
});
