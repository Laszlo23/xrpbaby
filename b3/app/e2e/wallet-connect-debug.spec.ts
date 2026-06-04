import { test } from "@playwright/test";

test("capture wallet connect page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => {
    errors.push(`${err.message}\n${err.stack ?? ""}`);
  });

  await page.goto("/");
  await page.getByRole("button", { name: /sign in/i }).first().click();
  await page.waitForTimeout(3000);

  if (errors.length > 0) {
    console.log("PAGE ERRORS:\n", errors.join("\n---\n"));
  }
  test.expect(errors, "no React page errors on sign-in").toEqual([]);
});
