import { expect, test } from "./fixtures/skip-onboarding";

test.describe("RWA compliance flows", () => {
  test("compliance eligibility API validates wallet", async ({ request }) => {
    const bad = await request.get("/api/compliance/eligibility?wallet=not-a-wallet");
    expect(bad.status()).toBe(400);

    const good = await request.get(
      "/api/compliance/eligibility?wallet=0x0000000000000000000000000000000000000001",
    );
    expect(good.ok()).toBeTruthy();
    const data = (await good.json()) as {
      ok?: boolean;
      wallet?: string;
      chainlink?: { matrixDoc?: string };
    };
    expect(data.ok).toBe(true);
    expect(data.wallet).toBe("0x0000000000000000000000000000000000000001");
    expect(data.chainlink?.matrixDoc).toContain("CHAINLINK");
  });

  test("places portfolio hub loads editorial grid with four properties", async ({ page }) => {
    await page.goto("/places");
    await expect(page.getByRole("heading", { name: /Own heritage/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Berggasse flagship/i })).toBeVisible();
    await expect(page.getByText(/Chainlink RWA alignment/i).first()).toBeVisible();

    const grid = page.locator("#portfolio-grid article");
    await expect(grid).toHaveCount(4);
    await expect(page.getByText(/Berggasse/i).first()).toBeVisible();
    await expect(page.getByText(/Jagdschlossgasse|Jagdschloss/i).first()).toBeVisible();
  });

  test("places Berggasse card links to property detail", async ({ page }) => {
    await page.goto("/places");
    await page.locator("#portfolio-grid article").first().click();
    await expect(page).toHaveURL(/\/places\/properties\/1$/);
    await expect(page.getByRole("heading", { name: /Berggasse/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /REOC metadata JSON/i })).toBeVisible();
    await expect(page.getByText(/Chainlink RWA alignment/i).first()).toBeVisible();
  });

  test("investors page shows Chainlink compliance strip", async ({ page }) => {
    await page.goto("/investors");
    await expect(page.getByText(/Chainlink RWA alignment/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Places transparency/i })).toBeVisible();
  });
});
