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
    expect(res.status()).toBe(401);
  });

  test("wallet logout API rejects missing token", async ({ request }) => {
    const res = await request.post("/api/wallet/logout");
    expect(res.status()).toBe(401);
  });

  test("pass page uses privy sign-in when VITE_PRIVY_APP_ID is set", async ({ page }) => {
    await page.goto("/pass");
    const privyId = process.env.VITE_PRIVY_APP_ID?.trim();
    if (privyId) {
      await expect(page.getByRole("button", { name: /sign in for wallet/i })).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
    }
  });
});
