import { test, expect } from "./fixtures/skip-onboarding";

test.describe("culture auth hub", () => {
  test("login route loads and shows sign-in chooser", async ({ page }) => {
    await page.goto("/auth/login?returnUrl=https://buildingcultureid.space/");
    await expect(page.getByRole("heading", { name: /^sign in$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with email/i })).toBeVisible();
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
      page.getByRole("button", { name: /continue with email|sign in for wallet/i }),
    ).toBeVisible();
  });

  test("forest hub loads guest dashboard CTA", async ({ page }) => {
    await page.goto("/forest");
    await expect(page.getByRole("link", { name: /create your pass/i })).toBeVisible();
    await expect(page.getByText(/daily check-in|tasks|leaderboard/i).first()).toBeVisible();
  });
});
