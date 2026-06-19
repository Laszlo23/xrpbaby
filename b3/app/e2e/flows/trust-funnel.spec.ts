import { expect, test } from "../fixtures/skip-onboarding";

test.describe("trust-layer funnel", () => {
  test("landing hero guides to claim, credentials, and join", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Who are you/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Claim Culture ID/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore credentials/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Join Building Culture/i }).first()).toBeVisible();
  });

  test("join surfaces wallet path and forest link", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByRole("link", { name: /Go to your community hub/i })).toHaveAttribute(
      "href",
      /\/forest/,
    );
    await expect(
      page.getByRole("button", { name: /sign in for wallet|connect wallet/i }).first(),
    ).toBeVisible();
  });

  test("forest welcome checklist and play CTA", async ({ page }) => {
    await page.goto("/forest?welcome=1");
    await expect(page.getByRole("heading", { name: /Your first \d+ steps/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Play/i }).first()).toBeVisible();
  });

  test("play has nav dock and reward surfaces", async ({ page }) => {
    await page.goto("/play");
    await expect(page.locator(".nav-dock")).toBeVisible();
    await expect(page.locator("[data-sonner-toaster], .sonner-toaster").first()).toBeAttached();
  });

  test("profile guest shows connect path", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /Your builder profile/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in for wallet|connect wallet/i }).first(),
    ).toBeVisible();
  });

  test("credentials center shows progress section and catalog", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByRole("heading", { name: /Verifiable proof/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Claim Culture ID/i }).first()).toBeVisible();
    await expect(page.getByText(/How credentials work/i)).toBeVisible();
  });

  test("ecosystem directory links to core apps", async ({ page }) => {
    await page.goto("/ecosystem");
    await expect(page.getByRole("heading", { name: /Building Culture ecosystem/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Claim Culture ID/i }).first()).toBeVisible();
  });
});
