import { expect, test } from "./fixtures/skip-onboarding";

test.describe("PWA installability", () => {
  test("manifest and icons are served", async ({ request }) => {
    const manifestRes = await request.get("/manifest.webmanifest");
    expect(manifestRes.ok()).toBeTruthy();
    const manifest = (await manifestRes.json()) as {
      name: string;
      start_url: string;
      display: string;
      icons: Array<{ src: string; sizes: string }>;
    };
    expect(manifest.name).toBe("Building Culture");
    expect(manifest.start_url).toBe("/join");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    for (const icon of manifest.icons) {
      const iconRes = await request.get(icon.src);
      expect(iconRes.ok(), `icon ${icon.src}`).toBeTruthy();
    }
  });

  test("service worker script is served", async ({ request }) => {
    const swRes = await request.get("/sw.js");
    expect(swRes.ok()).toBeTruthy();
    const body = await swRes.text();
    expect(body).toContain("fetch");
  });

  test("root head includes manifest and apple-mobile meta", async ({ page }) => {
    await page.goto("/join");
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute("href", "/manifest.webmanifest");
    const appleCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleCapable).toHaveAttribute("content", "yes");
    const appleTitle = page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(appleTitle).toHaveAttribute("content", "BuildCulture");
  });

  test("join route is mobile-ready with bottom nav hidden", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/join");
    await expect(page.locator(".nav-dock")).toHaveCount(0);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /viewport-fit=cover/,
    );
  });

  test("forest shows bottom nav on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/forest");
    await expect(page.locator(".nav-dock")).toBeVisible();
  });
});
