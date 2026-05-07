import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("marketplace loads", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page.locator("body")).toBeVisible();
  });

  test("profile loads", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("body")).toBeVisible();
  });

  test("x402 premium OPTIONS", async ({ request }) => {
    const res = await request.fetch("/api/x402/premium", { method: "OPTIONS" });
    expect(res.status()).toBe(204);
  });

  test("farcaster manifest", async ({ request }) => {
    const res = await request.get("/.well-known/farcaster.json");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { miniapp?: { homeUrl?: string } };
    expect(json.miniapp?.homeUrl).toBeTruthy();
  });
});
