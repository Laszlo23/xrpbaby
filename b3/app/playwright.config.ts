import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  /**
   * Production SSR (`npm run start`) avoids the duplicate-React dev SSR failure documented in
   * `docs/BC_UMBRELLA_VERIFY.md`. CI always rebuilds before listening.
   */
  webServer: {
    command: "npm run build && PORT=3000 npm run start",
    url: "http://127.0.0.1:3000",
    // Do not reuse a random process on :3000 — a static or stale server can pass page loads (SPA)
    // while server handlers (/sitemap.xml, /api/*, /.well-known/*) return 404.
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "1",
    timeout: 300_000,
    env: {
      ...process.env,
      PORT: "3000",
      VITE_IDENTITY_CHAIN_ID: process.env.VITE_IDENTITY_CHAIN_ID ?? "8453",
      VITE_IDENTITY_CONTRACT_ADDRESS:
        process.env.VITE_IDENTITY_CONTRACT_ADDRESS ??
        "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863",
    },
  },
});
