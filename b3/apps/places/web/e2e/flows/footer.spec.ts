import { expect, test } from "@playwright/test";
import { skipHomeIntroRedirect } from "../helpers";

test("footer link Immersive story navigates to /experience", async ({ page }) => {
  await skipHomeIntroRedirect(page);
  await page.goto("/");
  await expect(page.locator("header[data-nav-interactive]")).toHaveAttribute("data-nav-interactive", "true", {
    timeout: 30_000,
  });
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await footer.getByRole("link", { name: "Immersive story" }).click({ force: true });
  await expect(page).toHaveURL(/\/experience$/);
  await expect(page.getByRole("region", { name: /Immersive stories/i })).toBeVisible();
});

test("footer legal overview link", async ({ page }) => {
  await skipHomeIntroRedirect(page);
  await page.goto("/");
  await expect(page.locator("header[data-nav-interactive]")).toHaveAttribute("data-nav-interactive", "true", {
    timeout: 30_000,
  });
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await footer.getByRole("link", { name: "Legal overview" }).click({ force: true });
  await expect(page).toHaveURL(/\/legal$/);
  await expect(page.getByRole("main")).toBeVisible();
});
