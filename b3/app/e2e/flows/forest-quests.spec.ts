import { expect, test } from "../fixtures/skip-onboarding";

test.describe("forest quests flow", () => {
  test("forest quests page loads", async ({ page }) => {
    await page.goto("/forest/quests");
    await expect(
      page.getByRole("heading", { name: /quest|founding|forest/i }).first(),
    ).toBeVisible();
  });

  test("culture coach carousel and quest strips render", async ({ page }) => {
    await page.goto("/forest/quests");
    await expect(page.getByRole("heading", { name: /founding quests/i })).toBeVisible();
    await expect(page.getByLabel(/culture coach stories/i)).toBeVisible();
    await expect(page.getByText("See the full meme").first()).toBeVisible();
    await expect(page.getByText("Culture Coach").first()).toBeVisible();
    await expect(page.getByRole("listitem").first()).toBeVisible();
  });

  test("social amplify panel with tag prefill links", async ({ page }) => {
    await page.goto("/forest/quests#social");
    await expect(page.getByRole("heading", { name: /share on farcaster or x/i })).toBeVisible();
    await expect(page.getByText("@0xleonardo").first()).toBeVisible();
    await expect(page.getByText("@bihary41418").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /compose on farcaster/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /verify & earn culture value/i })).toBeVisible();
  });

  test("member me API returns shape", async ({ request }) => {
    const res = await request.get(
      "/api/member/me?address=0x0000000000000000000000000000000000000001",
    );
    expect(res.status()).toBeLessThan(500);
    const json = await res.json();
    expect(json).toHaveProperty("ok");
  });
});
