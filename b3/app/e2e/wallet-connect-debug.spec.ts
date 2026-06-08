import { test } from "@playwright/test";

test("capture wallet connect page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => {
    errors.push(`${err.message}\n${err.stack ?? ""}`);
  });

  await page.goto("/pass");
  // Let initial client hydration settle before opening auth.
  await page.waitForTimeout(1200);
  const walletCta = page
    .getByRole("button", { name: /sign in for wallet|connect wallet/i })
    .first();
  await test.expect(walletCta).toBeVisible();
  await walletCta.click();
  await page.waitForTimeout(3000);

  if (errors.length > 0) {
    console.log("PAGE ERRORS:\n", errors.join("\n---\n"));
  }
  const knownHydrationNoise = [
    /Suspense boundary received an update before it finished hydrating/i,
    /Minified React error #421/i,
  ];
  const unexpected = errors.filter(
    (err) => !knownHydrationNoise.some((pattern) => pattern.test(err)),
  );
  test.expect(unexpected, "no unexpected React page errors on sign-in").toEqual([]);
});
