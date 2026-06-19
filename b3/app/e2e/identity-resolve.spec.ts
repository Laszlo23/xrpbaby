import { expect, test } from "./fixtures/skip-onboarding";

test.describe("culture name resolution", () => {
  test("gateway redirects to profile", async ({ page }) => {
    await page.goto("/n/testname.culture");
    await expect(page).toHaveURL(/\/id\/testname\.culture/);
  });

  test("resolve API returns JSON", async ({ request }) => {
    const res = await request.get("/api/identity/resolve?name=testname.culture");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { ok?: boolean; status?: string };
    expect(data.ok).toBe(true);
    expect(["available", "claimed", "invalid", "unconfigured"]).toContain(data.status);
  });

  test("profile page loads for available name", async ({ page }) => {
    await page.goto("/id/availablezzz999.culture");
    await expect(page.getByRole("heading", { name: /availablezzz999\.culture/i })).toBeVisible();
    await expect(page.locator("p.mono-label", { hasText: "AVAILABLE" })).toBeVisible();
    await expect(page.getByRole("link", { name: /mint this name/i })).toBeVisible();
  });

  test("founder showcase for laszlo.culture", async ({ page }) => {
    await page.goto("/id/laszlo.culture");
    await expect(page.getByRole("heading", { name: /Building Culture\./i })).toBeVisible();
    await expect(page.getByText("Turning identity into proof.")).toBeVisible();
    await expect(page.getByText("Building Culture Metrics")).toBeVisible();
    await expect(page.getByText("Building Culture Ecosystem")).toBeVisible();
    await expect(page.getByText("Featured Builds")).toBeVisible();
    await expect(page.getByText("Builder Signal")).toBeVisible();
    await expect(page.getByText("Culture Score")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /mint your culture layer identity/i }),
    ).toBeVisible();
  });

  test("graph demo API returns JSON", async ({ request }) => {
    const res = await request.get("/api/identity/graph-demo");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { ok?: boolean; graph?: unknown };
    expect(data.ok).toBe(true);
  });

  test("enrich API validates name param", async ({ request }) => {
    const res = await request.get("/api/identity/enrich");
    expect(res.status()).toBe(400);
  });

  test("landing culture section shows live identity graph", async ({ page }) => {
    await page.goto("/#culture-identity-graph");
    await expect(page.getByText("IDENTITY GRAPH")).toBeVisible();
    await expect(page.getByText("See the graph connect.")).toBeVisible();
    await expect(page.getByText("Identity Graph", { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("laszlo.culture shows identity graph when enrichment available", async ({ page }) => {
    await page.goto("/id/laszlo.culture");
    await expect(page.getByText("Identity Graph", { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("graph demo returns linked identities for default identity", async ({ request }) => {
    const res = await request.get("/api/identity/graph-demo?identity=laszloleonardo.eth");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      ok?: boolean;
      graph?: { graph?: unknown[] };
    };
    expect(data.ok).toBe(true);
    expect((data.graph?.graph?.length ?? 0) > 0).toBeTruthy();
  });
});
