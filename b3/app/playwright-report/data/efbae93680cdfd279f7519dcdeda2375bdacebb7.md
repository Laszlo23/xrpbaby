# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: identity-resolve.spec.ts >> culture name resolution >> profile page loads for available name
- Location: e2e/identity-resolve.spec.ts:17:3

# Error details

```
Error: Unexpected browser errors:
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic "Connect wallet":
      - generic [ref=e3]: Loading…
    - generic [ref=e5]:
      - link "← Claim a name" [ref=e6] [cursor=pointer]:
        - /url: /pass
      - paragraph [ref=e7]: AVAILABLE
      - heading "availablezzz999.culture" [level=1] [ref=e8]:
        - text: availablezzz999
        - generic [ref=e9]: .culture
      - paragraph [ref=e10]: This Culture Layer name is not minted yet. Names resolve here and across the app once claimed on Base — no separate domain purchase.
      - link "Mint this name →" [ref=e11] [cursor=pointer]:
        - /url: /pass?name=availablezzz999&tld=.culture
    - contentinfo [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]:
              - img "Building Culture" [ref=e17]
              - generic [ref=e18]: Building Culture
            - paragraph [ref=e19]: Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation, earn credentials, and unlock access together.
            - generic [ref=e20]:
              - link "X @buildingcultu3" [ref=e21] [cursor=pointer]:
                - /url: https://x.com/buildingcultu3
                - img [ref=e22]
              - link "Telegram" [ref=e24] [cursor=pointer]:
                - /url: https://t.me/+4zFH7-2tyW0yOTBk
                - img [ref=e25]
              - link "Discord" [ref=e28] [cursor=pointer]:
                - /url: https://discord.gg/geUpHt3eSb
                - img [ref=e29]
          - generic [ref=e31]:
            - generic [ref=e32]:
              - paragraph [ref=e33]: Product
              - list [ref=e34]:
                - listitem [ref=e35]:
                  - link "Culture ID" [ref=e36] [cursor=pointer]:
                    - /url: /pass
                    - img [ref=e38]
                    - text: Culture ID
                - listitem [ref=e47]:
                  - link "Credentials" [ref=e48] [cursor=pointer]:
                    - /url: /credentials
                    - img [ref=e50]
                    - text: Credentials
                - listitem [ref=e52]:
                  - link "Reputation" [ref=e53] [cursor=pointer]:
                    - /url: /credentials/leaderboard
                    - img [ref=e55]
                    - text: Reputation
            - generic [ref=e61]:
              - paragraph [ref=e62]: Community
              - list [ref=e63]:
                - listitem [ref=e64]:
                  - link "Mission" [ref=e65] [cursor=pointer]:
                    - /url: /mission
                    - img [ref=e67]
                    - text: Mission
                - listitem [ref=e69]:
                  - link "Story" [ref=e70] [cursor=pointer]:
                    - /url: /story
                    - img [ref=e72]
                    - text: Story
                - listitem [ref=e74]:
                  - link "Team" [ref=e75] [cursor=pointer]:
                    - /url: /team
                    - img [ref=e77]
                    - text: Team
                - listitem [ref=e82]:
                  - link "FAQ" [ref=e83] [cursor=pointer]:
                    - /url: /faq
                    - img [ref=e85]
                    - text: FAQ
                - listitem [ref=e88]:
                  - link "Site guide" [ref=e89] [cursor=pointer]:
                    - /url: /guide
                    - img [ref=e91]
                    - text: Site guide
            - generic [ref=e94]:
              - paragraph [ref=e95]: Ecosystem
              - list [ref=e96]:
                - listitem [ref=e97]:
                  - link "Ecosystem Hub" [ref=e98] [cursor=pointer]:
                    - /url: /ecosystem
                    - img [ref=e100]
                    - text: Ecosystem Hub
            - generic [ref=e104]:
              - paragraph [ref=e105]: Capital
              - list [ref=e106]:
                - listitem [ref=e107]:
                  - link "BCC" [ref=e108] [cursor=pointer]:
                    - /url: /bcc/dashboard
                    - img [ref=e110]
                    - text: BCC
                - listitem [ref=e115]:
                  - link "Investors" [ref=e116] [cursor=pointer]:
                    - /url: /investors
                    - img [ref=e118]
                    - text: Investors
        - generic [ref=e121]:
          - paragraph [ref=e122]: © 2026 BUILDING CULTURE — BUILT BY PEOPLE.
          - generic [ref=e123]:
            - link "Terms" [ref=e124] [cursor=pointer]:
              - /url: /legal/terms
            - link "Privacy" [ref=e125] [cursor=pointer]:
              - /url: /legal/privacy
            - link "Imprint" [ref=e126] [cursor=pointer]:
              - /url: /legal/imprint
            - link "Contact" [ref=e127] [cursor=pointer]:
              - /url: mailto:hello@buildingcultureid.space
          - paragraph [ref=e128]: Vienna · Austria · Worldwide
  - button "Buy $BCC" [ref=e129]
  - button "Open Panic Switch" [ref=e131]:
    - generic [ref=e133]: Ready
    - generic: Panic
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | /* Playwright fixture `use` is not React's use hook. */
  2  | /* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
  3  | import { test as base, expect } from "@playwright/test";
  4  | 
  5  | import {
  6  |   isAllowlistedConsoleError,
  7  |   isAllowlistedPageError,
  8  |   isAppAssetRequest,
  9  | } from "../console-allowlist";
  10 | 
  11 | type ConsoleMonitor = {
  12 |   failures: string[];
  13 | };
  14 | 
  15 | export const test = base.extend<{ consoleMonitor: ConsoleMonitor }>({
  16 |   consoleMonitor: async ({}, use) => {
  17 |     await use({ failures: [] });
  18 |   },
  19 |   page: async ({ page, baseURL, consoleMonitor }, use) => {
  20 |     const push = (kind: string, detail: string) => {
  21 |       consoleMonitor.failures.push(`[${kind}] ${detail}`);
  22 |     };
  23 | 
  24 |     page.on("pageerror", (err) => {
  25 |       const message = `${err.message}\n${err.stack ?? ""}`;
  26 |       if (!isAllowlistedPageError(message)) {
  27 |         push("pageerror", message);
  28 |       }
  29 |     });
  30 | 
  31 |     page.on("console", (msg) => {
  32 |       if (msg.type() !== "error") return;
  33 |       const text = msg.text();
  34 |       if (!isAllowlistedConsoleError(text)) {
  35 |         push("console.error", text);
  36 |       }
  37 |     });
  38 | 
  39 |     page.on("requestfailed", (req) => {
  40 |       const url = req.url();
  41 |       const failure = req.failure()?.errorText ?? "unknown";
  42 |       if (isAppAssetRequest(url, baseURL)) {
  43 |         push("requestfailed", `${url} — ${failure}`);
  44 |       }
  45 |     });
  46 | 
  47 |     await use(page);
  48 | 
  49 |     expect(
  50 |       consoleMonitor.failures,
  51 |       consoleMonitor.failures.length
  52 |         ? `Unexpected browser errors:\n${consoleMonitor.failures.join("\n---\n")}`
  53 |         : "no unexpected browser errors",
> 54 |     ).toEqual([]);
     |       ^ Error: Unexpected browser errors:
  55 |   },
  56 | });
  57 | 
  58 | export { expect } from "@playwright/test";
  59 | 
```