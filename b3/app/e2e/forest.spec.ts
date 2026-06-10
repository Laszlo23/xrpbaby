import { expect, test } from "./fixtures/skip-onboarding";

test.describe("forest community hub", () => {
  test("hub hero and stats section", async ({ page }) => {
    await page.goto("/forest");
    await expect(page.getByRole("heading", { name: /Built by people/i })).toBeVisible();
    await expect(page.getByText(/What you can do/i)).toBeVisible();
  });

  test("culture pulse link navigates to signal", async ({ page }) => {
    await page.goto("/forest");
    const pulse = page.getByRole("link", { name: /Community pulse|Culture Pulse/i });
    if (await pulse.count()) {
      await pulse.first().click();
      await expect(page).toHaveURL(/\/signal/);
    } else {
      test.skip();
    }
  });

  test("create pass CTA goes to join", async ({ page }) => {
    await page.goto("/forest");
    await page
      .getByRole("link", { name: /Create your pass/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/join$/);
  });

  test("forest has bottom navigation", async ({ page }) => {
    await page.goto("/forest");
    await expect(page.locator(".nav-dock")).toBeVisible();
  });

  test("forest getting started checklist", async ({ page }) => {
    await page.goto("/forest");
    await expect(page.getByRole("heading", { name: /Your first 3 steps/i })).toBeVisible();
  });
});
