import { expect, test } from "../fixtures/skip-onboarding";

test.describe("credentials center", () => {
  test("credentials catalog page loads", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByRole("heading", { name: /Verifiable proof/i })).toBeVisible();
    await expect(page.getByText(/Builder Credential/i)).toBeVisible();
  });

  test("credentials catalog API", async ({ request }) => {
    const res = await request.get("/api/credentials/catalog");
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.catalog)).toBe(true);
  });
});
