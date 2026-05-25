import { expect, test } from "./fixtures/skip-onboarding";

test.describe("onboarding flow", () => {
  test("/join loads with plain-language steps", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByRole("heading", { name: /Create your pass/i })).toBeVisible();
    await expect(page.getByText(/What do you want to do/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Look around/i })).toBeVisible();
  });

  test("back link goes to landing story", async ({ page }) => {
    await page.goto("/join");
    await page.getByRole("link", { name: /Back to the story/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: /We Bring Places Back To Life/i }),
    ).toBeVisible();
  });

  test("intent selection highlights choice", async ({ page }) => {
    await page.goto("/join");
    await page.getByRole("button", { name: /Build/i }).click();
    await expect(page.getByRole("button", { name: /Build/i })).toHaveClass(/C5FF41/);
  });

  test("shows connect hint when wallet not connected", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByText(/Connect your wallet above/i)).toBeVisible();
  });
});
