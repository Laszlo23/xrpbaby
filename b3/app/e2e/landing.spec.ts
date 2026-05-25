import { expect, test } from "./fixtures/skip-onboarding";
import { postWaitlist } from "./fixtures/api-helpers";

test.describe("landing flow", () => {
  test("hero and primary CTAs visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /We Bring Places Back To Life/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Join free/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /See what we build/i }).first()).toBeVisible();
  });

  test("join CTA navigates to /join", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Join free/i }).first().click();
    await expect(page).toHaveURL(/\/join$/);
    await expect(page.getByRole("heading", { name: /Create your pass/i })).toBeVisible();
  });

  test("ecosystem section has in-app links", async ({ page }) => {
    await page.goto("/#ecosystem");
    await expect(page.locator("#ecosystem")).toBeVisible();
    await expect(page.locator('#ecosystem a[href="/play"]').first()).toBeVisible();
  });

  test("waitlist accepts valid email via API", async ({ request }) => {
    const email = `e2e-${Date.now()}@example.com`;
    const res = await postWaitlist(request, { email, source: "e2e_landing" });
    expect([200, 503]).toContain(res.status());
    if (res.status() === 200) {
      const json = (await res.json()) as { ok?: boolean };
      expect(json.ok).toBe(true);
    }
  });

  test("waitlist form shows validation for bad email", async ({ page }) => {
    await page.goto("/#join");
    await page.locator("#join").scrollIntoViewIfNeeded();
    const input = page.locator("#join").getByPlaceholder(/your@email.com/i);
    await input.fill("not-an-email");
    await page.locator("#join").getByRole("button", { name: /Email updates/i }).click();
    await expect(page.locator("#join").getByText(/valid email/i)).toBeVisible();
  });
});
