/**
 * Culture quiz bank: FAQ-aligned copy + generated questions from `homeDrops`.
 * Share URLs for community posts: `/play?score=<n>&total=<7>` (optional deep-link hints).
 */
import type { ExperienceCategory, HomeDrop } from "@/content/home-drops";
import { homeDrops } from "@/content/home-drops";

export const CULTURE_QUIZ_SESSION_LENGTH = 7;

const CATEGORY_LABEL: Record<ExperienceCategory, string> = {
  stay: "Stay (lodging / residence)",
  art: "Art & culture experience",
  venue: "Venue / nightlife experience",
};

export type CultureQuizQuestion = {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  /** Index after any shuffle applied at session build time */
  correctIndex: 0 | 1 | 2 | 3;
  explain: string;
};

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Shuffle answer order and fix correctIndex for the new ordering. */
export function shuffleQuestionChoices(q: CultureQuizQuestion): CultureQuizQuestion {
  const pairs = q.choices.map((text, i) => ({ text, correct: i === q.correctIndex }));
  shuffleInPlace(pairs);
  const correctIndex = pairs.findIndex((p) => p.correct) as 0 | 1 | 2 | 3;
  return {
    ...q,
    choices: [pairs[0].text, pairs[1].text, pairs[2].text, pairs[3].text],
    correctIndex,
  };
}

const STATIC_FAQ: CultureQuizQuestion[] = [
  {
    id: "faq-bcd-role",
    prompt: "In this app, Building Culture Dollar (BCD) is mainly framed as:",
    choices: [
      "A guaranteed investment return",
      "An economic and narrative layer you stack toward drops",
      "The only token used to pay gas on-chain",
      "Unrelated to ticketing or pools",
    ],
    correctIndex: 1,
    explain:
      "BCD is the app’s economic layer—a story and balance you grow toward drops; pricing UX may still settle in native gas tokens until BCD-invoice raffles ship.",
  },
  {
    id: "faq-mint-settlement",
    prompt: "When a live on-chain raffle mint is wired up, ticket payment is typically settled in:",
    choices: [
      "BCD only",
      "The chain’s native gas token (e.g. ETH on L2)",
      "Credit card only",
      "Bank wire only",
    ],
    correctIndex: 1,
    explain:
      "Today’s live campaigns settle mints in the chain’s native asset for gas; the UI may still lead with BCD as the pricing story.",
  },
  {
    id: "faq-wallet",
    prompt: "To mint tickets on a live campaign you generally need:",
    choices: [
      "Only an email signup",
      "A supported crypto wallet connected",
      "A traditional brokerage account",
      "No tools — tickets are emailed automatically",
    ],
    correctIndex: 1,
    explain:
      "On-chain minting requires a wallet so your ticket receipts live where you control keys.",
  },
  {
    id: "faq-buildchain",
    prompt: "Which line best matches how BUILDCHAIN is described here?",
    choices: [
      "A closed casino with fixed odds",
      "A playground where minted tickets can unlock real stays, art, and experiences",
      "JPEG trading only — nothing IRL",
      "Stock market access",
    ],
    correctIndex: 1,
    explain:
      "Real-world prizes plus quests/XP between drops — culture coordination, not just pixels.",
  },
  {
    id: "faq-read-rules",
    prompt: "Before buying into a pool you should:",
    choices: [
      "Assume profit because rarity sounds high",
      "Read that campaign / pool’s rules (and contract when live)",
      "Skip disclosures — social hype is enough",
      "Only check the artwork thumbnail",
    ],
    correctIndex: 1,
    explain:
      "Each drop has its own rules; smart contracts enforce what’s on-chain — read before you mint.",
  },
  {
    id: "faq-no-guarantee",
    prompt: "Does buying or claiming BCD guarantee profit or access to specific assets?",
    choices: [
      "Yes — rarity implies legal entitlement",
      "No — no guarantees; jurisdictions and drop rules vary",
      "Yes if you complete quests",
      "Only on Tuesdays",
    ],
    correctIndex: 1,
    explain:
      "Marketing frames culture and access storytelling — not investment advice; get counsel for regulated activity.",
  },
  {
    id: "faq-mission-link",
    prompt: "Where can you read more about the mission, BCD, and genesis programs?",
    choices: [
      "Only the marketplace listings",
      "The Mission page (/mission)",
      "They are not documented",
      "Only inside wallet settings",
    ],
    correctIndex: 1,
    explain:
      "Mission collects treasury narrative, roadmap, and genesis tooling when addresses are configured.",
  },
  {
    id: "faq-ticket-receipt",
    prompt: "What does your ticket NFT primarily represent in this product story?",
    choices: [
      "A bank deposit receipt",
      "An entry receipt into the pool’s draw when live",
      "Automatic prize delivery",
      "A traditional securities certificate",
    ],
    correctIndex: 1,
    explain:
      "Tickets are on-chain entries — fulfillment paths depend on the campaign and rules you accepted.",
  },
];

