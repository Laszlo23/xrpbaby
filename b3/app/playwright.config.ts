import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(appDir, ".env") });

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const defaultDatabaseUrl =
  "postgresql://buildingculture:bclocaldev@127.0.0.1:55432/buildingculture?schema=public";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "on-first-retry",
  },
  /**
   * Production SSR (`npm run start`) avoids the duplicate-React dev SSR failure documented in
   * `docs/BC_UMBRELLA_VERIFY.md`. CI always rebuilds before listening.
   *
   * Local: `PLAYWRIGHT_REUSE_SERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run dev` first.
   */
  webServer: {
    command:
      process.env.PW_PREBUILT === "1"
        ? "PORT=3000 npm run start"
        : "npm run build && PORT=3000 npm run start",
    url: baseURL,
    // Do not reuse a random process on :3000 — a static or stale server can pass page loads (SPA)
    // while server handlers (/sitemap.xml, /api/*, /.well-known/*) return 404.
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "1",
    timeout: 300_000,
    env: {
      ...process.env,
      PORT: "3000",
      DATABASE_URL: process.env.DATABASE_URL ?? defaultDatabaseUrl,
      VITE_IDENTITY_CHAIN_ID: process.env.VITE_IDENTITY_CHAIN_ID ?? "8453",
      VITE_IDENTITY_CONTRACT_ADDRESS:
        process.env.VITE_IDENTITY_CONTRACT_ADDRESS ?? "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863",
    },
  },
});
