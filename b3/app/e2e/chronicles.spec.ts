import { expect, test } from "./fixtures/skip-onboarding";

test.describe("culture chronicles", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("bc_elias_onboarding_v1", "done");
    });
  });

  test("chronicles index loads with chapter map", async ({ page }) => {
    await page.goto("/chronicles");
    await expect(page.getByRole("heading", { name: /Culture Chronicles/i })).toBeVisible();
    await expect(page.getByText(/Chapter map/i)).toBeVisible();
    await expect(page.getByText(/Ch 1/i).first()).toBeVisible();
  });

  test("chapter 1 story and mint panel render", async ({ page }) => {
    await page.goto("/chronicles/ch-01");
    await expect(page.getByRole("heading", { name: /The Feed Explained/i }).first()).toBeVisible();
    await expect(page.getByText(/Mint chapter|Mint opening soon/i).first()).toBeVisible();
  });

  test("chronicles SSR includes title", async ({ request }) => {
    const res = await request.get("/chronicles");
    expect(res.ok()).toBeTruthy();
    const html = await res.text();
    expect(html).toMatch(/Culture Chronicles/i);
  });

  test("identity chip visible on chronicles", async ({ page }) => {
    await page.goto("/chronicles");
    await expect(page.getByRole("link", { name: /Claim \.culture/i }).first()).toBeVisible();
  });

  test("identity chip visible on profile", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("link", { name: /Claim \.culture/i }).first()).toBeVisible();
  });
});
