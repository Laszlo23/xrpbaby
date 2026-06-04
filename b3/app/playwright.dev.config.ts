import { defineConfig, devices } from "@playwright/test";

/** Run against `npm run dev` (5173): PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test -c playwright.dev.config.ts */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
});
