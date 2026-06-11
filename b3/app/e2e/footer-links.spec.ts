import { expect, test } from "./fixtures/skip-onboarding";
import {
  footerEcosystemLinks,
  landingFooterEcosystemColumn,
  landingFooterLayersColumn,
} from "../src/lib/footer-links";

/** External ecosystem URLs that must appear in story landing footer. */
const LANDING_EXTERNAL_HREFS = [
  ...landingFooterEcosystemColumn,
  ...landingFooterLayersColumn,
]
  .map((l) => l.href)
  .filter((h) => h.startsWith("http"));

/** Canonical external URLs from global footer registry. */
const REGISTRY_EXTERNAL_HREFS = footerEcosystemLinks
  .map((l) => l.href)
  .filter((h) => h.startsWith("http"));

test.describe("footer ecosystem links", () => {
  test("story landing footer exposes canonical external hrefs", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").last();
    await expect(footer).toBeVisible();

    for (const href of LANDING_EXTERNAL_HREFS) {
      await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    await expect(footer.locator('a[href="https://home.buildingcultureid.space"]').first()).toBeVisible();
    await expect(footer.locator('a[href="https://app.buildingcultureid.space"]').first()).toBeVisible();
  });

  test("landing Home links to home hub not app alias", async ({ page }) => {
    await page.goto("/");
    const homeLink = page.locator('footer a[href="https://home.buildingcultureid.space"]').first();
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toContainText(/Home/i);
  });

  test("product AppFooter registry hrefs match on /play", async ({ page }) => {
    await page.goto("/play");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();

    for (const href of REGISTRY_EXTERNAL_HREFS) {
      await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test("external ecosystem URLs respond on production when checked", async ({ request }) => {
    test.skip(
      !process.env.CI && !process.env.LINK_AUDIT_E2E,
      "Set LINK_AUDIT_E2E=1 to HTTP-check external links in e2e",
    );

    const strictSatellites = process.env.LINK_AUDIT_STRICT_SATELLITES !== "0";
    const satelliteHosts = new Set([
      "wohnai.buildingcultureid.space",
      "ankommen.buildingcultureid.space",
      "forkids.buildingcultureid.space",
    ]);

    for (const href of REGISTRY_EXTERNAL_HREFS) {
      const host = new URL(href).hostname;
      const res = await request.head(href, { maxRedirects: 5, timeout: 20_000 }).catch(() => null);
      if (!res) {
        if (satelliteHosts.has(host) && !strictSatellites) continue;
        throw new Error(`Unreachable: ${href}`);
      }
      expect(res.status(), href).toBeLessThan(400);
    }
  });
});
