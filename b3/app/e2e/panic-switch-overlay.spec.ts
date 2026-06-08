import { expect, test } from "./fixtures/skip-onboarding";

test.describe("panic switch overlay", () => {
  test("persists across routes and completes active + endurance phases", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "panic_switch_debug_v1",
        JSON.stringify({
          cycleMs: 2200,
          warningLeadMs: 1100,
          graceMs: 500,
          requiredCycles: 2,
          enduranceMs: 2200,
          precisionTargetMs: 1700,
          maxPrecisionDeviationMs: 2000,
        }),
      );
      if (!sessionStorage.getItem("panic_switch_e2e_seeded")) {
        localStorage.removeItem("bc_panic_switch_v1");
        sessionStorage.setItem("panic_switch_e2e_seeded", "1");
      }
    });

    await page.goto("/play");
    await page.getByRole("button", { name: /open panic switch/i }).click();
    const armButton = page.getByRole("button", { name: /arm panic switch/i });
    await expect(armButton).toBeVisible();
    await armButton.click();

    for (let i = 0; i < 2; i += 1) {
      const resetButton = page.getByRole("button", { name: /reset now/i });
      await expect(resetButton).toBeVisible({ timeout: 4_000 });
      await resetButton.click();
    }

    await expect(page.getByText(/endurance target|full run completed/i)).toBeVisible();
    await page.goto("/forest");
    await page.getByRole("button", { name: /open panic switch/i }).click();
    await expect(page.getByText(/endurance target|full run completed/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /endurance running|restart run/i }),
    ).toBeVisible();

    await expect(page.getByText(/full run completed/i)).toBeVisible({ timeout: 7_000 });
  });
});
