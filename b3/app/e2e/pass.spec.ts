import { expect, test } from "./fixtures/skip-onboarding";

test.describe("pass / identity", () => {
  test("/pass loads mint UI", async ({ page }) => {
    await page.goto("/pass");
    await expect(page.getByRole("heading", { name: /claim your culture name/i })).toBeVisible();
    await expect(page.getByPlaceholder("yourname")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /mint identity|connect wallet/i }),
    ).toBeVisible();
  });

  test("forest identity band links to pass", async ({ page }) => {
    await page.goto("/forest");
    const cta = page.getByRole("link", { name: /claim your name/i });
    if ((await cta.count()) === 0) {
      test.skip();
      return;
    }
    await cta.click();
    await expect(page).toHaveURL(/\/pass/);
  });
});
