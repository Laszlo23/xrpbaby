import { expect, test } from "./fixtures/skip-onboarding";
import { postWaitlist } from "./fixtures/api-helpers";

test.describe("landing flow", () => {
  test("hero and primary CTAs visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Who are you/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Join free/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /See what we build/i }).first()).toBeVisible();
  });

  test("join CTA navigates to /join", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Join free/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/join$/);
    await expect(page.getByRole("heading", { name: /Create your pass/i })).toBeVisible();
  });

  test("ecosystem section has in-app links", async ({ page }) => {
    await page.goto("/#ecosystem");
    await expect(page.locator("#ecosystem")).toBeVisible();
    await expect(page.locator('#ecosystem a[href="/play"]').first()).toBeVisible();
  });

  test("ecosystem map visible below hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#map")).toBeVisible();
    await expect(page.getByTestId("ecosystem-pillar-identity")).toBeVisible();
  });

  test("waitlist accepts valid email via API", async ({ request }) => {
    const email = `e2e-${Date.now()}@example.com`;
    const res = await postWaitlist(request, { email, source: "e2e_landing" });
    expect([200, 503]).toContain(res.status());
    if (res.status() === 200) {
      const json = (await res.json()) as { ok?: boolean };
      expect(json.ok).toBe(true);
    }
  });

  test("waitlist form shows validation for bad email", async ({ page }) => {
    await page.goto("/#join");
    const joinSection = page.locator("#join");
    await joinSection.waitFor({ state: "visible", timeout: 15_000 });
    await joinSection.scrollIntoViewIfNeeded();
    const input = page.locator("#join").getByPlaceholder(/your@email.com/i);
    await input.fill("not-an-email");
    await page
      .locator("#join")
      .getByRole("button", { name: /Email updates/i })
      .click();
    await expect(page.locator("#join").getByText(/valid email/i)).toBeVisible();
  });

  test("culture layer explorer shows sub-items and navigates", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Who are you/i }),
    ).toBeVisible();

    const cultureSection = page.locator("#culture");
    await cultureSection.scrollIntoViewIfNeeded();
    await expect(cultureSection).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("culture-panel-community")).toBeVisible();
    await expect(page.getByTestId("culture-subitem-people")).toBeVisible();

    await page.getByTestId("culture-layer-capital").click();
    await expect(page.getByTestId("culture-panel-capital")).toBeVisible();
    await expect(page.getByTestId("culture-subitem-bcc-token")).toBeVisible();

    await page.getByTestId("culture-layer-agents").click();
    await expect(page.getByTestId("culture-subitem-research-agent")).toBeVisible();

    await page.getByTestId("culture-subitem-people").click();
    await expect(page).toHaveURL(/\/team$/);
  });
});
