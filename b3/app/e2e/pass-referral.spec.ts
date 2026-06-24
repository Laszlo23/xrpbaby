import { expect, test } from "./fixtures/skip-onboarding";

const LAUNCH_CODE = "USHINE77";

test.describe("pass referral gating", () => {
  test("/pass?ref=USHINE77 prefills referral code", async ({ page }) => {
    await page.goto(`/pass?ref=${LAUNCH_CODE}`);
    await expect(page.getByTestId("referral-code-input")).toHaveValue(LAUNCH_CODE);
  });

  test("3-char name shows reserved message and disables mint", async ({ page }) => {
    await page.goto(`/pass?ref=${LAUNCH_CODE}`);
    const input = page.getByPlaceholder("yourname");
    await input.fill("abc");
    await expect(page.getByText(/reserved for team/i)).toBeVisible();
    const mintBtn = page.getByRole("button", { name: /mint identity|connect wallet|sign in/i });
    await expect(mintBtn).toBeDisabled();
  });

  test("4-char name keeps mint gated until referral validates", async ({ page }) => {
    await page.goto(`/pass?ref=${LAUNCH_CODE}`);
    await page.getByPlaceholder("yourname").fill("abcd");
    await expect(page.getByTestId("referral-code-input")).toHaveValue(LAUNCH_CODE);
    const mintBtn = page.getByRole("button", { name: /mint identity|connect wallet|sign in/i });
    await expect(mintBtn).toBeVisible();
  });
});

test.describe("referral validate API", () => {
  test("returns 400 for reserved 3-char handle policy", async ({ request }) => {
    const params = new URLSearchParams({
      code: LAUNCH_CODE,
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
    const res = await request.get(`/api/identity/referral/validate?code=${LAUNCH_CODE}`);
    expect(res.status()).toBe(400);
  });
});
