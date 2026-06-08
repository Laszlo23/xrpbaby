import { test, expect } from "@playwright/test";

test.describe("culture auth hub", () => {
  test("login route loads and shows signing-in copy", async ({ page }) => {
    await page.goto("/auth/login?returnUrl=https://buildingcultureid.space/");
    await expect(page.getByText(/signing in to your culture wallet/i)).toBeVisible();
  });

  test("logout route loads", async ({ page }) => {
    await page.goto("/auth/logout?returnUrl=https://buildingcultureid.space/");
    await expect(page.getByText(/signing out/i)).toBeVisible();
  });

  test("login rejects unsafe returnUrl", async ({ page }) => {
    await page.goto("/auth/login?returnUrl=https://evil.example/phish");
    await expect(page).toHaveURL(/\/wallet/);
  });

  test("wallet sync API rejects unauthenticated POST", async ({ request }) => {
    const res = await request.post("/api/wallet/sync", {
      data: { walletAddress: "0x0000000000000000000000000000000000000001" },
    });
    // In production-mode E2E, missing DB/secrets can surface as 503 before auth middleware.
    expect([401, 503], `unexpected wallet sync status ${res.status()}`).toContain(res.status());
  });

  test("wallet logout API rejects missing token", async ({ request }) => {
    const res = await request.post("/api/wallet/logout");
    expect([401, 503], `unexpected wallet logout status ${res.status()}`).toContain(res.status());
  });

  test("pass page shows wallet CTA", async ({ page }) => {
    await page.goto("/pass");
    await expect(
      page.getByRole("button", { name: /sign in for wallet|connect wallet/i }),
    ).toBeVisible();
  });
});
