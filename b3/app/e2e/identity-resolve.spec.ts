import { expect, test } from "./fixtures/skip-onboarding";

test.describe("culture name resolution", () => {
  test("gateway redirects to profile", async ({ page }) => {
    await page.goto("/n/testname.culture");
    await expect(page).toHaveURL(/\/id\/testname\.culture/);
  });

  test("resolve API returns JSON", async ({ request }) => {
    const res = await request.get("/api/identity/resolve?name=testname.culture");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { ok?: boolean; status?: string };
    expect(data.ok).toBe(true);
    expect(["available", "claimed", "invalid", "unconfigured"]).toContain(data.status);
  });

  test("profile page loads for available name", async ({ page }) => {
    await page.goto("/id/availablezzz999.culture");
    await expect(page.getByRole("heading", { name: /availablezzz999\.culture/i })).toBeVisible();
    await expect(page.locator("p.mono-label", { hasText: "AVAILABLE" })).toBeVisible();
    await expect(page.getByRole("link", { name: /mint this name/i })).toBeVisible();
  });
});
