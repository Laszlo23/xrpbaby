import { expect, test } from "../fixtures/skip-onboarding";

test.describe("bcc rewards flow", () => {
  test("treasury dashboard loads", async ({ page }) => {
    await page.goto("/bcc/dashboard");
    await expect(page.getByText(/treasury|40|BCC|revenue/i).first()).toBeVisible();
  });

  test("rewards summary API", async ({ request }) => {
    const res = await request.get(
      "/api/rewards/summary?address=0x0000000000000000000000000000000000000001",
    );
    expect(res.status()).toBeLessThan(500);
  });

  test("redeem quote API", async ({ request }) => {
    const res = await request.get(
      "/api/points/redeem/quote?address=0x0000000000000000000000000000000000000001&points=10",
    );
    expect(res.status()).toBeLessThan(500);
  });
});
