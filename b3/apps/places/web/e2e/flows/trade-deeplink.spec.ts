import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

test.describe("Trade deep links", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("GET /trade?property=1 renders marketplace shell", async ({ page }) => {
    await skipHomeIntroRedirect(page);
    await page.goto("/trade?property=1", { waitUntil: "load" });
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trade", exact: true })).toBeVisible();
  });

  /** Finance dropdown navigation is covered in `navigation.spec.ts`. */
});
