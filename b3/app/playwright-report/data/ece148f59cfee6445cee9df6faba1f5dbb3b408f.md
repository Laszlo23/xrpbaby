# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: builder-tapes.spec.ts >> Builder Tapes >> story page links to Builder Tapes
- Location: e2e/builder-tapes.spec.ts:44:3

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
    - generic [ref=e4]:
      - banner [ref=e5]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: Builder chronicle
          - generic [ref=e8]: From Web2 builder to Building Culture
          - paragraph [ref=e9]: Laszlo Bihary (Leonardo.based) — decades of craft, proof-first culture on Base, and essays published on Paragraph.
          - generic [ref=e10]:
            - link "Paragraph · 0x502c…C2e1" [ref=e11] [cursor=pointer]:
              - /url: https://paragraph.com/0x502ce9fb1814cb03843967ec5e0d8f6aa3a3c2e1
              - text: Paragraph · 0x502c…C2e1
              - img [ref=e12]
            - link "Meet the team" [ref=e16] [cursor=pointer]:
              - /url: /team
      - article [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]:
            - paragraph [ref=e21]: On-chain identity
            - paragraph [ref=e22]: The same wallet anchors ComplianceRegistry on Base — narrative and on-chain compliance share one identity.
            - link "0x502c…C2e1" [ref=e23] [cursor=pointer]:
              - /url: https://paragraph.com/0x502ce9fb1814cb03843967ec5e0d8f6aa3a3c2e1
              - text: 0x502c…C2e1
              - img [ref=e24]
          - generic [ref=e28]:
            - paragraph [ref=e29]: Builder Tapes
            - heading "Hear the real story" [level=2] [ref=e30]
            - paragraph [ref=e31]: Five audio episodes from Laszlo — dial-up whispers to onchain culture. Listen, share, earn Culture Points.
            - link "Open Builder Tapes" [ref=e32] [cursor=pointer]:
              - /url: /stories/tapes
              - img [ref=e33]
              - text: Open Builder Tapes
          - generic [ref=e35]:
            - heading "Timeline" [level=2] [ref=e36]
            - paragraph [ref=e37]: Decades of building — from IT in 1996 to a culture economy on Base.
            - list [ref=e38]:
              - listitem [ref=e39]:
                - paragraph [ref=e41]: "1996"
                - paragraph [ref=e42]: IT from day one
                - paragraph [ref=e43]: Started in information technology when the web was still wiring itself together — curiosity before crypto, craft before hype.
                - link "Listen · Dial-Up Whispers" [ref=e45] [cursor=pointer]:
                  - /url: /stories/tapes/dial-up-whispers
                  - img [ref=e46]
                  - text: Listen · Dial-Up Whispers
              - listitem [ref=e48]:
                - paragraph [ref=e50]: 2000s
                - paragraph [ref=e51]: Web2 builder years
                - paragraph [ref=e52]: Agencies, SEO, creative direction, decentralized experiments — learning how products feel when real people use them.
                - link "Listen · Screen-Glow Hope" [ref=e54] [cursor=pointer]:
                  - /url: /stories/tapes/screen-glow-hope
                  - img [ref=e55]
                  - text: Listen · Screen-Glow Hope
              - listitem [ref=e57]:
                - paragraph [ref=e59]: 2020s
                - paragraph [ref=e60]: Onchain shift
                - paragraph [ref=e61]: Wallet-native identity, fair drops, and proof-first culture — less pitch deck, more receipts.
                - link "Listen · Bitcoin Whitepaper" [ref=e63] [cursor=pointer]:
                  - /url: /stories/tapes/bitcoin-whitepaper
                  - img [ref=e64]
                  - text: Listen · Bitcoin Whitepaper
              - listitem [ref=e66]:
                - paragraph [ref=e68]: Today
                - paragraph [ref=e69]: Building Culture
                - paragraph [ref=e70]: "A culture economy on Base: identity, places, art, BCC utility, and communities that fund themselves with transparency."
                - generic [ref=e71]:
                  - link "Listen · Cathedral Builders" [ref=e72] [cursor=pointer]:
                    - /url: /stories/tapes/cathedral-builders
                    - img [ref=e73]
                    - text: Listen · Cathedral Builders
                  - link "Listen · Builders Inherit" [ref=e75] [cursor=pointer]:
                    - /url: /stories/tapes/builders-inherit
                    - img [ref=e76]
                    - text: Listen · Builders Inherit
          - generic [ref=e78]:
            - heading "Essays on Paragraph" [level=2] [ref=e79]
            - paragraph [ref=e80]:
              - text: Short excerpts here; full writing lives on
              - link "Paragraph" [ref=e81] [cursor=pointer]:
                - /url: https://paragraph.com/0x502ce9fb1814cb03843967ec5e0d8f6aa3a3c2e1
              - text: .
            - generic [ref=e82]:
              - article [ref=e83]:
                - img [ref=e84]
                - generic [ref=e85]:
                  - generic [ref=e86]:
                    - generic [ref=e87]: Origin
                    - generic [ref=e88]: May 17, 2025
                  - heading "From Web2 Builder to Building Culture" [level=3] [ref=e89]
                  - paragraph [ref=e90]: I started in IT in 1996. Building Culture is what happens when you stop optimizing for launches and start optimizing for places people actually live in — on-chain proof included.
                  - link "Read on Paragraph" [ref=e91] [cursor=pointer]:
                    - /url: https://paragraph.com/@laszloleonardo
                    - text: Read on Paragraph
                    - img [ref=e92]
              - article [ref=e96]:
                - img [ref=e97]
                - generic [ref=e98]:
                  - generic [ref=e99]:
                    - generic [ref=e100]: Identity
                    - generic [ref=e101]: Apr 24, 2025
                  - heading "Natural Born builder" [level=3] [ref=e102]
                  - paragraph [ref=e103]: Some people negotiate with systems. Builders rewrite the parts that stop communities from participating. That instinct is what pulled me from Web2 clients to culture on Base.
                  - link "Read on Paragraph" [ref=e104] [cursor=pointer]:
                    - /url: https://paragraph.com/@laszloleonardo
                    - text: Read on Paragraph
                    - img [ref=e105]
              - article [ref=e109]:
                - img [ref=e110]
                - generic [ref=e111]:
                  - generic [ref=e112]:
                    - generic [ref=e113]: Craft
                    - generic [ref=e114]: Mar 19, 2025
                  - heading "From Building Fast to Building Right" [level=3] [ref=e115]
                  - paragraph [ref=e116]: Speed still matters — but only when it compounds trust. We ship in public, attestation over applause, and loops that reward people who show up week after week.
                  - link "Read on Paragraph" [ref=e117] [cursor=pointer]:
                    - /url: https://paragraph.com/@laszloleonardo
                    - text: Read on Paragraph
                    - img [ref=e118]
              - article [ref=e122]:
                - img [ref=e123]
                - generic [ref=e124]:
                  - generic [ref=e125]:
                    - generic [ref=e126]: Literacy
                    - generic [ref=e127]: Mar 31, 2025
                  - 'heading "Stablecoins: The Quiet Risk No One in Crypto Wants to Talk About" [level=3] [ref=e128]'
                  - paragraph [ref=e129]: Stable does not mean invisible risk. I write about rails and reserves so our community learns the plumbing — not as a token pitch, but as adult literacy for onchain economies.
                  - link "Read on Paragraph" [ref=e130] [cursor=pointer]:
                    - /url: https://paragraph.com/@laszloleonardo
                    - text: Read on Paragraph
                    - img [ref=e131]
              - article [ref=e135]:
                - img [ref=e136]
                - generic [ref=e137]:
                  - generic [ref=e138]:
                    - generic [ref=e139]: Trust
                    - generic [ref=e140]: Feb 17, 2025
                  - heading "The 4th Time I Got Played — And Why This One Hit Different" [level=3] [ref=e141]
                  - paragraph [ref=e142]: Trust breaks in public long before contracts fail. That is why Building Culture defaults to verifiable drops, open ledgers, and saying no to vibes-only fundraising.
                  - link "Read on Paragraph" [ref=e143] [cursor=pointer]:
                    - /url: https://paragraph.com/@laszloleonardo
                    - text: Read on Paragraph
                    - img [ref=e144]
          - generic [ref=e148]:
            - link "Create your pass" [ref=e149] [cursor=pointer]:
              - /url: /join
            - link "Mission & BCC" [ref=e150] [cursor=pointer]:
              - /url: /mission
            - link "Learn liquidity" [ref=e151] [cursor=pointer]:
              - /url: /liquidity
    - contentinfo [ref=e152]:
      - generic [ref=e153]:
        - generic [ref=e154]:
          - generic [ref=e155]:
            - generic [ref=e156]:
              - img "Building Culture" [ref=e157]
              - generic [ref=e158]: Building Culture
            - paragraph [ref=e159]: Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation, earn credentials, and unlock access together.
            - generic [ref=e160]:
              - link "X @buildingcultu3" [ref=e161] [cursor=pointer]:
                - /url: https://x.com/buildingcultu3
                - img [ref=e162]
              - link "Telegram" [ref=e164] [cursor=pointer]:
                - /url: https://t.me/+4zFH7-2tyW0yOTBk
                - img [ref=e165]
              - link "Discord" [ref=e168] [cursor=pointer]:
                - /url: https://discord.gg/geUpHt3eSb
                - img [ref=e169]
          - generic [ref=e171]:
            - generic [ref=e172]:
              - paragraph [ref=e173]: Product
              - list [ref=e174]:
                - listitem [ref=e175]:
                  - link "Culture ID" [ref=e176] [cursor=pointer]:
                    - /url: /pass
                    - img [ref=e178]
                    - text: Culture ID
                - listitem [ref=e187]:
                  - link "Credentials" [ref=e188] [cursor=pointer]:
                    - /url: /credentials
                    - img [ref=e190]
                    - text: Credentials
                - listitem [ref=e192]:
                  - link "Reputation" [ref=e193] [cursor=pointer]:
                    - /url: /credentials/leaderboard
                    - img [ref=e195]
                    - text: Reputation
            - generic [ref=e201]:
              - paragraph [ref=e202]: Community
              - list [ref=e203]:
                - listitem [ref=e204]:
                  - link "Mission" [ref=e205] [cursor=pointer]:
                    - /url: /mission
                    - img [ref=e207]
                    - text: Mission
                - listitem [ref=e209]:
                  - link "Story" [ref=e210] [cursor=pointer]:
                    - /url: /story
                    - img [ref=e212]
                    - text: Story
                - listitem [ref=e214]:
                  - link "Team" [ref=e215] [cursor=pointer]:
                    - /url: /team
                    - img [ref=e217]
                    - text: Team
                - listitem [ref=e222]:
                  - link "FAQ" [ref=e223] [cursor=pointer]:
                    - /url: /faq
                    - img [ref=e225]
                    - text: FAQ
                - listitem [ref=e228]:
                  - link "Site guide" [ref=e229] [cursor=pointer]:
                    - /url: /guide
                    - img [ref=e231]
                    - text: Site guide
            - generic [ref=e234]:
              - paragraph [ref=e235]: Ecosystem
              - list [ref=e236]:
                - listitem [ref=e237]:
                  - link "Ecosystem Hub" [ref=e238] [cursor=pointer]:
                    - /url: /ecosystem
                    - img [ref=e240]
                    - text: Ecosystem Hub
            - generic [ref=e244]:
              - paragraph [ref=e245]: Capital
              - list [ref=e246]:
                - listitem [ref=e247]:
                  - link "BCC" [ref=e248] [cursor=pointer]:
                    - /url: /bcc/dashboard
                    - img [ref=e250]
                    - text: BCC
                - listitem [ref=e255]:
                  - link "Investors" [ref=e256] [cursor=pointer]:
                    - /url: /investors
                    - img [ref=e258]
                    - text: Investors
        - generic [ref=e261]:
          - paragraph [ref=e262]: © 2026 BUILDING CULTURE — BUILT BY PEOPLE.
          - generic [ref=e263]:
            - link "Terms" [ref=e264] [cursor=pointer]:
              - /url: /legal/terms
            - link "Privacy" [ref=e265] [cursor=pointer]:
              - /url: /legal/privacy
            - link "Imprint" [ref=e266] [cursor=pointer]:
              - /url: /legal/imprint
            - link "Contact" [ref=e267] [cursor=pointer]:
              - /url: mailto:hello@buildingcultureid.space
          - paragraph [ref=e268]: Vienna · Austria · Worldwide
    - navigation:
      - generic [ref=e270]:
        - link "Hub" [ref=e271] [cursor=pointer]:
          - /url: /forest
          - img [ref=e272]
          - generic [ref=e277]: Hub
        - link "Play" [ref=e278] [cursor=pointer]:
          - /url: /play
          - img [ref=e279]
          - generic [ref=e281]: Play
        - link "Connect" [ref=e282] [cursor=pointer]:
          - /url: /connect
          - img [ref=e283]
          - generic [ref=e288]: Connect
        - link "Agents" [ref=e289] [cursor=pointer]:
          - /url: /agents/inbox
          - img [ref=e290]
          - generic [ref=e293]: Agents
        - link "You" [ref=e294] [cursor=pointer]:
          - /url: /profile
          - img [ref=e295]
          - generic [ref=e298]: You
  - button "Buy $BCC" [ref=e299]
  - button "Open Panic Switch" [ref=e301]:
    - generic [ref=e303]: Ready
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