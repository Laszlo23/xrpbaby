import { expect, test } from "./fixtures/skip-onboarding";

test.describe("marketplace merch hardening", () => {
  test("merch hub loads four designs", async ({ page }) => {
    await page.goto("/marketplace/merch");
    await expect(page.getByRole("heading", { name: /Culture merch drop/i })).toBeVisible();
    await expect(page.locator('img[alt*="Building Culture Tee"]')).toHaveCount(4);
  });

  test("product page shows size picker and wallet connect", async ({ page }) => {
    await page.goto("/marketplace/merch/bc-tshirt-1");
    await expect(page.getByRole("heading", { name: /Building Culture Tee I/i })).toBeVisible();
    for (const size of ["S", "M", "L", "XL"]) {
      await expect(page.getByRole("button", { name: size, exact: true })).toBeVisible();
    }
    await expect(page.getByText(/Connect your wallet on Base/i)).toBeVisible();
  });

  test("checkout cancel banner", async ({ page }) => {
    await page.goto("/marketplace/merch/bc-tshirt-1?checkout=cancel");
    await expect(page.getByText(/Checkout cancelled/i)).toBeVisible();
  });

  test("catalog API returns four drops", async ({ request }) => {
    const res = await request.get("/api/marketplace/merch/catalog");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok: boolean; drops: unknown[] };
    expect(json.ok).toBe(true);
    expect(json.drops.length).toBe(4);
  });

  test("ops dashboard requires secret", async ({ request }) => {
    const res = await request.get("/api/marketplace/merch/dashboard");
    expect([401, 503]).toContain(res.status());
  });

  test("checkout requires shipping fields", async ({ request }) => {
    const res = await request.post("/api/marketplace/merch/checkout", {
      data: {
        dropSlug: "bc-tshirt-1",
        size: "M",
        walletAddress: "0x0000000000000000000000000000000000000001",
        paymentRail: "stripe",
        shipping: { name: "", email: "bad", line1: "", city: "", postal: "", country: "" },
      },
    });
    expect(res.status()).toBe(400);
  });

  test("claim API requires SIWE body", async ({ request }) => {
    const res = await request.post("/api/merch/claim", {
      data: { claimCode: "testcode123456" },
    });
    expect(res.status()).toBe(400);
  });

  test("marketplace nav includes Merch pill", async ({ page }) => {
    await page.goto("/marketplace/merch");
    await expect(page.getByRole("link", { name: "Merch" })).toBeVisible();
  });
});
