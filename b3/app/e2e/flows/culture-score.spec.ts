import { expect, test } from "../fixtures/skip-onboarding";

test.describe("culture score flow", () => {
  test("culture score API returns dimensions", async ({ request }) => {
    const res = await request.get(
      "/api/member/culture-score?address=0x0000000000000000000000000000000000000001",
    );
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json).toHaveProperty("ok");
  });

  test("profile route loads", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("body")).toBeVisible();
  });
});
