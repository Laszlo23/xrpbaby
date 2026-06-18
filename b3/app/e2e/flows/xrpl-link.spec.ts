import { expect, test } from "../fixtures/skip-onboarding";

test.describe("XRPL Culture ID link", () => {
  test("credentials page shows XRPL link section", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByRole("heading", { name: /Link XRPL wallet/i })).toBeVisible();
    await expect(page.locator("#xrpl-link")).toBeVisible();
  });

  test("identity sync API rejects missing body", async ({ request }) => {
    const res = await request.post("/api/credentials/identity/sync", {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("xrpl challenge API rejects missing SIWE", async ({ request }) => {
    const res = await request.post("/api/credentials/xrpl/challenge", {
      data: { handle: "test.culture" },
    });
    expect(res.status()).toBe(400);
  });

  test("xrpl link API rejects missing fields", async ({ request }) => {
    const res = await request.post("/api/credentials/xrpl/link", {
      data: { handle: "test.culture" },
    });
    expect(res.status()).toBe(400);
  });
});
