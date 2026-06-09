import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

test.describe("Trade deep links", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("GET /trade?property=1 renders marketplace shell", async ({ page }) => {
    await skipHomeIntroRedirect(page);
    await page.goto("/trade?property=1", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/trade/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("header").getByRole("navigation", { name: "Main" })).toBeVisible();
  });

  /** Finance dropdown navigation is covered in `navigation.spec.ts`. */
});
