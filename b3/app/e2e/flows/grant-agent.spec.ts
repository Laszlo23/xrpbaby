import { expect, test } from "../fixtures/skip-onboarding";

test.describe("grant agent flow", () => {
  test("agent-os grant panel section", async ({ page }) => {
    await page.goto("/agent-os");
    await expect(page.getByText(/grant agent|grant brief/i).first()).toBeVisible();
  });

  test("grant API rejects without valid payment", async ({ request }) => {
    const res = await request.post("/api/agents/grant", {
      data: {
        brief: "Community housing project seeking ecosystem grant alignment and proof.",
        txHash: "0x" + "a".repeat(64),
        walletAddress: "0x" + "b".repeat(40),
      },
    });
    expect([400, 402, 503, 409]).toContain(res.status());
  });
});
