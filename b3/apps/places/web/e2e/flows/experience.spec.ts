import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

test.describe("/experience interactions", () => {
  test("desktop: story panel and project controls visible", async ({ page }) => {
    await skipHomeIntroRedirect(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/experience");
    await expect(page.getByRole("region", { name: /Story details/i })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Story beats" })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Project indicators" })).toBeVisible();
  });

  test("mobile: hero then open full story", async ({ page }) => {
    await skipHomeIntroRedirect(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/experience");
    const details = page.getByRole("region", { name: "Story details" });
    await expect(details).toBeHidden();
    await page.getByRole("button", { name: /Explore the story/i }).click();
    await expect(details).toBeVisible();
  });

  test("keyboard: ArrowDown advances beat", async ({ page }) => {
    await skipHomeIntroRedirect(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/experience");
    await page.getByRole("region", { name: /Immersive stories/i }).click();
    await page.keyboard.press("ArrowRight");
    const firstTab = page.getByRole("tab", { name: /beat 1 of 4/i }).first();
    await expect(firstTab).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("tab", { name: /beat 2 of 4/i }).first()).toHaveAttribute("aria-selected", "true");
  });
});
