import { expect, test } from "../fixtures/skip-onboarding";

test.describe("culture power", () => {
  test("culture-power API returns shape when disabled or enabled", async ({ request }) => {
    const addr = "0x0000000000000000000000000000000000000001";
    const res = await request.get(`/api/member/culture-power?address=${addr}`);
    expect(res.status()).toBe(200);
    const json = (await res.json()) as {
      ok?: boolean;
      enabled?: boolean;
      power?: { score: number; multiplierLabel: string; dimensions: unknown[] };
    };
    expect(json.ok).toBe(true);
    if (json.enabled && json.power) {
      expect(json.power.score).toBeGreaterThanOrEqual(0);
      expect(json.power.multiplierLabel).toMatch(/×$/);
    }
  });

  test("profile shows reactor when power flag enabled", async ({ page }) => {
    await page.goto("/profile");
    const reactor = page.getByTestId("culture-power-reactor");
    const count = await reactor.count();
    if (count > 0) {
      await expect(reactor.first()).toBeVisible();
    } else {
      await expect(page.getByText(/culture score|connect wallet/i).first()).toBeVisible();
    }
  });
});
