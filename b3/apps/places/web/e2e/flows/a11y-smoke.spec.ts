import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

/**
 * Smoke: critical/serious issues inside `<main>` only; color/link-contrast disabled until palette audit.
 * Run: cd web && npx playwright test e2e/flows/a11y-smoke.spec.ts
 */
test.describe("Accessibility smoke (axe)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("home has no critical or serious axe violations", async ({ page }) => {
    await skipHomeIntroRedirect(page);
    await page.goto("/");
    const { violations } = await new AxeBuilder({ page })
      .include("main")
      .disableRules(["color-contrast", "link-in-text-block"])
      .analyze();
    const bad = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(bad.length, JSON.stringify(bad, null, 2)).toBe(0);
  });

  test("properties hub has no critical or serious axe violations", async ({ page }) => {
    await page.goto("/properties");
    const { violations } = await new AxeBuilder({ page })
      .include("main")
      .disableRules(["color-contrast", "link-in-text-block"])
      .analyze();
    const bad = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(bad.length, JSON.stringify(bad, null, 2)).toBe(0);
  });
});
