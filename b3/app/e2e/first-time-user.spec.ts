import { expect, test } from "./fixtures/skip-onboarding";

test.describe("first-time user journey", () => {
  test("landing prioritizes Claim Culture ID CTA", async ({ page }) => {
    await page.goto("/");
    const claim = page.getByRole("link", { name: /Claim Culture ID/i }).first();
    await expect(claim).toBeVisible();
    await expect(claim).toHaveClass(/C5FF41/);
  });

  test("welcome tour shows three steps", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page.getByRole("heading", { name: /Start with/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Join free/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Play/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Culture pass/i })).toBeVisible();
  });

  test("join page links to pass and forest hub", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByRole("link", { name: /\.culture name/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to your community hub/i })).toHaveAttribute(
      "href",
      /\/forest/,
    );
  });

  test("forest shows getting started checklist", async ({ page }) => {
    await page.goto("/forest?welcome=1");
    await expect(page.getByRole("heading", { name: /Your first \d+ steps/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Play/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to profile/i })).toBeVisible();
  });

  test("play → profile shows guest progression shell", async ({ page }) => {
    await page.goto("/play");
    await expect(page.locator(".nav-dock")).toBeVisible();
    await page
      .locator(".nav-dock")
      .getByRole("link", { name: /^Profile$/i })
      .click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole("heading", { name: /Your builder profile/i })).toBeVisible();
    await expect(page.getByText(/Culture Points/i).first()).toBeVisible();
  });

  test("token home on mission page", async ({ page }) => {
    await page.goto("/mission#token-home");
    await expect(page.getByText(/TOKEN HOME/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Culture packs/i })).toBeVisible();
  });

  test("/bcc redirects to mission token home", async ({ page }) => {
    await page.goto("/bcc");
    await expect(page).toHaveURL(/\/mission#token-home/);
  });

  test("ecosystem page highlights claim path", async ({ page }) => {
    await page.goto("/ecosystem");
    await expect(page.getByRole("heading", { name: /Building Culture ecosystem/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Claim Culture ID/i }).first()).toBeVisible();
  });
});
