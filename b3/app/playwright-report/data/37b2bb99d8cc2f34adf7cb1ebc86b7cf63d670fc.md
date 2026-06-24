# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: baseline-capture.spec.ts >> baseline route capture >> loads /hq without browser errors
- Location: e2e/baseline-capture.spec.ts:26:5

# Error details

```
Error: Unexpected browser errors:
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

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 9

- Array []
+ Array [
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
+   "[pageerror] Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
+ SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
+     at <anonymous>:4:7
+     at <anonymous>:5:7",
+   "[console.error] Failed to load resource: the server responded with a status of 403 ()",
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
    - generic [ref=e8]:
      - banner [ref=e9]:
        - generic [ref=e10]:
          - paragraph [ref=e11]: Culture HQ · 77777
          - generic [ref=e12]: Sleep, ship, and host — Culture HQ
          - paragraph [ref=e13]: A terrace, a kitchen, and a room where builders sleep, ship, and host.
          - generic [ref=e14]:
            - link "Pledge to HQ" [ref=e15] [cursor=pointer]:
              - /url: "#pledge"
              - generic [ref=e16]: Pledge to HQ
            - link "Triple 333 raffle" [ref=e17] [cursor=pointer]:
              - /url: /triple-333
              - generic [ref=e18]: Triple 333 raffle
      - article [ref=e20]:
        - generic [ref=e21]:
          - note [ref=e22]:
            - generic [ref=e23]:
              - img [ref=e24]
              - generic [ref=e26]:
                - paragraph [ref=e27]: Important — not an offer; not advice
                - paragraph [ref=e28]: This page is for discussion only. Nothing here is an offer to sell securities or a solicitation to buy. Figures are illustrative placeholders or toy scenarios—not audited forecasts, accounting, or tax advice. BCC and related mechanics may implicate regulations in your jurisdiction; retain counsel before running paid campaigns or promoting tokens.
          - generic [ref=e29]:
            - generic [ref=e30]:
              - generic [ref=e31]:
                - paragraph [ref=e32]: HQ 77777 milestone
                - paragraph [ref=e33]:
                  - text: —
                  - generic [ref=e34]: of $77,777
              - paragraph [ref=e35]: …
            - list [ref=e37]:
              - listitem [ref=e38]:
                - paragraph [ref=e39]: 25% · Lease signed
                - paragraph [ref=e40]: Deposit + first month on a 3 bed / 2 bath terrace condo.
              - listitem [ref=e41]:
                - paragraph [ref=e42]: 50% · Cowork fit-out
                - paragraph [ref=e43]: Desks, kitchen, terrace furniture, and fast internet.
              - listitem [ref=e44]:
                - paragraph [ref=e45]: 75% · Open HQ
                - paragraph [ref=e46]: Builders can book stay nights and cowork weeks.
              - listitem [ref=e47]:
                - paragraph [ref=e48]: 100% · Fully funded
                - paragraph [ref=e49]: $77,777 — live/work/host rhythm unlocked.
          - generic [ref=e50]:
            - heading "Why a headquarters" [level=2] [ref=e51]
            - list [ref=e52]:
              - listitem [ref=e53]: We're raising for a physical headquarters — not another slide deck.
              - listitem [ref=e54]: 3 bedrooms, 2 baths, a big outdoor terrace, cowork space, and a kitchen built for share-live-stay.
              - listitem [ref=e55]: Backers receive stay credits and Culture Points — not equity or yield.
            - paragraph [ref=e56]: Rewards-based crowdfunding for operational HQ perks. Not a securities offering. Availability depends on lease and local law.
          - generic [ref=e57]:
            - article [ref=e58]:
              - generic [ref=e59]:
                - img [ref=e60]
                - heading "3 bedrooms" [level=3] [ref=e64]
              - paragraph [ref=e65]: Sleep, ship, and host visiting builders.
            - article [ref=e66]:
              - generic [ref=e67]:
                - img [ref=e68]
                - heading "2 baths" [level=3] [ref=e72]
              - paragraph [ref=e73]: Shared live/work hygiene for longer stays.
            - article [ref=e74]:
              - generic [ref=e75]:
                - img [ref=e76]
                - heading "Terrace" [level=3] [ref=e80]
              - paragraph [ref=e81]: Outdoor calls, dinners, and sunset standups.
            - article [ref=e82]:
              - generic [ref=e83]:
                - img [ref=e84]
                - heading "Cowork floor" [level=3] [ref=e88]
              - paragraph [ref=e89]: Open desks + focus corners for deep work.
            - article [ref=e90]:
              - generic [ref=e91]:
                - img [ref=e92]
                - heading "Kitchen" [level=3] [ref=e96]
              - paragraph [ref=e97]: Cook together — culture happens between commits.
          - generic [ref=e98]:
            - heading "Pledge tiers · goal $77,777" [level=2] [ref=e99]
            - paragraph [ref=e100]: Card checkout via Stripe. Pledges credit Culture Points and HQ stay perks — not equity. Connect wallet first so your receipt lands on your profile.
            - generic [ref=e102]:
              - article [ref=e103]:
                - paragraph [ref=e104]: Elder
                - paragraph [ref=e105]: $77,777
                - paragraph [ref=e106]: HQ Elder — naming rights + extended stay block
                - paragraph [ref=e107]: +10,966,557 Culture Points
                - paragraph [ref=e108]: Includes supporter badge
                - button "Pledge with card" [ref=e109]
              - article [ref=e110]:
                - paragraph [ref=e111]: HQ Stay Backer
                - paragraph [ref=e112]: $77.77
                - paragraph [ref=e113]: 2 nights at Culture HQ when open
                - paragraph [ref=e114]: +8,166 Culture Points
                - button "Pledge with card" [ref=e115]
              - article [ref=e116]:
                - paragraph [ref=e117]: HQ Cowork Week
                - paragraph [ref=e118]: $177.77
                - paragraph [ref=e119]: One cowork week + terrace access
                - paragraph [ref=e120]: +19,021 Culture Points
                - button "Pledge with card" [ref=e121]
              - article [ref=e122]:
                - paragraph [ref=e123]: HQ Founding Key
                - paragraph [ref=e124]: $777.77
                - paragraph [ref=e125]: Founding stay credits + profile badge
                - paragraph [ref=e126]: +87,110 Culture Points
                - paragraph [ref=e127]: Includes supporter badge
                - button "Pledge with card" [ref=e128]
          - generic [ref=e129]:
            - strong [ref=e130]: "Ops transparency:"
            - text: aggregate progress sums verified
            - code [ref=e131]: PackPurchase
            - text: rows for HQ tiers. Treasury routing follows published policy on
            - link "/investors" [ref=e132] [cursor=pointer]:
              - /url: /investors
            - text: .
    - contentinfo [ref=e133]:
      - generic [ref=e134]:
        - generic [ref=e135]:
          - generic [ref=e136]:
            - generic [ref=e137]:
              - img "Building Culture" [ref=e138]
              - generic [ref=e139]: Building Culture
            - paragraph [ref=e140]: Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation, earn credentials, and unlock access together.
            - generic [ref=e141]:
              - link "X @buildingcultu3" [ref=e142] [cursor=pointer]:
                - /url: https://x.com/buildingcultu3
                - img [ref=e143]
              - link "Telegram" [ref=e145] [cursor=pointer]:
                - /url: https://t.me/+4zFH7-2tyW0yOTBk
                - img [ref=e146]
              - link "Discord" [ref=e149] [cursor=pointer]:
                - /url: https://discord.gg/geUpHt3eSb
                - img [ref=e150]
          - generic [ref=e152]:
            - generic [ref=e153]:
              - paragraph [ref=e154]: Product
              - list [ref=e155]:
                - listitem [ref=e156]:
                  - link "Culture ID" [ref=e157] [cursor=pointer]:
                    - /url: /pass
                    - img [ref=e159]
                    - text: Culture ID
                - listitem [ref=e168]:
                  - link "Credentials" [ref=e169] [cursor=pointer]:
                    - /url: /credentials
                    - img [ref=e171]
                    - text: Credentials
                - listitem [ref=e173]:
                  - link "Reputation" [ref=e174] [cursor=pointer]:
                    - /url: /credentials/leaderboard
                    - img [ref=e176]
                    - text: Reputation
            - generic [ref=e182]:
              - paragraph [ref=e183]: Community
              - list [ref=e184]:
                - listitem [ref=e185]:
                  - link "Mission" [ref=e186] [cursor=pointer]:
                    - /url: /mission
                    - img [ref=e188]
                    - text: Mission
                - listitem [ref=e190]:
                  - link "Story" [ref=e191] [cursor=pointer]:
                    - /url: /story
                    - img [ref=e193]
                    - text: Story
                - listitem [ref=e195]:
                  - link "Team" [ref=e196] [cursor=pointer]:
                    - /url: /team
                    - img [ref=e198]
                    - text: Team
                - listitem [ref=e203]:
                  - link "FAQ" [ref=e204] [cursor=pointer]:
                    - /url: /faq
                    - img [ref=e206]
                    - text: FAQ
                - listitem [ref=e209]:
                  - link "Site guide" [ref=e210] [cursor=pointer]:
                    - /url: /guide
                    - img [ref=e212]
                    - text: Site guide
            - generic [ref=e215]:
              - paragraph [ref=e216]: Ecosystem
              - list [ref=e217]:
                - listitem [ref=e218]:
                  - link "Ecosystem Hub" [ref=e219] [cursor=pointer]:
                    - /url: /ecosystem
                    - img [ref=e221]
                    - text: Ecosystem Hub
            - generic [ref=e225]:
              - paragraph [ref=e226]: Capital
              - list [ref=e227]:
                - listitem [ref=e228]:
                  - link "BCC" [ref=e229] [cursor=pointer]:
                    - /url: /bcc/dashboard
                    - img [ref=e231]
                    - text: BCC
                - listitem [ref=e236]:
                  - link "Investors" [ref=e237] [cursor=pointer]:
                    - /url: /investors
                    - img [ref=e239]
                    - text: Investors
        - generic [ref=e242]:
          - paragraph [ref=e243]: © 2026 BUILDING CULTURE — BUILT BY PEOPLE.
          - generic [ref=e244]:
            - link "Terms" [ref=e245] [cursor=pointer]:
              - /url: /legal/terms
            - link "Privacy" [ref=e246] [cursor=pointer]:
              - /url: /legal/privacy
            - link "Imprint" [ref=e247] [cursor=pointer]:
              - /url: /legal/imprint
            - link "Contact" [ref=e248] [cursor=pointer]:
              - /url: mailto:hello@buildingcultureid.space
          - paragraph [ref=e249]: Vienna · Austria · Worldwide
    - navigation:
      - generic [ref=e251]:
        - link "Hub" [ref=e252] [cursor=pointer]:
          - /url: /forest
          - img [ref=e253]
          - generic [ref=e258]: Hub
        - link "Play" [ref=e259] [cursor=pointer]:
          - /url: /play
          - img [ref=e260]
          - generic [ref=e262]: Play
        - link "Connect" [ref=e263] [cursor=pointer]:
          - /url: /connect
          - img [ref=e264]
          - generic [ref=e269]: Connect
        - link "Agents" [ref=e270] [cursor=pointer]:
          - /url: /agents/inbox
          - img [ref=e271]
          - generic [ref=e274]: Agents
        - link "You" [ref=e275] [cursor=pointer]:
          - /url: /profile
          - img [ref=e276]
          - generic [ref=e279]: You
  - button "Buy $BCC" [ref=e280]
  - button "Open Panic Switch" [ref=e282]:
    - generic [ref=e284]: Ready
    - generic: Panic
  - region "Notifications alt+T"
```