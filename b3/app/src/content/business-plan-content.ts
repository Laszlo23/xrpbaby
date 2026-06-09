export type PlanSectionId =
  | "overview"
  | "market"
  | "product"
  | "economics"
  | "competition";

export type PlanStat = { label: string; value: string; detail?: string };

export type PlanBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "stats"; items: PlanStat[] };

export type PlanSubsection = {
  id: string;
  title: string;
  blocks: PlanBlock[];
};

export type PlanChapter = {
  id: PlanSectionId;
  label: string;
  description: string;
  subsections: PlanSubsection[];
};

export const PLAN_SECTIONS: PlanChapter[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Mission, thesis, and seed-round framing.",
    subsections: [
      {
        id: "introduction",
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "Building Culture sits at the intersection of real estate, community ownership, and cryptocurrency. Institutional gatekeepers, high capital requirements, and opaque decision-making exclude ordinary people from property while thousands of valuable buildings sit dormant across Europe and North America. Our mission is to democratize ownership through on-chain verification and transparent mechanics for people aged 18–40, diaspora communities seeking value-aligned investments, and builders seeking community-driven capital.",
          },
          {
            type: "paragraph",
            text: "Twelve interconnected applications form one ecosystem: Building Culture App (asset management OS), Building Culture Home (discovery), Building Culture ID (.culture domains on Base, ~$1.11 per claim), Building Culture Art (cultural collectibles), BUILDCHAIN (onboarding, compliance, credentialing), Building Culture Coin ($BCC earned via XP for tickets and governance), and WohnAI (AI agent for Vienna/Austria).",
          },
          {
            type: "stats",
            items: [
              { label: "Total addressable market", value: "$400B+", detail: "Europe + North America" },
              { label: "Development segment", value: "$180B", detail: "Annual RE development" },
              { label: "Property management", value: "$125B", detail: "Annual market" },
              { label: "Community ownership", value: "$95B", detail: "Emerging cultural investment" },
            ],
          },
        ],
      },
      {
        id: "seed-round",
        title: "Market opportunity & seed round",
        blocks: [
          {
            type: "paragraph",
            text: "Revenue projections assume domain fees, BUILDCHAIN transaction volume, and $BCC allocations in Year 1, European and North American pilots in Year 2, and full ecosystem adoption across fintech, HR, and governance services in Year 3. The team brings 40+ cumulative years across blockchain, real estate finance, product design, and community organizing.",
          },
          {
            type: "stats",
            items: [
              { label: "Year 1 revenue", value: "$2.8M", detail: "Domains, volume, token allocations" },
              { label: "Year 2 revenue", value: "$12.4M", detail: "EU + NA pilots" },
              { label: "Year 3 revenue", value: "$34.7M", detail: "Full ecosystem" },
              { label: "Seed ask", value: "$3.2M", detail: "12-product rollout, EU compliance, WohnAI, expansion" },
            ],
          },
          {
            type: "bullets",
            items: [
              "Use of funds: accelerate 12-product ecosystem, compliance infrastructure in Europe, WohnAI integration, geographic expansion (Vienna → DACH → US).",
              "Brand: earth-tone palette (rust, clay, stone), clean typography, human connection over technological abstraction.",
              "Vision (5–10 years): 500+ properties under community stewardship; $2B+ in asset value on-platform; default OS for developers, municipalities, and community groups.",
            ],
          },
        ],
      },
      {
        id: "strategic-thesis",
        title: "Strategic thesis",
        blocks: [
          {
            type: "paragraph",
            text: "Three converging forces create an 18–24 month window: the digital asset generation (16–35 = 45% of workforce, rejecting traditional banking), municipal openness in Austria/Germany/Portugal facing population decline, and Base blockchain maturity enabling commercial on-chain transactions with better auditability than traditional escrow.",
          },
          {
            type: "stats",
            items: [
              { label: "North star — portfolio", value: "RWA $", detail: "BUILDCHAIN stewardship, quarterly appraisals" },
              { label: "North star — retention", value: "MAU + XP", detail: "Positive XP + ≥1 tx per quarter" },
              { label: "Survival phase", value: "0–24 mo", detail: "PMF in heritage + suburban multifamily; 10k participants" },
              { label: "Scale phase", value: "24–60 mo", detail: "5+ EU markets + North America" },
            ],
          },
          {
            type: "paragraph",
            text: "Building Culture is connective tissue between community participants (agency + cultural ownership), developers and municipalities (capital-efficient financing), and institutional investors (ESG and alternative exposure). Success is measured by active property portfolio value and community participant retention — not vanity signups.",
          },
        ],
      },
    ],
  },
  {
    id: "market",
    label: "Market",
    description: "Problem size, demand trends, and validation signals.",
    subsections: [
      {
        id: "target-market",
        title: "Target market",
        blocks: [
          {
            type: "paragraph",
            text: "Primary: young adults 18–35 in Vienna, Prague, Budapest, Berlin, Lisbon, and declining North American towns (50k–500k population). Income $24k–$65k, savings $500–$3k, excluded by down payments and credit thresholds. Secondary: builders and architects 28–50 ($80k–$150k) at firms of 5–50 employees. Tertiary: cultural orgs, municipal agencies, and community land trusts seeking mixed-use redevelopment capital.",
          },
          {
            type: "stats",
            items: [
              { label: "Primary EU segment", value: "2.8M", detail: "Ages 18–35 in core cities" },
              { label: "Secondary EU", value: "1.2M", detail: "Krakow, Bucharest, Sofia, Athens" },
              { label: "Crypto-active subset", value: "340k", detail: "Already in on-chain communities" },
              { label: "North America", value: "18M+", detail: "Rustbelt + rural, ages 18–40" },
            ],
          },
        ],
      },
      {
        id: "customer-problem",
        title: "Customer problem",
        blocks: [
          {
            type: "stats",
            items: [
              { label: "Excluded from ownership", value: "80%", detail: "Global population" },
              { label: "Down payment bar", value: "15–25%", detail: "Traditional banking" },
              { label: "Vacant properties", value: "15–20M", detail: "EU + NA cities" },
              { label: "Institutional hurdle", value: "15–20%", detail: "Annual return required" },
            ],
          },
          {
            type: "bullets",
            items: [
              "Price-to-income for 18–35 buyers: 8–12× today vs 3–4× historically; credit verification takes 30–45 days.",
              "Post-industrial and rural regions lose 2–4% population annually; private equity ignores sub-$25M deals.",
              "Renters report 40% higher stress vs owner-occupants; life milestones delayed a decade or more.",
              "REITs and fractional platforms charge 10–15% fees, maintain centralized control, and create liquidity traps.",
            ],
          },
        ],
      },
      {
        id: "financing-gap",
        title: "Financing funnel & cost of exclusion",
        blocks: [
          {
            type: "paragraph",
            text: "Banks require $25k–$100k minimums plus collateral; property prices decoupled from wages 3.5–5× since 2010. Fundrise-style platforms charge 1–2.5% annual fees with opaque governance. In Austria, 68% of adults under 35 cannot qualify for mortgages despite employment.",
          },
          {
            type: "stats",
            items: [
              { label: "Young Europeans blocked", value: "42%", detail: "ECB 2023 — stable employment, no mortgage" },
              { label: "Empty units (3 cities)", value: "180k+", detail: "Vienna, Berlin, Amsterdam speculative hold" },
              { label: "Wealth delay", value: "10–15 yr", detail: "Missed 3–5% annual appreciation" },
              { label: "City tax erosion", value: "$8–15M/yr", detail: "Per secondary city" },
            ],
          },
        ],
      },
      {
        id: "opportunity-cost",
        title: "Opportunity cost & regulation",
        blocks: [
          {
            type: "stats",
            items: [
              { label: "Pilot: would invest <$1k", value: "64%", detail: "Vienna/Austria participants" },
              { label: "Abandoned RE due to complexity", value: "91%", detail: "Prior to Building Culture" },
              { label: "Unmobilized EU rent", value: "$800B", detail: "Annual" },
              { label: "Addressable vacant rent", value: "$12–18B", detail: "European vacant properties" },
            ],
          },
          {
            type: "bullets",
            items: [
              "TradFi cannot serve sub-$1k entry: banking licenses need $25–50M reserves; compliance $500k–$1M/yr; securities registration $50k–$150k per offering.",
              "Blockchain approach: transparent governance + tokenized rights at marginal compliance cost per participant.",
              "85% of developable real estate inaccessible to capital below $25M entry — our wedge is community-scale deals.",
            ],
          },
        ],
      },
      {
        id: "validation",
        title: "Market evidence",
        blocks: [
          {
            type: "stats",
            items: [
              { label: ".culture domains minted", value: "8,400+", detail: "~$1.11 native token per registration" },
              { label: "Engagement vs SaaS", value: "3.2×", detail: "Fair draw + IF/THEN participation" },
              { label: "Vacant properties (research)", value: "34,000+", detail: "Vienna + EU metros" },
              { label: "Dormant asset value", value: "$18B", detail: "Three metropolitan areas" },
            ],
          },
          {
            type: "bullets",
            items: [
              "67% of local officials in declining EU rural regions prioritize reactivating abandoned properties but lack capital mechanisms.",
              "2,400+ monthly searches for “alternative property investment Austria.”",
              "Users earn $BCC through ticket minting and fair-draw participation — willingness to pay for identity infrastructure.",
            ],
          },
        ],
      },
      {
        id: "personas",
        title: "Customer personas",
        blocks: [
          {
            type: "bullets",
            items: [
              "Marco, 27, software engineer, Vienna — $58k, €800/mo savings, BTC/ETH + DAO experience; banks skeptical of freelance income; wants property exposure.",
              "Elena, 31, architect, Prague — $52k, €2.2k saved (€15k short of mortgage); wants governance stake in neighborhood redevelopment.",
              "Dmitri, Budapest — 12-person construction firm, €680k revenue; capital constraints between cycles; BUILDCHAIN as acquisition channel.",
              "Community advocates ($35k–$70k) — place-based revitalization, 6–12 week consensus cycles, smart-contract enforcement priority.",
              "Builder-founders (25–42) — Farcaster/X/Base forums, 1–3 week evaluation, build atop BUILDCHAIN APIs.",
              "Mid-career professionals (35–50, $75k–$150k) — 4–8 week diligence, portfolio diversification, REIT comparison.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "product",
    label: "Product",
    description: "12-product ecosystem on Base and customer journey.",
    subsections: [
      {
        id: "solution",
        title: "Solution overview",
        blocks: [
          {
            type: "paragraph",
            text: "A 12-product ecosystem on Base transforms empty and underutilized properties into community-owned assets. Building Culture Home surfaces dormant real estate without credit requirements. Building Culture ID anchors a .culture domain (~$1.11) as verifiable identity and BUILDCHAIN entry. Users earn XP through voting, reviews, and governance; $BCC (ERC20 on Base) rewards engagement depth, not capital invested.",
          },
          {
            type: "bullets",
            items: [
              "Building Culture App: mint fair-draw tickets, track stakes, monitor development, exercise voting rights.",
              "vs crowdfunding: SEC compliance costs block small/mid projects; vs P2P lending: no real asset backing; vs REITs: power concentrated away from communities.",
              "WohnAI provides Vienna/Austria market intelligence; no minimum investment thresholds vs $25k–$100k elsewhere.",
            ],
          },
        ],
      },
      {
        id: "journey",
        title: "Customer journey & ecosystem",
        blocks: [
          {
            type: "bullets",
            items: [
              "Discovery → Building Culture Home listings.",
              "Registration → wallet + .culture domain.",
              "Onboarding → governance tutorials + XP mechanics.",
              "Ongoing → App asset management + property voting.",
              "Retention → $BCC, cultural recognition, social status in community.",
            ],
          },
          {
            type: "paragraph",
            text: "Live on Base in Vienna/Austria with 8,400+ domain registrations. Microservices architecture; Base L2 chosen for sub-cent tx costs, fast finality, ERC20/721 compatibility. Coinbase Wallet for onboarding; Austrian cadastral integrations for DACH title verification. Event-driven: wallet connects, inquiries, fair draws, and XP accrue as immutable Base records.",
          },
        ],
      },
      {
        id: "products",
        title: "12-product map",
        blocks: [
          {
            type: "bullets",
            items: [
              "Building Culture App — operational spine for holdings and transactions.",
              "Building Culture Home — deal-flow and dormant property discovery.",
              "Building Culture ID — .culture domains, reputation credentials.",
              "Building Culture Art — milestone NFTs and cultural storytelling.",
              "BUILDCHAIN — XP, $BCC, governance smart contracts.",
              "WohnAI — AI valuations and recommendations (Austria/Vienna).",
              "Building Culture Coin ($BCC) — participation rewards on Base.",
              "Plus satellite surfaces: marketplace, missions, pulse, places (RWA), game loop.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "economics",
    label: "Economics",
    description: "Revenue mix, pricing tiers, and unit economics.",
    subsections: [
      {
        id: "business-model",
        title: "Business model",
        blocks: [
          {
            type: "paragraph",
            text: "Multi-layer revenue capturing value across ownership and participation. Year 1 mix: BUILDCHAIN transaction fees (45%, 2.5% on claims/votes/transfers), Building Culture App licensing (25%), culture domain registrations (15%), digital collectible sales (10%), WohnAI agent commissions (5%, 12% on Vienna acquisitions).",
          },
          {
            type: "bullets",
            items: [
              "Profit-sharing partner model in Vienna — not fixed fees on governance or voting rights.",
              "$299 app tier: ~$0.78 operating profit per $1 revenue after platform costs — priority Year 2 scaling vector.",
              "Revenue by segment: professional builders 35%; community orgs 13%; geography 60% EU / 35% NA / 5% pilots.",
            ],
          },
        ],
      },
      {
        id: "pricing",
        title: "Pricing architecture",
        blocks: [
          {
            type: "stats",
            items: [
              { label: "Culture ID entry", value: "$1.11", detail: "Native token per .culture claim" },
              { label: "Semi-pro", value: "$99/mo", detail: "Up to 10 properties + quarterly reporting" },
              { label: "Professional", value: "$299/mo", detail: "Unlimited + dashboards + governance" },
              { label: "Institutional", value: "$999/mo", detail: "API + white-label for developers" },
            ],
          },
          {
            type: "bullets",
            items: [
              "Free tier: single-property read-only access.",
              "Property participation tickets: $25 (discovery) → $500 (advanced development stages).",
              "$299 tier = 15% of users but 28% of revenue — professional segment drives growth.",
              "Breakeven at $1.4M cumulative tx volume (15,500 users × $90 LTV or 8,000 pro subscribers).",
            ],
          },
        ],
      },
      {
        id: "unit-economics",
        title: "Unit economics",
        blocks: [
          {
            type: "stats",
            items: [
              { label: "Blended CAC", value: "$8.60", detail: "Y1 marketing ÷ new users" },
              { label: "Domain CAC", value: "$0.47", detail: "Organic .culture mints" },
              { label: "Blended LTV", value: "$94.30", detail: "Domain + property cohorts" },
              { label: "LTV : CAC", value: "10.9×", detail: "SaaS benchmark 3×" },
            ],
          },
          {
            type: "bullets",
            items: [
              "Domain purchasers: LTV $34, 68% 12-mo retention, 4.8% monthly churn.",
              "Property participants: LTV $187, 14-mo avg retention, 2.1% monthly churn.",
              "Payback period 2.4 months; gross margin target 71%; COGS ~8% (Base tx costs).",
              "Profitability target Month 18 at 3,200 MAU; churn target <8% monthly.",
            ],
          },
        ],
      },
      {
        id: "opex",
        title: "Year 1 operating expenses",
        blocks: [
          {
            type: "stats",
            items: [
              { label: "Total Y1 opex", value: "$1.2M", detail: "Illustrative budget" },
              { label: "Platform + chain", value: "$420k", detail: "35%" },
              { label: "Marketing", value: "$300k", detail: "25%" },
              { label: "Regulatory + legal", value: "$240k", detail: "20%" },
            ],
          },
          {
            type: "bullets",
            items: [
              "Personnel (product + ops): $168k (14%).",
              "Administrative: $72k (6%).",
              "Year 2: $3.8M revenue with opex declining to 58% of revenue.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "competition",
    label: "Moat & risk",
    description: "Defensibility, regulatory posture, and brand positioning.",
    subsections: [
      {
        id: "strategic-bets",
        title: "Strategic bets",
        blocks: [
          {
            type: "bullets",
            items: [
              "Community retention over immediate liquidity — 68% monthly retention in Vienna pilots; 12% MoM organic growth.",
              "Municipal partnerships — LOIs with 3 Austrian municipalities; 45 properties, 125,000 m² pipeline.",
              "Institutional shift — 8–12% returns acceptable with regulatory certainty; conversations with 3 pension systems + 1 family office ($18B AUM).",
            ],
          },
        ],
      },
      {
        id: "moat",
        title: "Competitive moat",
        blocks: [
          {
            type: "bullets",
            items: [
              "20 years Central Europe relationships with municipal planning — 3–5 year replication cost for competitors.",
              "BUILDCHAIN protocol: standardized property metadata, milestone escrow, dividend distribution.",
              "12-product flywheel: .culture → ID → BUILDCHAIN → App → WohnAI recommendations.",
              "First-mover .culture namespace on Base; 18–24 month parity timeline for infrastructure + EU compliance.",
              "Network effects: governance history, XP records, and cultural collectibles create switching friction.",
            ],
          },
        ],
      },
      {
        id: "defensibility",
        title: "Defensibility & barriers",
        blocks: [
          {
            type: "stats",
            items: [
              { label: "Competitor catch-up cost", value: "$80–150M", detail: "Capital to match execution" },
              { label: "Catch-up timeline", value: "24–36 mo", detail: "Without guaranteed adoption" },
              { label: "Properties required", value: "500+", detail: "To match capability" },
              { label: "Market penetration goal", value: "40%+", detail: "Properties per geography via BUILDCHAIN" },
            ],
          },
          {
            type: "bullets",
            items: [
              "Property owners accumulate non-exportable governance history (e.g. 18 months, 500+ participants, XP audit trail).",
              "Suppliers in 15–20 EU cities integrate scheduling and invoicing into the App OS.",
              "WohnAI captures discovery-stage preference data competitors cannot replicate without local presence.",
            ],
          },
        ],
      },
      {
        id: "regulatory",
        title: "Regulatory risk & mitigation",
        blocks: [
          {
            type: "paragraph",
            text: "Fragmented property, securities, and banking law across EU and North America is the primary vulnerability. A regulator treating BUILDCHAIN governance tokens as unregistered securities could freeze acquisition 6–18 months; per-market smart contract adaptation may require $15–25M legal + engineering.",
          },
          {
            type: "bullets",
            items: [
              "Proactive engagement in Vienna, Prague, Berlin before 2026.",
              "Formal regulatory advisory boards per target market.",
              "Modular smart contract templates for jurisdiction-specific compliance.",
              "On-chain transparency and community governance audit trails as long-term defense.",
              "Brand moat: Builder Chronicle narrative, Building Culture Art on Base, counter-positioning vs bank gatekeepers.",
            ],
          },
        ],
      },
    ],
  },
];

/** Illustrative planning scenarios — not live production metrics. */
export const PLAN_HERO_STATS = [
  { label: "Addressable market (scenario)", value: "$400B+", detail: "EU + NA TAM thesis" },
  { label: "Seed round (ask)", value: "$3.2M", detail: "Use-of-funds narrative" },
  { label: "Year 3 revenue (model)", value: "$34.7M", detail: "Spreadsheet projection" },
  { label: "Culture IDs (on-chain)", value: "8,400+", detail: "Verifiable via /grant-proof" },
  { label: "Properties (vision)", value: "500+", detail: "Long-horizon stewardship goal" },
  { label: "Platform TVL (target)", value: "$2B+", detail: "5–10 year horizon" },
] as const;

export const PLAN_REVENUE_YEARS = [
  { year: "Y1", value: 2.8, label: "$2.8M" },
  { year: "Y2", value: 12.4, label: "$12.4M" },
  { year: "Y3", value: 34.7, label: "$34.7M" },
] as const;

export const PLAN_REVENUE_MIX = [
  { name: "BUILDCHAIN fees", pct: 45, color: "rgb(0 82 255)" },
  { name: "App licensing", pct: 25, color: "rgb(34 197 94)" },
  { name: "Domain registrations", pct: 15, color: "rgb(234 179 8)" },
  { name: "Digital collectibles", pct: 10, color: "rgb(239 68 68)" },
  { name: "WohnAI commissions", pct: 5, color: "rgb(168 85 247)" },
] as const;

export const PLAN_DEMAND_SERIES = [
  { year: "2019", demand: 15, traditional: 0 },
  { year: "2020", demand: 15.5, traditional: 0 },
  { year: "2021", demand: 16.2, traditional: 0 },
  { year: "2022", demand: 17, traditional: 0 },
  { year: "2023", demand: 18, traditional: 0 },
] as const;

export const PLAN_LTV_CAC_SERIES = [
  { month: 0, ratio: 10 },
  { month: 3, ratio: 10.5 },
  { month: 6, ratio: 11 },
  { month: 9, ratio: 11.8 },
  { month: 12, ratio: 12.8 },
  { month: 18, ratio: 16 },
  { month: 24, ratio: 20 },
  { month: 30, ratio: 24 },
  { month: 36, ratio: 27.5 },
] as const;

export const PLAN_OPEX_MIX = [
  { name: "Platform + blockchain", pct: 35, amount: "$420k", color: "rgb(0 82 255)" },
  { name: "Marketing", pct: 25, amount: "$300k", color: "rgb(217 119 6)" },
  { name: "Regulatory + legal", pct: 20, amount: "$240k", color: "rgb(239 68 68)" },
  { name: "Personnel", pct: 14, amount: "$168k", color: "rgb(34 197 94)" },
  { name: "Administrative", pct: 6, amount: "$72k", color: "rgb(168 85 247)" },
] as const;

export const PLAN_PERSONAS = [
  {
    name: "Marco",
    role: "Software engineer · Vienna",
    age: 27,
    income: "$58k",
    hook: "DAO-native; wants property exposure without bank skepticism of freelance income.",
  },
  {
    name: "Elena",
    role: "Architect · Prague",
    age: 31,
    income: "$52k",
    hook: "€2.2k saved — €15k short of mortgage bar; wants neighborhood governance stake.",
  },
  {
    name: "Dmitri",
    role: "Builder · Budapest",
    age: null,
    income: "€680k firm revenue",
    hook: "12-person crew; uses BUILDCHAIN as capital + customer acquisition channel.",
  },
] as const;
