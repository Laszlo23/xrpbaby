import { expect, test } from "../fixtures/skip-onboarding";

test.describe("profile hub flow", () => {
  test("profile page shell", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("body")).toContainText(/profile|culture|points|wallet/i);
  });

  test("leaderboard API", async ({ request }) => {
    const res = await request.get("/api/member/leaderboard?limit=5");
    expect(res.status()).toBeLessThan(500);
  });
});