function shortTitle(drop: HomeDrop): string {
  const t = drop.title;
  return t.length > 42 ? `${t.slice(0, 40)}…` : t;
}

function otherCategories(exclude: ExperienceCategory): ExperienceCategory[] {
  const all: ExperienceCategory[] = ["stay", "art", "venue"];
  return all.filter((c) => c !== exclude);
}

function buildCategoryQuestions(drops: HomeDrop[]): CultureQuizQuestion[] {
  const out: CultureQuizQuestion[] = [];
  for (const d of drops) {
    if (!d.experienceCategory) continue;
    const cat = d.experienceCategory;
    const wrongCats = otherCategories(cat);
    const distractors = [
      CATEGORY_LABEL[wrongCats[0]],
      CATEGORY_LABEL[wrongCats[1]],
      "Music festival passes only",
    ];
    const choices = [CATEGORY_LABEL[cat], ...distractors] as [string, string, string, string];
    shuffleInPlace(choices);
    const correctIndex = choices.indexOf(CATEGORY_LABEL[cat]) as 0 | 1 | 2 | 3;
    out.push({
      id: `drop-cat-${d.slug}`,
      prompt: `Which experience lane best matches the pool “${shortTitle(d)}”?`,
      choices,
      correctIndex,
      explain: `Pools are tagged Stay, Art, or Venue-style experiences so you know what kind of prize you’re entering for.`,
    });
  }
  return out;
}

function buildWorthQuestion(drops: HomeDrop[]): CultureQuizQuestion | null {
  if (drops.length < 2) return null;
  const target = drops[Math.floor(Math.random() * drops.length)];
  const others = drops.filter((d) => d.slug !== target.slug);
  shuffleInPlace(others);
  const wrong = others.slice(0, 3).map((d) => shortTitle(d));
  const choices = [shortTitle(target), ...wrong] as [string, string, string, string];
  shuffleInPlace(choices);
  const correctIndex = choices.indexOf(shortTitle(target)) as 0 | 1 | 2 | 3;
  return {
    id: `drop-worth-${target.slug}`,
    prompt: `Which pool is advertised with “${target.worthLabel}”?`,
    choices,
    correctIndex,
    explain: `Each card surfaces an approximate prize band — always read the full pool story before minting.`,
  };
}

function buildWinnerModeQuestion(drops: HomeDrop[]): CultureQuizQuestion | null {
  const limited = drops.find((d) => d.winnerMode === "limited");
  if (!limited) return null;
  const wrong = drops.filter((d) => d.slug !== limited.slug).slice(0, 3);
  if (wrong.length < 3) return null;
  const choices = [shortTitle(limited), ...wrong.map((d) => shortTitle(d))] as [
    string,
    string,
    string,
    string,
  ];
  shuffleInPlace(choices);
  const correctIndex = choices.indexOf(shortTitle(limited)) as 0 | 1 | 2 | 3;
  return {
    id: "drop-winner-limited",
    prompt: `Which pool advertises “${limited.winnerCopy}” on the card?`,
    choices,
    correctIndex,
    explain: `Some pools cap how many wallets can win; others select one grand prize — check the card copy.`,
  };
}

function buildSlugQuestion(drops: HomeDrop[]): CultureQuizQuestion | null {
  const target = drops[Math.floor(Math.random() * drops.length)];
  const wrongSlugs = drops
    .filter((d) => d.slug !== target.slug)
    .map((d) => d.slug)
    .slice(0, 3);
  if (wrongSlugs.length < 3) return null;
  const choices = [target.slug, ...wrongSlugs] as [string, string, string, string];
  shuffleInPlace(choices);
  const correctIndex = choices.indexOf(target.slug) as 0 | 1 | 2 | 3;
  return {
    id: `drop-slug-${target.slug}`,
    prompt: `Which URL slug belongs to “${shortTitle(target)}”?`,
    choices,
    correctIndex,
    explain: `Drop pages live at /drops/$slug — bookmark the one you care about.`,
  };
}

