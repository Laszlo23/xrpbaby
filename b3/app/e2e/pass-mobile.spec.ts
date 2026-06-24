import { expect, test } from "./fixtures/skip-onboarding";

const LAUNCH_CODE = "USHINE77";

test.describe("pass mobile mint funnel", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("/pass shows guide, prefilled invite, and mint controls", async ({ page }) => {
    await page.goto(`/pass?ref=${LAUNCH_CODE}`);
    await expect(page.getByText("How minting works")).toBeVisible();
    await expect(page.getByPlaceholder("yourname")).toBeVisible();
    await expect(page.getByTestId("referral-code-input")).toHaveValue(LAUNCH_CODE);
    await expect(page.getByTestId("mint-sticky-bar")).toBeVisible();
    await expect(page.getByTestId("copy-invite-code")).toBeVisible();
  });

  test("copy invite code button is present", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`/pass?ref=${LAUNCH_CODE}`);
    await page.getByTestId("copy-invite-code").click();
    await expect(page.getByText(/invite code copied/i)).toBeVisible({ timeout: 5_000 });
  });

  test("Buy BCC FAB is hidden on /pass", async ({ page }) => {
    await page.goto("/pass");
    await expect(page.getByTestId("buy-bcc-fab")).toHaveCount(0);
  });
});
