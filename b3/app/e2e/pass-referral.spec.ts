import { expect, test } from "./fixtures/skip-onboarding";

test.describe("pass referral gating", () => {
  test("/pass?ref=BUILD77 prefills referral code", async ({ page }) => {
    await page.goto("/pass?ref=BUILD77");
    await expect(page.getByTestId("referral-code-input")).toHaveValue("BUILD77");
  });

  test("3-char name shows reserved message and disables mint", async ({ page }) => {
    await page.goto("/pass?ref=BUILD77");
    const input = page.getByPlaceholder("yourname");
    await input.fill("abc");
    await expect(page.getByText(/reserved for team/i)).toBeVisible();
    const mintBtn = page.getByRole("button", { name: /mint identity|connect wallet|sign in/i });
    await expect(mintBtn).toBeDisabled();
  });

  test("4-char name keeps mint gated until referral validates", async ({ page }) => {
    await page.goto("/pass?ref=BUILD77");
    await page.getByPlaceholder("yourname").fill("abcd");
    await expect(page.getByTestId("referral-code-input")).toHaveValue("BUILD77");
    const mintBtn = page.getByRole("button", { name: /mint identity|connect wallet|sign in/i });
    await expect(mintBtn).toBeVisible();
  });
});

test.describe("referral validate API", () => {
  test("returns 400 for reserved 3-char handle policy", async ({ request }) => {
    const params = new URLSearchParams({
      code: "BUILD77",
      wallet: "0x0000000000000000000000000000000000000001",
      handle: "abc",
    });
    const res = await request.get(`/api/identity/referral/validate?${params}`);
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { ok?: boolean; error?: string };
    expect(json.ok).not.toBe(true);
    expect(json.error).toBe("reserved_team");
  });

  test("returns error for missing params", async ({ request }) => {
    const res = await request.get("/api/identity/referral/validate?code=BUILD77");
    expect(res.status()).toBe(400);
  });
});
