import { expect, test } from "./fixtures/skip-onboarding";

test.describe("0G hackathon proof page", () => {
  test("/0g/agentid shows mainnet proof and ChainScan links", async ({ page }) => {
    await page.goto("/0g/agentid");

    await expect(page.getByRole("heading", { name: /BUILDCHAIN Agent ID/i })).toBeVisible();
    await expect(page.getByText(/on-chain identity layer for AI agents on the 0G Chain/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /View on 0G ChainScan/i })).toHaveAttribute(
      "href",
      /chainscan\.0g\.ai\/address\/0x0451/i,
    );
    await expect(page.getByRole("link", { name: /Open HackQuest/i })).toHaveAttribute(
      "href",
      /hackquest\.io\/hackathons\/0G-APAC-Hackathon/,
    );
  });

  test("serves ERC-721 metadata for token 1", async ({ page }) => {
    const res = await page.request.get("/0g/agentid/1.json");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("BUILDCHAIN Agent ID");
  });
});
