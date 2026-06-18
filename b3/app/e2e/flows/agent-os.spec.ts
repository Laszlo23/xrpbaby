import { expect, test } from "../fixtures/skip-onboarding";

test.describe("agent os flow", () => {
  test("agent-os catalog loads", async ({ page }) => {
    await page.goto("/agent-os");
    await expect(page.getByRole("heading", { name: /agent/i }).first()).toBeVisible();
  });

  test("limx revenue agent panel visible", async ({ page }) => {
    await page.goto("/agent-os#limx-agent");
    await expect(page.getByRole("heading", { name: /Limx Revenue Agent/i })).toBeVisible();
  });

  test("agents access API tier shape", async ({ request }) => {
    const res = await request.get(
      "/api/agents/access?address=0x0000000000000000000000000000000000000001",
    );
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json).toHaveProperty("ok");
  });
});
