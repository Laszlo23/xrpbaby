import { defineConfig, devices } from "@playwright/test";

/**
 * Run from `web/`: `npm run test:e2e`
 * Installs browsers once: `npx playwright install chromium`
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          /** Vanilla wagmi path — avoids Privy+wagmi duplicate-context SSR errors in e2e. */
          NEXT_PUBLIC_PRIVY_APP_ID: "",
          NEXT_PUBLIC_PRIVY_APPID: "",
          /** Base mainnet REOC bundle (apps/places/deployments/base-mainnet.json). */
          NEXT_PUBLIC_BASE_REGISTRY: "0x5aca19274B17B97e38da9eA851d91F0CC59DafBf",
          NEXT_PUBLIC_BASE_SHARE_FACTORY: "0x4CA708ca735bBA49D7B2383071EA7FA1B7BDC614",
          NEXT_PUBLIC_BASE_COMPLIANCE_REGISTRY: "0xa655c0B0037699433F0692356a3A142956103B7a",
          NEXT_PUBLIC_BASE_WETH: "0x4412Afca8021F233aE6a41cEFD06b27759C0E9A9",
          NEXT_PUBLIC_BASE_ROUTER: "0x753634Af9E86b26e5394f39496a1097C6f19B868",
          NEXT_PUBLIC_BASE_PREDICTION_MARKET: "0x7D0E418d1a0e73a73C18F146a660346e2C113046",
          NEXT_PUBLIC_BASE_RPC: "https://mainnet.base.org",
        },
      },
});