function buildRarityQuestion(drops: HomeDrop[]): CultureQuizQuestion | null {
  const legendary = drops.find((d) => d.rarity === "legendary");
  if (!legendary) return null;
  const wrong = drops.filter((d) => d.slug !== legendary.slug).slice(0, 3);
  if (wrong.length < 3) return null;
  const choices = [shortTitle(legendary), ...wrong.map((d) => shortTitle(d))] as [
    string,
    string,
    string,
    string,
  ];
  shuffleInPlace(choices);
  const correctIndex = choices.indexOf(shortTitle(legendary)) as 0 | 1 | 2 | 3;
  return {
    id: "drop-rarity-legendary",
    prompt: `Which live pool is labeled legendary rarity?`,
    choices,
    correctIndex,
    explain: `Rarity is a UX signal — odds and rules still live in the campaign.`,
  };
}

function buildArtistQuestion(drops: HomeDrop[]): CultureQuizQuestion | null {
  const withArtist = drops.filter((d) => d.artist?.trim());
  if (withArtist.length < 2) return null;
  const target = withArtist[Math.floor(Math.random() * withArtist.length)];
  const wrongArtists = withArtist
    .filter((d) => d.slug !== target.slug)
    .map((d) => d.artist)
    .filter((a, i, arr) => arr.indexOf(a) === i)
    .slice(0, 3);
  if (wrongArtists.length < 3) return null;
  const choices = [target.artist, ...wrongArtists] as [string, string, string, string];
  shuffleInPlace(choices);
  const correctIndex = choices.indexOf(target.artist) as 0 | 1 | 2 | 3;
  return {
    id: `drop-artist-${target.slug}`,
    prompt: `Who is listed as the artist / curator for “${shortTitle(target)}”?`,
    choices,
    correctIndex,
    explain: `Cards credit the studio or collective behind the drop media.`,
  };
}

/** Full bank (choices not yet shuffled per session — shuffle applied when building a session). */
export /** FAQ + category + fixed rarity/winner — stable between sessions (choices reshuffled per session). */
function buildStaticQuizBank(): CultureQuizQuestion[] {
  const drops = homeDrops;
  const fixed = [buildWinnerModeQuestion(drops), buildRarityQuestion(drops)].filter(
    (q): q is CultureQuizQuestion => q != null,
  );
  const byId = new Map<string, CultureQuizQuestion>();
  for (const q of [...STATIC_FAQ, ...buildCategoryQuestions(drops), ...fixed]) {
    byId.set(q.id, q);
  }
  return [...byId.values()];
}

let staticBankCached: CultureQuizQuestion[] | null = null;

export function getCultureQuizStaticBank(): CultureQuizQuestion[] {
  if (!staticBankCached) staticBankCached = buildStaticQuizBank();
  return staticBankCached;
}

/**
 * Random session of `count` questions (default CULTURE_QUIZ_SESSION_LENGTH), unique ids,
 * each with shuffled answer positions. Pulls fresh worth/slug/artist variants each run.
 */
export function buildCultureQuizSession(
  count = CULTURE_QUIZ_SESSION_LENGTH,
): CultureQuizQuestion[] {
  const drops = homeDrops;
  const dynamic = [
    buildWorthQuestion(drops),
    buildSlugQuestion(drops),
    buildArtistQuestion(drops),
  ].filter((q): q is CultureQuizQuestion => q != null);

  const pool = [...getCultureQuizStaticBank(), ...dynamic];
  const byId = new Map<string, CultureQuizQuestion>();
  for (const q of pool) {
    byId.set(q.id, q);
  }
  const unique = [...byId.values()];
  shuffleInPlace(unique);
  const picked = unique.slice(0, Math.min(count, unique.length));
  return picked.map((q) => shuffleQuestionChoices({ ...q }));
}

export function scoreTier(score: number, total: number): string {
  if (total <= 0) return "Player";
  const ratio = score / total;
  if (ratio >= 1) return "Culture curator";
  if (ratio >= 0.71) return "Cultured";
  if (ratio >= 0.43) return "Curious";
  return "Culture novice";
}
