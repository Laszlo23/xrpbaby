import { expect, test } from "../fixtures/skip-onboarding";

test.describe("forest quests flow", () => {
  test("forest quests page loads", async ({ page }) => {
    await page.goto("/forest/quests");
    await expect(page.getByRole("heading", { name: /quest|founding|forest/i }).first()).toBeVisible();
  });

  test("member me API returns shape", async ({ request }) => {
    const res = await request.get("/api/member/me?address=0x0000000000000000000000000000000000000001");
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json).toHaveProperty("ok");
  });
});
