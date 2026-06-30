import { expect, test } from "@playwright/test";
import { expectMainVisible, skipHomeIntroRedirect } from "../helpers";

test.describe("Homepage editorial portfolio", () => {
  test.beforeEach(async ({ page }) => {
    await skipHomeIntroRedirect(page);
  });

  test("editorial band and featured grid show four curated assets", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectMainVisible(page);

    await expect(page.getByText(/Berggasse flagship \+ three curated Austrian assets/i)).toBeVisible();

    await page.getByRole("heading", { name: /Featured properties/i }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: /Featured properties/i })).toBeVisible();

    const grid = page.locator("#portfolio-grid article");
    await expect(grid).toHaveCount(4);

    await expect(page.getByText(/Berggasse/i).first()).toBeVisible();
    await expect(page.getByText(/Jagdschlossgasse|Jagdschloss/i).first()).toBeVisible();
    await expect(page.getByText(/Keutschach|Water Side/i).first()).toBeVisible();
    await expect(page.getByText(/Bernhardsthal|LandMark/i).first()).toBeVisible();
  });
});
