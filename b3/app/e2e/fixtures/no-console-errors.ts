/* Playwright fixture `use` is not React's use hook. */
/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
import { test as base, expect } from "@playwright/test";

import {
  isAllowlistedConsoleError,
  isAllowlistedPageError,
  isAppAssetRequest,
} from "../console-allowlist";

type ConsoleMonitor = {
  failures: string[];
};

export const test = base.extend<{ consoleMonitor: ConsoleMonitor }>({
  consoleMonitor: async ({}, use) => {
    await use({ failures: [] });
  },
  page: async ({ page, baseURL, consoleMonitor }, use) => {
    const push = (kind: string, detail: string) => {
      consoleMonitor.failures.push(`[${kind}] ${detail}`);
    };

    page.on("pageerror", (err) => {
      const message = `${err.message}\n${err.stack ?? ""}`;
      if (!isAllowlistedPageError(message)) {
        push("pageerror", message);
      }
    });

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (!isAllowlistedConsoleError(text)) {
        push("console.error", text);
      }
    });

    page.on("requestfailed", (req) => {
      const url = req.url();
      const failure = req.failure()?.errorText ?? "unknown";
      if (isAppAssetRequest(url, baseURL)) {
        push("requestfailed", `${url} — ${failure}`);
      }
    });

    await use(page);

    expect(
      consoleMonitor.failures,
      consoleMonitor.failures.length
        ? `Unexpected browser errors:\n${consoleMonitor.failures.join("\n---\n")}`
        : "no unexpected browser errors",
    ).toEqual([]);
  },
});

export { expect } from "@playwright/test";
