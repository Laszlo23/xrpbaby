import { expect, test } from "./fixtures/skip-onboarding";

test.describe("culture pulse signal", () => {
  test("Culture Pulse heading visible", async ({ page }) => {
    await page.goto("/signal");
    await expect(page.getByRole("heading", { name: /Culture Pulse/i })).toBeVisible();
  });

  test("page loads metrics or graceful empty state", async ({ page }) => {
    await page.goto("/signal");
    await expect(page.locator("body")).toBeVisible();
    const hasFeed = await page.getByText(/feed|stream|pulse|metrics/i).count();
    expect(hasFeed).toBeGreaterThan(0);
  });
});
