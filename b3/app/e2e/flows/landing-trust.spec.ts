import { expect, test } from "../fixtures/skip-onboarding";

test.describe("landing trust narrative", () => {
  test("shows Culture ID example and Access loop", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /What is a Culture ID/i })).toBeVisible();
    await expect(page.getByText("laszlo.culture")).toBeVisible();
    await expect(
      page
        .getByRole("heading", { name: /Culture ID → Credentials → Reputation → Access/i })
        .first(),
    ).toBeVisible();
    await expect(page.getByText("Opportunities", { exact: true })).toHaveCount(0);
  });

  test("ecosystem teaser avoids technical stack copy on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/XRPL handles credentials/i)).toHaveCount(0);
  });

  test("/links redirects to ecosystem directory", async ({ page }) => {
    await page.goto("/links");
    await expect(page).toHaveURL(/\/ecosystem$/);
  });
});
