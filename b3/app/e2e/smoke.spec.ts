import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("bc_elias_onboarding_v1", "done");
    });
  });

  test("home loads landing story", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /We Bring Places Back To Life/i }),
    ).toBeVisible();
  });

  test("play drops home loads", async ({ page }) => {
    await page.goto("/play");
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

  test("presale loads", async ({ page }) => {
    await page.goto("/presale");
    await expect(page.locator("body")).toBeVisible();
  });

  test("mission loads", async ({ page }) => {
    await page.goto("/mission");
    await expect(page.locator("body")).toBeVisible();
  });

  test("agent fleet loads", async ({ page }) => {
    await page.goto("/agent-fleet");
    await expect(page.locator("body")).toBeVisible();
  });

  test("faq loads", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("body")).toBeVisible();
  });

  test("about loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("body")).toBeVisible();
  });

  test("guide loads", async ({ page }) => {
    await page.goto("/guide");
    await expect(page.locator("body")).toBeVisible();
  });

  test("elias loads", async ({ page }) => {
    await page.goto("/elias");
    await expect(page.locator("body")).toBeVisible();
  });

  test("docs index loads", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator("body")).toBeVisible();
  });

  test("sitemap.xml returns urls", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const xml = await res.text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<loc>");
    expect(xml).toMatch(/\/faq|\/presale|\/mission/);
  });

  test("robots.txt allows crawling", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const txt = await res.text();
    expect(txt.toLowerCase()).toContain("user-agent");
    expect(txt).toContain("sitemap");
  });

  test("world wallet nonce endpoint", async ({ request }) => {
    const res = await request.get("/api/world/wallet-nonce");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { nonce?: string };
    expect(json.nonce).toBeTruthy();
    expect(String(json.nonce).length).toBeGreaterThanOrEqual(8);
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
    expect(json.miniapp?.homeUrl).toMatch(/\/$/);
  });

  test("welcome redirects to landing", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: /We Bring Places Back To Life/i }),
    ).toBeVisible();
  });

  test("join loads", async ({ page }) => {
    await page.goto("/join");
    await expect(page.locator("body")).toBeVisible();
  });

  test("forest community hub loads", async ({ page }) => {
    await page.goto("/forest");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Built by people/i })).toBeVisible();
  });

  test("culture pulse signal loads", async ({ page }) => {
    await page.goto("/signal");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Culture Pulse/i })).toBeVisible();
  });

  test("pulse metrics API", async ({ request }) => {
    const res = await request.get("/api/pulse/metrics");
    expect([200, 404, 503]).toContain(res.status());
  });

  test("pulse comment requires SIWE", async ({ request }) => {
    const res = await request.post("/api/pulse/feed/fake-id/comments", {
      data: { body: "hi" },
    });
    expect([400, 401, 404, 503]).toContain(res.status());
  });

  test("activity log rejects unauthenticated writes", async ({ request }) => {
    const missing = await request.post("/api/activity/log", {
      data: {
        address: "0x0000000000000000000000000000000000000001",
        type: "smoke_test",
      },
    });
    expect([400, 401, 503]).toContain(missing.status());

    const badSig = await request.post("/api/activity/log", {
      data: {
        address: "0x0000000000000000000000000000000000000001",
        type: "smoke_test",
        message: "not-a-valid-siwe-message",
        signature: "0x" + "00".repeat(65),
      },
    });
    expect([401, 503]).toContain(badSig.status());
  });

  test("waitlist rejects oversized payload", async ({ request }) => {
    const res = await request.post("/api/platform/waitlist", {
      data: { email: "a@b.com", name: "x".repeat(20_000) },
    });
    expect(res.status()).toBe(413);
  });

  test("platform siwe nonce", async ({ request }) => {
    const res = await request.get("/api/platform/siwe-nonce");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { nonce?: string };
    expect(json.nonce?.length).toBeGreaterThanOrEqual(8);
  });

  test("agent.json monetization card", async ({ request }) => {
    const res = await request.get("/.well-known/agent.json");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      schema_version?: string;
      resources?: Array<{ protocol?: string; url?: string }>;
      deeplinks?: { presale?: string };
    };
    expect(json.schema_version).toBeTruthy();
    expect(
      json.resources?.some((r) => r.protocol === "x402" && r.url?.includes("/api/x402/premium")),
    ).toBeTruthy();
    expect(json.deeplinks?.presale).toContain("/presale");
  });
});
