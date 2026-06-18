import { expect, test } from "../fixtures/skip-onboarding";

test.describe("investors transparency", () => {
  test("investors page shows capital rails and treasury section", async ({ page }) => {
    await page.goto("/investors");
    await expect(page.getByRole("heading", { name: /Capital rails/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Published treasury wallets/i })).toBeVisible();
  });

  test("treasury balances API", async ({ request }) => {
    const res = await request.get("/api/investors/treasury-balances");
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.wallets)).toBe(true);
  });

  test("xrpl intake API", async ({ request }) => {
    const res = await request.get("/api/investors/xrpl-intake");
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
