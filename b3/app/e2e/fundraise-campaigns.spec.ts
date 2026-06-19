import { expect, test } from "./fixtures/skip-onboarding";

test.describe("culture fundraise campaigns", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("bc_elias_onboarding_v1", "done");
    });
  });

  test("HQ fundraise page loads with milestone bar", async ({ page }) => {
    await page.goto("/hq");
    await expect(page.getByText(/Culture HQ · 77777/i)).toBeVisible();
    await expect(page.getByText(/HQ 77777 milestone/i)).toBeVisible();
    await expect(page.getByText(/Pledge tiers/i)).toBeVisible();
  });

  test("Triple 333 page loads with split buckets", async ({ page }) => {
    await page.goto("/triple-333");
    await expect(page.getByRole("heading", { name: /Triple 333/i }).first()).toBeVisible();
    await expect(page.getByText(/AI & servers/i).first()).toBeVisible();
    await expect(page.getByText(/Marketing/i).first()).toBeVisible();
  });

  test("HQ progress API returns shape", async ({ request }) => {
    const res = await request.get("/api/campaign/hq-progress");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean; goalUsd?: number };
    expect(body.ok).toBe(true);
    expect(body.goalUsd).toBe(77_777);
  });
});
