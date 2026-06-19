import { test as base, expect } from "./no-console-errors";

export const test = base.extend({
  page: async ({ page }, run) => {
    await page.addInitScript(() => {
      localStorage.setItem("bc_elias_onboarding_v1", "done");
    });
    await run(page);
  },
});

export { expect };
