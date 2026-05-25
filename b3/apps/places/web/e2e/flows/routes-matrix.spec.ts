import { expect, test } from "@playwright/test";
import { expectImmersiveVisible, expectMainVisible, skipHomeIntroRedirect } from "../helpers";

/**
 * Direct navigation: every route should render without 5xx.
 * Content varies with env (e.g. unset registry) — assert shell + soft text hints.
 */
const standardRoutes: { path: string; title?: RegExp }[] = [
  { path: "/", title: /Building Culture/i },
  { path: "/mission" },
  { path: "/roadmap" },
  { path: "/team" },
  { path: "/how-it-works" },
  { path: "/guide" },
  { path: "/feedback" },
  { path: "/blog" },
  { path: "/legal" },
  { path: "/legal/terms" },
  { path: "/legal/privacy" },
  { path: "/legal/risk" },
  { path: "/properties" },
  { path: "/trade" },
  { path: "/invest" },
  { path: "/stake" },
  { path: "/portfolio" },
  { path: "/pool" },
  { path: "/lend" },
  { path: "/markets" },
  { path: "/market" },
  { path: "/community" },
  { path: "/onboarding" },
  { path: "/issuer" },
  { path: "/contracts" },
  { path: "/culture-land" },
  { path: "/build-with-us" },
  { path: "/documents" },
  { path: "/guestbook" },
  { path: "/properties/1" },
  { path: "/trade?property=1" },
  { path: "/profile" },
  { path: "/admin" },
];

for (const { path, title } of standardRoutes) {
  test(`GET ${path} renders app shell`, async ({ page }) => {
    await skipHomeIntroRedirect(page);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    if (title) {
      await expect(page).toHaveTitle(title);
    }
    await expectMainVisible(page);
  });
}

test("GET /experience renders immersive (no main)", async ({ page }) => {
  await skipHomeIntroRedirect(page);
  await page.goto("/experience", { waitUntil: "domcontentloaded" });
  await expectImmersiveVisible(page);
});
