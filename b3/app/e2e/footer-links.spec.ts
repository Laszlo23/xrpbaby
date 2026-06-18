import { expect, test } from "./fixtures/skip-onboarding";
import {
  footerEcosystemLinks,
  landingFooterCapitalColumn,
  landingFooterCommunityColumn,
  landingFooterEcosystemColumn,
  landingFooterProductColumn,
} from "../src/lib/footer-links";

/** Canonical external URLs from global footer registry (full directory). */
const REGISTRY_EXTERNAL_HREFS = footerEcosystemLinks
  .map((l) => l.href)
  .filter((h) => h.startsWith("http"));

const LANDING_FOCUSED_LINKS = [
  ...landingFooterProductColumn,
  ...landingFooterCommunityColumn,
  ...landingFooterEcosystemColumn,
  ...landingFooterCapitalColumn,
];

test.describe("footer ecosystem links", () => {
  test("landing footer exposes focused product and ecosystem links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").last();
    await expect(footer).toBeVisible();

    for (const link of LANDING_FOCUSED_LINKS) {
      if (link.href.startsWith("http")) continue;
      await expect(footer.locator(`a[href="${link.href}"]`).first()).toBeVisible();
    }

    await expect(footer.getByText("Product")).toBeVisible();
    await expect(footer.getByText("Ecosystem Hub", { exact: true })).toBeVisible();
    await expect(footer.getByText("Culture ID", { exact: true })).toBeVisible();
  });

  test("ecosystem page exposes satellite external hrefs", async ({ page }) => {
    await page.goto("/ecosystem");
    await expect(page.getByRole("heading", { name: /Building Culture ecosystem/i })).toBeVisible();

    for (const href of REGISTRY_EXTERNAL_HREFS) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test("focused AppFooter on /play shows core pillars", async ({ page }) => {
    await page.goto("/play");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();

    await expect(footer.getByText("Culture ID", { exact: true })).toBeVisible();
    await expect(footer.getByText("Credentials", { exact: true })).toBeVisible();
    await expect(footer.getByText("Ecosystem Hub", { exact: true })).toBeVisible();
    await expect(footer.getByText("BCC", { exact: true })).toBeVisible();
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
