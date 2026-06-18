import { expect, test } from "../fixtures/skip-onboarding";

test.describe("treasury dashboard flow", () => {
  test("bcc metrics API", async ({ request }) => {
    const res = await request.get("/api/bcc/metrics");
    expect(res.status()).toBeLessThan(500);
  });

  test("dashboard shows revenue buckets", async ({ page }) => {
    await page.goto("/bcc/dashboard");
    await expect(page.getByText(/40%|Treasury|Buyback|Builders|Burn/i).first()).toBeVisible();
  });
});
