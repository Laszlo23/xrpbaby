import { expect, test } from "./fixtures/skip-onboarding";

test.describe("Builder Tapes", () => {
  test("hub loads logged out", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/stories/tapes");
    await expect(page.getByRole("heading", { name: "Builder Tapes" })).toBeVisible();
    await expect(page.getByText("Dial-Up Whispers")).toBeVisible();
    await expect(page.getByText("Builders Inherit")).toBeVisible();
    await expect(page.getByText(/0\/5 episodes credited/i)).toBeVisible();

    const wagmiFatals = consoleErrors.filter(
      (e) => e.includes("WagmiProvider") || e.includes("useConfig"),
    );
    expect(wagmiFatals).toEqual([]);
  });

  test("episode page loads logged out", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/stories/tapes/dial-up-whispers", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Dial-Up Whispers" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("audio")).toHaveAttribute(
      "src",
      /\/api\/media\/builder-tapes\/Dial-Up/,
    );
    await expect(page.getByText(/Connect wallet after load|Listen to 80%/i)).toBeVisible();
    await expect(page.getByText("Share this tape")).toBeVisible();

    const wagmiFatals = consoleErrors.filter(
      (e) => e.includes("WagmiProvider") || e.includes("useConfig"),
    );
    expect(wagmiFatals).toEqual([]);
  });

  test("story page links to Builder Tapes", async ({ page }) => {
    await page.goto("/story");
    await expect(page.getByRole("link", { name: /Open Builder Tapes/i })).toBeVisible();
  });

  test("chronicles cross-link to Builder Tapes", async ({ page }) => {
    await page.goto("/chronicles");
    await expect(page.getByRole("link", { name: /Hear Laszlo/i })).toBeVisible();

    await page.goto("/chronicles/ch-01");
    await expect(page.getByText("Real life behind this chapter")).toBeVisible();
    await expect(page.getByRole("link", { name: /Dial-Up Whispers/i })).toBeVisible();
  });

  test("connect promo visible logged out", async ({ page }) => {
    await page.goto("/connect");
    await expect(page.getByText("Builder Tapes")).toBeVisible();
    await expect(page.getByText(/5 real stories/i)).toBeVisible();
  });

  test("SSR returns 200 for tapes hub", async ({ request }) => {
    const res = await request.get("/stories/tapes");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain("Builder Tapes");
  });
});
