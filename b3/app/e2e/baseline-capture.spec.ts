import { expect, test } from "./fixtures/skip-onboarding";

/** Mirrors paths in route-matrix.json — visits each to validate console gate baseline. */
const BASELINE_ROUTES = [
  "/",
  "/welcome",
  "/join",
  "/forest",
  "/play",
  "/profile",
  "/pass",
  "/credentials",
  "/ecosystem",
  "/agent-os",
  "/signal",
  "/chronicles",
  "/hq",
  "/triple-333",
  "/marketplace",
  "/id/laszlo.culture",
  "/investors",
] as const;

test.describe("baseline route capture", () => {
  for (const path of BASELINE_ROUTES) {
    test(`loads ${path} without browser errors`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
      await page.waitForTimeout(800);
    });
  }
});
