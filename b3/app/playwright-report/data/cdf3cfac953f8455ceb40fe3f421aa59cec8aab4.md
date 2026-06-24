# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shell.spec.ts >> app shell chrome >> single global footer on story and product routes
- Location: e2e/shell.spec.ts:31:3

# Error details

```
Error: Unexpected browser errors:
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] TypeError: Failed to fetch
    at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:12916
    at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:13183
    at LE (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:25026)
    at j1 (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:43811)
    at SX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:37715)
    at Gp (http://127.0.0.1:3000/assets/index-Cvellgi4.js:7:3285)
    at W$e (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:42570)
    at wm (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:41516)
    at AX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:36816)
    at S (http://127.0.0.1:3000/assets/index-Cvellgi4.js:2:10136)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] TypeError: Failed to fetch
    at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:12916
    at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:13183
    at LE (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:25026)
    at j1 (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:43811)
    at SX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:37715)
    at Gp (http://127.0.0.1:3000/assets/index-Cvellgi4.js:7:3285)
    at W$e (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:42570)
    at wm (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:41516)
    at AX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:36816)
    at S (http://127.0.0.1:3000/assets/index-Cvellgi4.js:2:10136)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] TypeError: Failed to fetch
    at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:12916
    at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:13183
    at LE (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:25026)
    at j1 (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:43811)
    at SX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:37715)
    at Gp (http://127.0.0.1:3000/assets/index-Cvellgi4.js:7:3285)
    at W$e (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:42570)
    at wm (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:41516)
    at AX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:36816)
    at S (http://127.0.0.1:3000/assets/index-Cvellgi4.js:2:10136)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[pageerror] Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
    at <anonymous>:4:7
    at <anonymous>:5:7
---
[console.error] Failed to load resource: the server responded with a status of 403 ()
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
---
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 52

- Array []
+ Array [
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] TypeError: Failed to fetch
+     at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:12916
+     at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:13183
+     at LE (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:25026)
+     at j1 (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:43811)
+     at SX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:37715)
+     at Gp (http://127.0.0.1:3000/assets/index-Cvellgi4.js:7:3285)
+     at W$e (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:42570)
+     at wm (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:41516)
+     at AX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:36816)
+     at S (http://127.0.0.1:3000/assets/index-Cvellgi4.js:2:10136)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] TypeError: Failed to fetch
+     at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:12916
+     at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:13183
+     at LE (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:25026)
+     at j1 (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:43811)
+     at SX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:37715)
+     at Gp (http://127.0.0.1:3000/assets/index-Cvellgi4.js:7:3285)
+     at W$e (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:42570)
+     at wm (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:41516)
+     at AX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:36816)
+     at S (http://127.0.0.1:3000/assets/index-Cvellgi4.js:2:10136)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] TypeError: Failed to fetch
+     at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:12916
+     at http://127.0.0.1:3000/assets/index-Cvellgi4.js:82:13183
+     at LE (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:25026)
+     at j1 (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:43811)
+     at SX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:37715)
+     at Gp (http://127.0.0.1:3000/assets/index-Cvellgi4.js:7:3285)
+     at W$e (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:42570)
+     at wm (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:41516)
+     at AX (http://127.0.0.1:3000/assets/index-Cvellgi4.js:9:36816)
+     at S (http://127.0.0.1:3000/assets/index-Cvellgi4.js:2:10136)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[pageerror] Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
+ SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
+     at <anonymous>:4:7
+     at <anonymous>:5:7",
+   "[console.error] Failed to load resource: the server responded with a status of 403 ()",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic "Connect wallet":
      - button "Connect" [ref=e4]:
        - img [ref=e5]
        - text: Connect
    - generic [ref=e10]:
      - link "← Forest" [ref=e11] [cursor=pointer]:
        - /url: /forest
      - banner [ref=e12]:
        - paragraph [ref=e13]: CULTURE LAYER
        - heading "Claim your culture name" [level=1] [ref=e14]
        - paragraph [ref=e15]: Mint a transferable identity NFT on Base or BNB Chain. $0.07–$7.77 on Base or BNB Chain.
      - generic [ref=e17]:
        - generic [ref=e19]:
          - paragraph [ref=e20]: TLD DASHBOARD
          - heading "Your name on the culture layer" [level=2] [ref=e21]
          - paragraph [ref=e22]: Pick Base or BNB Chain, search availability, connect your wallet, and mint in one flow.
          - group "Identity network" [ref=e24]:
            - button "Base" [ref=e25]
            - button "BNB Chain" [ref=e26]
          - generic [ref=e28]:
            - generic [ref=e30]:
              - generic [ref=e31]:
                - generic [ref=e32]: claim
                - textbox "yourname" [ref=e33]
                - combobox [ref=e34] [cursor=pointer]:
                  - option ".culture" [selected]
                  - option ".build"
                  - option ".home"
                  - option ".eco"
                  - option ".capital"
                  - option ".city"
              - button "Sign in for wallet →" [disabled] [ref=e35]
            - generic [ref=e36]:
              - generic [ref=e37]: Referral code (required)
              - generic [ref=e38]:
                - textbox "BUILD77" [ref=e39]
                - generic [ref=e40]: 4+ letter names · one mint per wallet
            - generic [ref=e41]:
              - generic [ref=e42]:
                - generic [ref=e43]: live preview
                - generic [ref=e44]: ·
                - generic [ref=e45]: yourname.culture
                - generic [ref=e46]: enter at least 4 characters for promo mint
                - generic [ref=e47]: ·
                - generic [ref=e48]: $0.07–$7.77 on Base (paid in ETH)
              - button "Pay with $BCC (11.11% off with $BCC)" [ref=e49]
            - generic [ref=e50]:
              - paragraph [ref=e51]: BNB identity layer
              - paragraph [ref=e52]:
                - text: Culture Layer
                - generic [ref=e53]: .culture
                - text: on Base + optional .bnb via Space ID — linked to the same wallet on your profile.
              - generic [ref=e54]:
                - button "Check yourname.bnb" [ref=e55]
                - link "Register .bnb on Space ID →" [ref=e56] [cursor=pointer]:
                  - /url: https://space.id/tld/1
        - generic [ref=e57]:
          - generic [ref=e58]:
            - paragraph [ref=e59]: PREVIEW
            - link "ERC-721 · transferable yourname.culture 0xe3bc…c647 founding eligible multichain transferable reputation 3145 XP minted on base" [ref=e62] [cursor=pointer]:
              - /url: /id/yourname.culture
              - generic [ref=e64]: ERC-721 · transferable
              - generic [ref=e66]:
                - heading "yourname.culture" [level=3] [ref=e67]:
                  - text: yourname
                  - generic [ref=e68]: .culture
                - paragraph [ref=e69]: 0xe3bc…c647
              - generic [ref=e70]:
                - generic [ref=e71]: founding eligible
                - generic [ref=e72]: multichain
                - generic [ref=e73]: transferable
              - generic [ref=e74]:
                - generic [ref=e75]:
                  - generic [ref=e76]: reputation
                  - generic [ref=e77]: 3145 XP
                - generic [ref=e78]:
                  - generic [ref=e79]: minted on
                  - generic [ref=e80]: base
          - generic [ref=e81]:
            - paragraph [ref=e82]: After mint
            - list [ref=e83]:
              - listitem [ref=e84]:
                - text: "Your share link:"
                - code [ref=e85]: /n/yourname.culture
                - text: → profile (no extra domain to buy)
              - listitem [ref=e86]: Canonical profile at /id/handle.tld with onchain owner resolution
              - listitem [ref=e87]: "Founding members: first 5,000 mints on .culture"
              - listitem [ref=e88]: "Mint price: $0.07–$7.77 on Base or BNB Chain"
            - link "Back to community hub" [ref=e89] [cursor=pointer]:
              - /url: /forest
        - generic [ref=e90]:
          - heading "Claim your BCC allocation" [level=3] [ref=e91]
          - paragraph [ref=e92]: Culture Pass holders with an eligible allocation can claim canonical BCC on Base. Paste your merkle proof from the operator dashboard.
          - paragraph [ref=e93]: Connect wallet on Base to claim.
        - generic [ref=e94]:
          - paragraph [ref=e95]: TRUST LAYER
          - paragraph [ref=e97]:
            - text: Mint your
            - strong [ref=e98]: .culture
            - text: name above, then link an optional XRPL wallet below (Crossmark + manual fallback).
          - paragraph [ref=e99]: Optional XRPL wallet linking under Culture ID — Building Culture is not an XRP project.
    - contentinfo [ref=e100]:
      - generic [ref=e101]:
        - generic [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]:
              - img "Building Culture" [ref=e105]
              - generic [ref=e106]: Building Culture
            - paragraph [ref=e107]: Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation, earn credentials, and unlock access together.
            - generic [ref=e108]:
              - link "X @buildingcultu3" [ref=e109] [cursor=pointer]:
                - /url: https://x.com/buildingcultu3
                - img [ref=e110]
              - link "Telegram" [ref=e112] [cursor=pointer]:
                - /url: https://t.me/+4zFH7-2tyW0yOTBk
                - img [ref=e113]
              - link "Discord" [ref=e116] [cursor=pointer]:
                - /url: https://discord.gg/geUpHt3eSb
                - img [ref=e117]
          - generic [ref=e119]:
            - generic [ref=e120]:
              - paragraph [ref=e121]: Product
              - list [ref=e122]:
                - listitem [ref=e123]:
                  - link "Culture ID" [ref=e124] [cursor=pointer]:
                    - /url: /pass
                    - img [ref=e126]
                    - text: Culture ID
                - listitem [ref=e135]:
                  - link "Credentials" [ref=e136] [cursor=pointer]:
                    - /url: /credentials
                    - img [ref=e138]
                    - text: Credentials
                - listitem [ref=e140]:
                  - link "Reputation" [ref=e141] [cursor=pointer]:
                    - /url: /credentials/leaderboard
                    - img [ref=e143]
                    - text: Reputation
            - generic [ref=e149]:
              - paragraph [ref=e150]: Community
              - list [ref=e151]:
                - listitem [ref=e152]:
                  - link "Mission" [ref=e153] [cursor=pointer]:
                    - /url: /mission
                    - img [ref=e155]
                    - text: Mission
                - listitem [ref=e157]:
                  - link "Story" [ref=e158] [cursor=pointer]:
                    - /url: /story
                    - img [ref=e160]
                    - text: Story
                - listitem [ref=e162]:
                  - link "Team" [ref=e163] [cursor=pointer]:
                    - /url: /team
                    - img [ref=e165]
                    - text: Team
                - listitem [ref=e170]:
                  - link "FAQ" [ref=e171] [cursor=pointer]:
                    - /url: /faq
                    - img [ref=e173]
                    - text: FAQ
                - listitem [ref=e176]:
                  - link "Site guide" [ref=e177] [cursor=pointer]:
                    - /url: /guide
                    - img [ref=e179]
                    - text: Site guide
            - generic [ref=e182]:
              - paragraph [ref=e183]: Ecosystem
              - list [ref=e184]:
                - listitem [ref=e185]:
                  - link "Ecosystem Hub" [ref=e186] [cursor=pointer]:
                    - /url: /ecosystem
                    - img [ref=e188]
                    - text: Ecosystem Hub
            - generic [ref=e192]:
              - paragraph [ref=e193]: Capital
              - list [ref=e194]:
                - listitem [ref=e195]:
                  - link "BCC" [ref=e196] [cursor=pointer]:
                    - /url: /bcc/dashboard
                    - img [ref=e198]
                    - text: BCC
                - listitem [ref=e203]:
                  - link "Investors" [ref=e204] [cursor=pointer]:
                    - /url: /investors
                    - img [ref=e206]
                    - text: Investors
        - generic [ref=e209]:
          - paragraph [ref=e210]: © 2026 BUILDING CULTURE — BUILT BY PEOPLE.
          - generic [ref=e211]:
            - link "Terms" [ref=e212] [cursor=pointer]:
              - /url: /legal/terms
            - link "Privacy" [ref=e213] [cursor=pointer]:
              - /url: /legal/privacy
            - link "Imprint" [ref=e214] [cursor=pointer]:
              - /url: /legal/imprint
            - link "Contact" [ref=e215] [cursor=pointer]:
              - /url: mailto:hello@buildingcultureid.space
          - paragraph [ref=e216]: Vienna · Austria · Worldwide
    - navigation:
      - generic [ref=e218]:
        - link "Hub" [ref=e219] [cursor=pointer]:
          - /url: /forest
          - img [ref=e220]
          - generic [ref=e225]: Hub
        - link "Play" [ref=e226] [cursor=pointer]:
          - /url: /play
          - img [ref=e227]
          - generic [ref=e229]: Play
        - link "Connect" [ref=e230] [cursor=pointer]:
          - /url: /connect
          - img [ref=e231]
          - generic [ref=e236]: Connect
        - link "Agents" [ref=e237] [cursor=pointer]:
          - /url: /agents/inbox
          - img [ref=e238]
          - generic [ref=e241]: Agents
        - link "You" [ref=e242] [cursor=pointer]:
          - /url: /profile
          - img [ref=e243]
          - generic [ref=e246]: You
  - button "Buy $BCC" [ref=e247]
  - button "Open Panic Switch" [ref=e249]:
    - generic [ref=e251]: Ready
    - generic: Panic
  - region "Notifications alt+T"
```