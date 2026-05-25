import { expect, test } from "./fixtures/skip-onboarding";

test.describe("RWA compliance flows", () => {
  test("compliance eligibility API validates wallet", async ({ request }) => {
    const bad = await request.get("/api/compliance/eligibility?wallet=not-a-wallet");
    expect(bad.status()).toBe(400);

    const good = await request.get(
      "/api/compliance/eligibility?wallet=0x0000000000000000000000000000000000000001",
    );
    expect(good.ok()).toBeTruthy();
    const data = (await good.json()) as { ok?: boolean; wallet?: string; chainlink?: { matrixDoc?: string } };
    expect(data.ok).toBe(true);
    expect(data.wallet).toBe("0x0000000000000000000000000000000000000001");
    expect(data.chainlink?.matrixDoc).toContain("CHAINLINK");
  });

  test("places hub loads with invest links", async ({ page }) => {
    await page.goto("/places");
    await expect(page.getByRole("heading", { name: /^Places$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Invest on Places/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Transparency/i })).toBeVisible();
  });

  test("investors page shows Chainlink compliance strip", async ({ page }) => {
    await page.goto("/investors");
    await expect(page.getByText(/Chainlink RWA alignment/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Places transparency/i })).toBeVisible();
  });
});
