# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: identity-resolve.spec.ts >> culture name resolution >> laszlo.culture shows identity graph when enrichment available
- Location: e2e/identity-resolve.spec.ts:59:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Identity Graph', { exact: true }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText('Identity Graph', { exact: true }).first()

```

```
Error: Unexpected browser errors:
[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)
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

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   "[console.error] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
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
    - generic [ref=e10]:
      - link "← Forest" [ref=e11] [cursor=pointer]:
        - /url: /forest
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]:
            - img "Laszlo Bihary" [ref=e18]
            - generic [ref=e19]:
              - generic [ref=e20]:
                - paragraph [ref=e21]: Culture Layer · Founder profile
                - heading "Building Culture." [level=1] [ref=e22]
                - paragraph [ref=e23]:
                  - text: laszlo
                  - generic [ref=e24]: .culture
                  - generic [ref=e25]: · Laszlo Bihary
              - generic [ref=e26]:
                - generic [ref=e27]: Founder
                - generic [ref=e28]: Base mainnet
                - generic [ref=e29]: Founding member
                - generic [ref=e30]: "Culture Layer token #1"
                - generic [ref=e31]: Transferable
              - generic [ref=e32]:
                - paragraph [ref=e33]: A reputation layer for humans, builders, communities and AI agents.
                - paragraph [ref=e34]: Turning participation into ownership.
                - paragraph [ref=e35]: Turning culture into capital.
                - paragraph [ref=e36]: Turning identity into proof.
              - generic [ref=e37]:
                - link "0x502c…C2e1" [ref=e38] [cursor=pointer]:
                  - /url: https://basescan.org/address/0x502ce9FB1814cb03843967EC5E0D8F6AA3A3C2e1
                - generic [ref=e39]: Minted May 16, 2026
              - generic [ref=e40]:
                - link "Explore Building Culture" [ref=e41] [cursor=pointer]:
                  - /url: /products/ai-agents
                - link "Follow on Warpcast" [ref=e42] [cursor=pointer]:
                  - /url: https://warpcast.com/bihary41418
                  - text: Follow on Warpcast
                  - img
                - link "Contact" [ref=e43] [cursor=pointer]:
                  - /url: mailto:laszlo.bihary@gmail.com
                  - img
                  - text: Contact
                - link "Partner" [ref=e44] [cursor=pointer]:
                  - /url: mailto:laszlo.bihary@gmail.com?subject=Building%20Culture%20partnership
                  - img
                  - text: Partner
          - generic [ref=e46]:
            - paragraph [ref=e47]: "Share: http://127.0.0.1:3000/id/laszlo.culture"
            - paragraph [ref=e48]: Connect owner wallet to verify
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e53]: "4"
              - generic [ref=e54]:
                - paragraph [ref=e55]: Culture XP
                - paragraph [ref=e56]: 866 XP
                - paragraph [ref=e57]: 506 / 280 to Level 5
            - generic [ref=e58]:
              - generic [ref=e59]: Level 4
              - generic [ref=e60]: Founding
              - generic [ref=e61]: Top Builder
          - paragraph [ref=e62]:
            - generic [ref=e63]: Culture Coach ·
            - text: “Another day, another compounded legacy.”
        - link "Builder Tapes 5 real stories · listen & earn Culture Points" [ref=e66] [cursor=pointer]:
          - /url: /stories/tapes
          - generic [ref=e67]:
            - img [ref=e69]
            - generic [ref=e71]:
              - paragraph [ref=e72]: Builder Tapes
              - paragraph [ref=e73]: 5 real stories · listen & earn Culture Points
        - generic [ref=e74]:
          - generic [ref=e75]:
            - heading "Building Culture Metrics" [level=2] [ref=e76]
            - paragraph [ref=e77]: Proof-first signal for investors, partners, and builders.
          - generic [ref=e78]:
            - generic [ref=e79]:
              - paragraph [ref=e80]: Followers
              - generic [ref=e81]:
                - paragraph [ref=e82]: 2,679
                - paragraph [ref=e83]: Farcaster reach
            - generic [ref=e84]:
              - paragraph [ref=e85]: Culture Score
              - generic [ref=e86]:
                - paragraph [ref=e87]: "6.801"
                - paragraph [ref=e88]: from Farcaster + onchain
            - generic [ref=e89]:
              - paragraph [ref=e90]: Products
              - generic [ref=e91]:
                - paragraph [ref=e92]: 20+
                - paragraph [ref=e93]: Ecosystem apps
            - generic [ref=e94]:
              - paragraph [ref=e95]: Founder Identity
              - generic [ref=e96]:
                - paragraph [ref=e97]: "1"
                - paragraph [ref=e98]: "Culture Layer #1"
            - generic [ref=e99]:
              - paragraph [ref=e100]: Network
              - generic [ref=e101]:
                - paragraph [ref=e102]: Base
                - paragraph [ref=e103]: Mainnet
            - generic [ref=e104]:
              - paragraph [ref=e105]: Community Owned
              - generic [ref=e106]:
                - paragraph [ref=e107]: 100%
                - paragraph [ref=e108]: Member-driven
        - generic [ref=e109]:
          - generic [ref=e110]:
            - heading "Featured Builds" [level=2] [ref=e111]
            - paragraph [ref=e112]: Products and experiments from the Building Culture founder lane.
          - generic [ref=e113]:
            - link "Building Culture Live AI-powered identity, reputation, and community layer for onchain builders. View build" [ref=e114] [cursor=pointer]:
              - /url: /
              - generic [ref=e115]:
                - generic [ref=e116]:
                  - heading "Building Culture" [level=3] [ref=e117]
                  - generic [ref=e118]: Live
                - paragraph [ref=e119]: AI-powered identity, reputation, and community layer for onchain builders.
                - paragraph [ref=e120]:
                  - text: View build
                  - img [ref=e121]
            - generic [ref=e124]:
              - generic [ref=e125]:
                - heading "Mangrove AI" [level=3] [ref=e126]
                - generic [ref=e127]: Beta
              - paragraph [ref=e128]: AI-powered tree counting and impact verification system.
              - paragraph [ref=e129]:
                - text: View build
                - img [ref=e130]
              - paragraph [ref=e133]: Link coming soon
            - link "Tokenized Real Estate Exploring Experiments around RWA, ownership, and real estate-backed digital assets. View build" [ref=e134] [cursor=pointer]:
              - /url: /products/culture-id
              - generic [ref=e135]:
                - generic [ref=e136]:
                  - heading "Tokenized Real Estate" [level=3] [ref=e137]
                  - generic [ref=e138]: Exploring
                - paragraph [ref=e139]: Experiments around RWA, ownership, and real estate-backed digital assets.
                - paragraph [ref=e140]:
                  - text: View build
                  - img [ref=e141]
            - link "Limx Revenue Agent Live Blockchain0x agent wallet on Base — x402-paid grant, partnership, and sponsor briefs. View build" [ref=e144] [cursor=pointer]:
              - /url: /agent-os#limx-agent
              - generic [ref=e145]:
                - generic [ref=e146]:
                  - heading "Limx Revenue Agent" [level=3] [ref=e147]
                  - generic [ref=e148]: Live
                - paragraph [ref=e149]: Blockchain0x agent wallet on Base — x402-paid grant, partnership, and sponsor briefs.
                - paragraph [ref=e150]:
                  - text: View build
                  - img [ref=e151]
            - link "Agent Ecosystem Live Browser-based AI agents for growth, automation, research, and autonomous business workflows. View build" [ref=e154] [cursor=pointer]:
              - /url: /agent-os
              - generic [ref=e155]:
                - generic [ref=e156]:
                  - heading "Agent Ecosystem" [level=3] [ref=e157]
                  - generic [ref=e158]: Live
                - paragraph [ref=e159]: Browser-based AI agents for growth, automation, research, and autonomous business workflows.
                - paragraph [ref=e160]:
                  - text: View build
                  - img [ref=e161]
        - generic [ref=e164]:
          - generic [ref=e165]:
            - heading "Building Culture Ecosystem" [level=2] [ref=e166]
            - paragraph [ref=e167]: One culture layer — many products, agents, and onchain rails.
          - generic [ref=e169]:
            - generic [ref=e172]:
              - paragraph [ref=e173]: Root
              - paragraph [ref=e174]: Culture Layer
            - generic [ref=e176]:
              - generic [ref=e177]:
                - generic [ref=e178]: ├─
                - link "AI Agents" [ref=e179] [cursor=pointer]:
                  - /url: /agent-os
              - generic [ref=e180]:
                - generic [ref=e181]: ├─
                - link "Limx Revenue Agent" [ref=e182] [cursor=pointer]:
                  - /url: https://wallet.blockchain0x.com/a/limx
                  - text: Limx Revenue Agent
                  - img [ref=e183]
              - generic [ref=e187]:
                - generic [ref=e188]: ├─
                - link "Campaign Hub" [ref=e189] [cursor=pointer]:
                  - /url: /play
              - generic [ref=e190]:
                - generic [ref=e191]: ├─
                - link "Grant Proof" [ref=e192] [cursor=pointer]:
                  - /url: /grant-proof
              - generic [ref=e193]:
                - generic [ref=e194]: ├─
                - link "Culture Atlas" [ref=e195] [cursor=pointer]:
                  - /url: https://buildingcultureid.space/demo/atlas/
                  - text: Culture Atlas
                  - img [ref=e196]
              - generic [ref=e200]:
                - generic [ref=e201]: ├─
                - link "WohnAI" [ref=e202] [cursor=pointer]:
                  - /url: https://wohnai.buildingcultureid.space/
                  - text: WohnAI
                  - img [ref=e203]
              - generic [ref=e207]:
                - generic [ref=e208]: ├─
                - link "BCDAI" [ref=e209] [cursor=pointer]:
                  - /url: https://bcdai.buildingcultureid.space/
                  - text: BCDAI
                  - img [ref=e210]
              - generic [ref=e214]:
                - generic [ref=e215]: ├─
                - link "Earth Layer" [ref=e216] [cursor=pointer]:
                  - /url: /earth
              - generic [ref=e217]:
                - generic [ref=e218]: ├─
                - link "BCC Token" [ref=e219] [cursor=pointer]:
                  - /url: /mission
        - generic [ref=e220]:
          - generic [ref=e221]:
            - heading "Culture Reputation" [level=2] [ref=e223]
            - generic [ref=e224]:
              - generic [ref=e226]:
                - paragraph [ref=e227]: "6.801"
                - paragraph [ref=e228]: from Farcaster + onchain
                - generic [ref=e230]: Top 2% of Culture Layer builders
              - paragraph [ref=e231]: Culture Score combines Farcaster reach, verified wallets, onchain activity, badges, holdings, and ecosystem participation.
              - list [ref=e232]:
                - listitem [ref=e233]:
                  - generic [ref=e234]:
                    - generic [ref=e235]: Social Reach
                    - generic [ref=e236]: 28%
                - listitem [ref=e239]:
                  - generic [ref=e240]:
                    - generic [ref=e241]: Onchain Activity
                    - generic [ref=e242]: 22%
                - listitem [ref=e245]:
                  - generic [ref=e246]:
                    - generic [ref=e247]: Badges
                    - generic [ref=e248]: 15%
                - listitem [ref=e251]:
                  - generic [ref=e252]:
                    - generic [ref=e253]: Identity Age
                    - generic [ref=e254]: 12%
                - listitem [ref=e257]:
                  - generic [ref=e258]:
                    - generic [ref=e259]: Ecosystem Participation
                    - generic [ref=e260]: 23%
          - generic [ref=e263]:
            - generic [ref=e264]:
              - heading "Builder Signal" [level=2] [ref=e265]
              - paragraph [ref=e266]: Credibility markers — decades on the web, onchain, and in community.
            - generic [ref=e267]:
              - generic [ref=e268]: 25+ years building for the web
              - generic [ref=e269]: 15+ years digital marketing & SEO
              - generic [ref=e270]: Early Bitcoin & NFT adopter
              - generic [ref=e271]: Gitcoin Citizen
              - generic [ref=e272]: Building on Base
              - generic [ref=e273]: Founder of Building Culture
        - generic [ref=e274]:
          - generic [ref=e276]:
            - heading "Onchain collectibles" [level=2] [ref=e277]
            - paragraph [ref=e278]: Identity NFT and wallet-held assets on Base.
          - generic [ref=e280]:
            - generic [ref=e281]:
              - generic [ref=e282]:
                - paragraph [ref=e283]: Culture Layer
                - paragraph [ref=e284]: Identity NFT
              - generic [ref=e285]: Base
            - generic [ref=e286]:
              - paragraph [ref=e287]: laszlo.culture
              - paragraph [ref=e288]: Primary identity
        - generic [ref=e289]:
          - generic [ref=e290]:
            - generic [ref=e291]:
              - heading "Activity" [level=2] [ref=e292]
              - paragraph [ref=e293]: Platform milestones + live Farcaster signal.
            - generic [ref=e294]:
              - link "@bihary41418" [ref=e295] [cursor=pointer]:
                - /url: https://warpcast.com/bihary41418
              - generic [ref=e296]: ·
              - link "@buildingcultu3" [ref=e297] [cursor=pointer]:
                - /url: https://warpcast.com/buildingcultu3
          - generic [ref=e298]:
            - button "Product Updates" [ref=e299]
            - button "Community Posts" [ref=e300]
            - button "Onchain Activity" [ref=e301]
            - button "Social Signal" [ref=e302]
          - paragraph [ref=e304]: Live Farcaster casts appear when NEYNAR_API_KEY is configured.
        - generic [ref=e305]:
          - generic [ref=e306]:
            - heading "Discover BCIDs" [level=2] [ref=e307]
            - paragraph [ref=e308]: Portable builder identities on Base.
          - generic [ref=e309]:
            - paragraph [ref=e310]: Be among the first Human BCIDs on testnet.
            - link "Mint yours →" [ref=e311] [cursor=pointer]:
              - /url: /bcid/mint
        - generic [ref=e314]:
          - generic [ref=e315]:
            - heading "Open to builders, partners, investors, and culture-aligned collaborators." [level=2] [ref=e316]
            - paragraph [ref=e317]: Building Culture is growing into an AI-powered identity and reputation layer for creators, builders, communities, and onchain ecosystems.
          - generic [ref=e318]:
            - paragraph [ref=e319]: Looking for
            - list [ref=e320]:
              - listitem [ref=e321]: Strategic partners
              - listitem [ref=e323]: Investors
              - listitem [ref=e325]: Growth experts
              - listitem [ref=e327]: Web3 communities
              - listitem [ref=e329]: Grant opportunities
              - listitem [ref=e331]: Distribution partners
          - link "Start a conversation" [ref=e333] [cursor=pointer]:
            - /url: mailto:laszlo.bihary@gmail.com?subject=Building%20Culture%20collaboration
            - img
            - text: Start a conversation
        - generic [ref=e334]:
          - paragraph [ref=e335]: Your name. Your culture. Your onchain identity.
          - paragraph [ref=e336]: Mint a transferable Culture Layer name on Base — resolve across Building Culture and share one proof-first profile link.
          - link "Mint your Culture Layer identity" [ref=e337] [cursor=pointer]:
            - /url: /pass
        - contentinfo [ref=e338]:
          - link "Identity contract" [ref=e339] [cursor=pointer]:
            - /url: https://basescan.org/address/0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863
          - link "Claim another name" [ref=e340] [cursor=pointer]:
            - /url: /pass
    - contentinfo [ref=e341]:
      - generic [ref=e342]:
        - generic [ref=e343]:
          - generic [ref=e344]:
            - generic [ref=e345]:
              - img "Building Culture" [ref=e346]
              - generic [ref=e347]: Building Culture
            - paragraph [ref=e348]: Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation, earn credentials, and unlock access together.
            - generic [ref=e349]:
              - link "X @buildingcultu3" [ref=e350] [cursor=pointer]:
                - /url: https://x.com/buildingcultu3
                - img [ref=e351]
              - link "Telegram" [ref=e353] [cursor=pointer]:
                - /url: https://t.me/+4zFH7-2tyW0yOTBk
                - img [ref=e354]
              - link "Discord" [ref=e357] [cursor=pointer]:
                - /url: https://discord.gg/geUpHt3eSb
                - img [ref=e358]
          - generic [ref=e360]:
            - generic [ref=e361]:
              - paragraph [ref=e362]: Product
              - list [ref=e363]:
                - listitem [ref=e364]:
                  - link "Culture ID" [ref=e365] [cursor=pointer]:
                    - /url: /pass
                    - img [ref=e367]
                    - text: Culture ID
                - listitem [ref=e376]:
                  - link "Credentials" [ref=e377] [cursor=pointer]:
                    - /url: /credentials
                    - img [ref=e379]
                    - text: Credentials
                - listitem [ref=e381]:
                  - link "Reputation" [ref=e382] [cursor=pointer]:
                    - /url: /credentials/leaderboard
                    - img [ref=e384]
                    - text: Reputation
            - generic [ref=e390]:
              - paragraph [ref=e391]: Community
              - list [ref=e392]:
                - listitem [ref=e393]:
                  - link "Mission" [ref=e394] [cursor=pointer]:
                    - /url: /mission
                    - img [ref=e396]
                    - text: Mission
                - listitem [ref=e398]:
                  - link "Story" [ref=e399] [cursor=pointer]:
                    - /url: /story
                    - img [ref=e401]
                    - text: Story
                - listitem [ref=e403]:
                  - link "Team" [ref=e404] [cursor=pointer]:
                    - /url: /team
                    - img [ref=e406]
                    - text: Team
                - listitem [ref=e411]:
                  - link "FAQ" [ref=e412] [cursor=pointer]:
                    - /url: /faq
                    - img [ref=e414]
                    - text: FAQ
                - listitem [ref=e417]:
                  - link "Site guide" [ref=e418] [cursor=pointer]:
                    - /url: /guide
                    - img [ref=e420]
                    - text: Site guide
            - generic [ref=e423]:
              - paragraph [ref=e424]: Ecosystem
              - list [ref=e425]:
                - listitem [ref=e426]:
                  - link "Ecosystem Hub" [ref=e427] [cursor=pointer]:
                    - /url: /ecosystem
                    - img [ref=e429]
                    - text: Ecosystem Hub
            - generic [ref=e433]:
              - paragraph [ref=e434]: Capital
              - list [ref=e435]:
                - listitem [ref=e436]:
                  - link "BCC" [ref=e437] [cursor=pointer]:
                    - /url: /bcc/dashboard
                    - img [ref=e439]
                    - text: BCC
                - listitem [ref=e444]:
                  - link "Investors" [ref=e445] [cursor=pointer]:
                    - /url: /investors
                    - img [ref=e447]
                    - text: Investors
        - generic [ref=e450]:
          - paragraph [ref=e451]: © 2026 BUILDING CULTURE — BUILT BY PEOPLE.
          - generic [ref=e452]:
            - link "Terms" [ref=e453] [cursor=pointer]:
              - /url: /legal/terms
            - link "Privacy" [ref=e454] [cursor=pointer]:
              - /url: /legal/privacy
            - link "Imprint" [ref=e455] [cursor=pointer]:
              - /url: /legal/imprint
            - link "Contact" [ref=e456] [cursor=pointer]:
              - /url: mailto:hello@buildingcultureid.space
          - paragraph [ref=e457]: Vienna · Austria · Worldwide
  - button "Buy $BCC" [ref=e458]
  - button "Open Panic Switch" [ref=e460]:
    - generic [ref=e462]: Ready
    - generic: Panic
  - region "Notifications alt+T"
```