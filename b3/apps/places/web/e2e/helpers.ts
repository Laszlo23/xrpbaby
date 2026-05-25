import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Prime localStorage before navigation so deterministic shell tests pass in CI:
 * - `building-culture-intro-v1` — without this, `/` client-redirects to `/experience` and drops `<main>`.
 * - `bc-beta-modal-dismissed-v1` — BetaWelcomeModal backdrop intercepts clicks on nav/footer (see BetaWelcomeModal).
 */
export async function skipHomeIntroRedirect(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("building-culture-intro-v1", "1");
    window.localStorage.setItem("bc-beta-modal-dismissed-v1", "1");
  });
}

/** Most pages render inside SiteChrome `<main>`. */
export async function expectMainVisible(page: Page) {
  await expect(page.getByRole("main")).toBeVisible();
}

/** Full-screen immersive funnel (no `<main>`). */
export async function expectImmersiveVisible(page: Page) {
  await expect(page.getByRole("region", { name: /Immersive stories/i })).toBeVisible();
}
