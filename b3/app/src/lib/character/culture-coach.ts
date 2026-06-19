/** BC+ Culture Coach — pixel meme scenes for quests, forest hub, and profile. */

export type CulturePillar = "identity" | "credentials" | "reputation" | "access" | "impact";

export type CoachMood = "idle" | "focus" | "win" | "guilt";

export type CultureCoachScene = {
  id: string;
  title: string;
  quote: string;
  quoteWin?: string;
  heroSrc: string;
  thumbSrc: string;
  alt: string;
  pillars?: CulturePillar[];
  questSlugs?: string[];
  mood?: CoachMood;
};

const HERO = (id: string) => `/character/${id}.webp`;
const THUMB = (id: string) => `/character/thumbs/${id}.webp`;

export const CULTURE_COACH_SCENES: CultureCoachScene[] = [
  {
    id: "historical-vs",
    title: "Historical vs Mode",
    quote: "Final round. Culture is power — put it back in our hands.",
    quoteWin: "New Game+. You own the stack.",
    heroSrc: HERO("historical-vs"),
    thumbSrc: THUMB("historical-vs"),
    alt: "Pixel art fighting game infographic comparing corporate culture vs Building Culture trust layer with Identity, Credentials, and Reputation.",
    pillars: ["identity", "credentials", "reputation", "access", "impact"],
    questSlugs: ["connect-wallet", "join-forest"],
    mood: "focus",
  },
  {
    id: "farm-vs-build",
    title: "Stop farming. Start building.",
    quote: "Don't chase pumps. Build your legacy.",
    quoteWin: "Real ROI — built different.",
    heroSrc: HERO("farm-vs-build"),
    thumbSrc: THUMB("farm-vs-build"),
    alt: "Comparison of speculator cycle vs BCC builder earning credentials and reputation.",
    pillars: ["credentials", "reputation", "impact"],
    questSlugs: ["studio-first-app", "daily-studio-build"],
    mood: "focus",
  },
  {
    id: "reputation-upgrade",
    title: "Because likes don't pay rent",
    quote: "Building. Connecting. Stacking reputation.",
    quoteWin: "Culture Rep maxed. Vibes: epic.",
    heroSrc: HERO("reputation-upgrade"),
    thumbSrc: THUMB("reputation-upgrade"),
    alt: "Old attention economy vs new reputation economy with Culture Rep score and credentials.",
    pillars: ["reputation", "credentials"],
    questSlugs: ["daily-share-post", "chronicle-mint-edition-8"],
    mood: "win",
  },
  {
    id: "meme-edition",
    title: "Building Culture — Meme Edition",
    quote: "Old flex: followers. New flex: credentials + impact.",
    quoteWin: "We're not supposed to be this based.",
    heroSrc: HERO("meme-edition"),
    thumbSrc: THUMB("meme-edition"),
    alt: "Meme comparison of vanity metrics vs verifiable Building Culture reputation stats.",
    pillars: ["reputation", "credentials", "impact"],
    questSlugs: ["daily-share-post", "daily-invite-friend"],
    mood: "win",
  },
  {
    id: "early-legend",
    title: "Early in BCC? You're pre-historic.",
    quote: "Legends never exit early. Stack legacy.",
    quoteWin: "Another day, another compounded legacy.",
    heroSrc: HERO("early-legend"),
    thumbSrc: THUMB("early-legend"),
    alt: "Early BCC holder progression from buy early to legend status with ROI portfolio stats.",
    pillars: ["impact", "access"],
    questSlugs: ["bcc-roots-stake", "visit-liquidity-hub"],
    mood: "win",
  },
  {
    id: "park-token",
    title: "Tokenize the park",
    quote: "We own it. We build it. We earn together.",
    quoteWin: "From renting attention to owning culture.",
    heroSrc: HERO("park-token"),
    thumbSrc: THUMB("park-token"),
    alt: "Old way rent-scroll-repeat vs tokenized community park owned by builders.",
    pillars: ["identity", "impact"],
    questSlugs: ["visit-marketplace", "daily-visit-ecosystem", "chronicle-mint-edition-10"],
    mood: "focus",
  },
  {
    id: "evolution",
    title: "The evolution of culture",
    quote: "Same human needs. Upgraded infrastructure.",
    quoteWin: "Culture civilization — we build legacy.",
    heroSrc: HERO("evolution"),
    thumbSrc: THUMB("evolution"),
    alt: "Timeline from Web1 read-only through Web3 own to Building Culture prove and Culture OS automate.",
    pillars: ["identity", "credentials", "reputation", "access", "impact"],
    questSlugs: ["chronicle-mint-edition-9"],
    mood: "idle",
  },
  {
    id: "relate-daily",
    title: "Everyone can relate",
    quote: "Small steps today. Big legacy tomorrow.",
    quoteWin: "Progress > perfection. Keep building.",
    heroSrc: HERO("relate-daily"),
    thumbSrc: THUMB("relate-daily"),
    alt: "Nine-panel builder day cycle from scrolling at 1am to sleeping with hope at midnight.",
    pillars: ["impact"],
    questSlugs: ["daily-checkin-onchain", "chronicle-mint-edition-7"],
    mood: "guilt",
  },
  {
    id: "relate-loop",
    title: "Better choices beat perfect days",
    quote: "1% better every day = 37x better every year.",
    quoteWin: "DO BETTER TOMORROW — and you did.",
    heroSrc: HERO("relate-loop"),
    thumbSrc: THUMB("relate-loop"),
    alt: "Daily plan-distraction-guilt loop vs choosing to build with persistent progress.",
    pillars: ["impact"],
    mood: "guilt",
  },
  {
    id: "culture-upgrade",
    title: "The upgrade humans needed",
    quote: "Stop farming attention. Start building culture.",
    heroSrc: HERO("culture-upgrade"),
    thumbSrc: THUMB("culture-upgrade"),
    alt: "Building Culture upgrade status bar at 100% with reputation economy checklist.",
    pillars: ["identity", "credentials", "reputation"],
    mood: "focus",
  },
  {
    id: "better-choices",
    title: "Better choices, big life",
    quote: "You're not lazy. You're human. Keep building.",
    heroSrc: HERO("better-choices"),
    thumbSrc: THUMB("better-choices"),
    alt: "Motivational pixel art about discipline, focus, and making better daily choices.",
    pillars: ["impact"],
    mood: "idle",
  },
  {
    id: "culture-manifesto",
    title: "One identity. One culture.",
    quote: "Create your Culture ID. Earn credentials. Build reputation.",
    heroSrc: HERO("culture-manifesto"),
    thumbSrc: THUMB("culture-manifesto"),
    alt: "Building Culture manifesto with identity credentials reputation access and impact pillars.",
    pillars: ["identity", "credentials", "reputation", "access", "impact"],
    mood: "focus",
  },
  {
    id: "reactor-cold",
    title: "Reactor cooling",
    quote: "Hashrate isn't passive — spin the Well or check in before it fades.",
    quoteWin: "Back online. The reactor hums again.",
    heroSrc: HERO("relate-daily"),
    thumbSrc: THUMB("relate-daily"),
    alt: "Culture Power reactor cooling down without daily maintenance.",
    pillars: ["impact"],
    questSlugs: ["power-daily-maintenance", "daily-checkin-onchain", "culture-well-daily"],
    mood: "guilt",
  },
  {
    id: "reactor-hot",
    title: "Reactor at full burn",
    quote: "Your Culture Power is your hashrate — stack stake, LP, and daily rituals.",
    quoteWin: "Max output. Weekly BCC loves this energy.",
    heroSrc: HERO("early-legend"),
    thumbSrc: THUMB("early-legend"),
    alt: "Culture Power reactor at maximum output with streak and multiplier active.",
    pillars: ["impact", "access"],
    questSlugs: ["power-streak-7", "power-reactor-max", "power-daily-maintenance"],
    mood: "win",
  },
  {
    id: "stake-boost",
    title: "Roots raise your ceiling",
    quote: "Lock BCC in Culture Roots — your Power multiplier climbs with conviction.",
    quoteWin: "Staked. Reactor upgraded.",
    heroSrc: HERO("early-legend"),
    thumbSrc: THUMB("early-legend"),
    alt: "Culture Roots staking boosting Culture Power multiplier.",
    pillars: ["impact"],
    questSlugs: ["bcc-roots-stake"],
    mood: "focus",
  },
  {
    id: "lp-boost",
    title: "Liquidity is leverage",
    quote: "Prove Aerodrome LP — deepen the pool, raise your farming quotient.",
    quoteWin: "LP locked in. Power tier up.",
    heroSrc: HERO("farm-vs-build"),
    thumbSrc: THUMB("farm-vs-build"),
    alt: "Aerodrome BCC liquidity position boosting Culture Power.",
    pillars: ["impact"],
    questSlugs: ["bcc-lp-proof", "visit-liquidity-hub"],
    mood: "focus",
  },
  {
    id: "pop-culture",
    title: "The Feed Explained",
    quote: "Pop culture isn't random — it's engineered attention.",
    quoteWin: "You see the game. Now you play yours.",
    heroSrc: "/chronicles/pop-culture.webp",
    thumbSrc: "/chronicles/thumbs/pop-culture.webp",
    alt: "Pixel art explaining how pop culture captures scroll attention.",
    pillars: ["impact"],
    questSlugs: ["chronicle-mint-edition-1"],
    mood: "focus",
  },
  {
    id: "the-standard",
    title: "The Standard",
    quote: "Likes are the old scoreboard. Credentials are the new one.",
    heroSrc: "/chronicles/the-standard.webp",
    thumbSrc: "/chronicles/thumbs/the-standard.webp",
    alt: "Old vanity metrics vs verifiable culture credentials standard.",
    pillars: ["credentials", "reputation"],
    questSlugs: ["chronicle-mint-edition-2"],
    mood: "focus",
  },
  {
    id: "story-begins",
    title: "Once Upon a Scroll",
    quote: "You're not background NPC energy. You're the main character.",
    heroSrc: "/chronicles/story-begins.webp",
    thumbSrc: "/chronicles/thumbs/story-begins.webp",
    alt: "Origin story pixel scene — builder as main character.",
    pillars: ["identity"],
    questSlugs: ["chronicle-mint-edition-3"],
    mood: "idle",
  },
  {
    id: "father-figure",
    title: "Father of the Culture",
    quote: "Legacy isn't inherited. It's compiled commit by commit.",
    heroSrc: "/chronicles/father-figure.webp",
    thumbSrc: "/chronicles/thumbs/father-figure.webp",
    alt: "Mentor figure pixel art about building cultural legacy.",
    pillars: ["identity", "impact"],
    questSlugs: ["chronicle-mint-edition-4"],
    mood: "focus",
  },
  {
    id: "the-gang",
    title: "The Gang Assembles",
    quote: "Crew > clout. Always.",
    heroSrc: "/chronicles/the-gang.webp",
    thumbSrc: "/chronicles/thumbs/the-gang.webp",
    alt: "Builder crew assembling — gang chapter pixel art.",
    pillars: ["access", "impact"],
    questSlugs: ["chronicle-mint-edition-5"],
    mood: "win",
  },
  {
    id: "friends-not-frienmds",
    title: "Friends (Not Frienmds)",
    quote: "Real friends roast your typos and still mint with you.",
    heroSrc: "/chronicles/friends-not-frienmds.webp",
    thumbSrc: "/chronicles/thumbs/friends-not-frienmds.webp",
    alt: "Friends chapter with intentional frienmds typo easter egg.",
    pillars: ["impact"],
    questSlugs: ["chronicle-mint-edition-6"],
    mood: "win",
  },
  {
    id: "vibe-friends",
    title: "Vibe Friends",
    quote: "Cartoon capital is cute. Culture capital is forever.",
    heroSrc: "/chronicles/vibe-friends.webp",
    thumbSrc: "/chronicles/thumbs/vibe-friends.webp",
    alt: "Finale legendary chapter — culture over cartoon capital.",
    pillars: ["reputation", "access", "impact"],
    questSlugs: ["chronicle-founder-complete", "chronicle-mint-edition-11"],
    mood: "win",
  },
];

/** Scenes rotated in the quest hero carousel. */
export const CAROUSEL_SCENE_IDS = [
  "historical-vs",
  "pop-culture",
  "farm-vs-build",
  "reputation-upgrade",
  "evolution",
  "vibe-friends",
  "meme-edition",
] as const;

const sceneById = new Map(CULTURE_COACH_SCENES.map((s) => [s.id, s]));

export function getCoachScene(id: string): CultureCoachScene | undefined {
  return sceneById.get(id);
}

export function getCarouselScenes(): CultureCoachScene[] {
  return CAROUSEL_SCENE_IDS.map((id) => sceneById.get(id)).filter(
    (s): s is CultureCoachScene => s != null,
  );
}

export function pickCoachSceneForQuest(
  questSlug: string,
  coachSceneId?: string,
): CultureCoachScene {
  if (coachSceneId) {
    const explicit = sceneById.get(coachSceneId);
    if (explicit) return explicit;
  }
  const matched = CULTURE_COACH_SCENES.find((s) => s.questSlugs?.includes(questSlug));
  if (matched) return matched;
  return CULTURE_COACH_SCENES[0]!;
}

export function pickCoachSceneByProgress(progressPercent: number): CultureCoachScene {
  if (progressPercent >= 100) return getCoachScene("early-legend") ?? CULTURE_COACH_SCENES[0]!;
  if (progressPercent >= 76) return getCoachScene("reputation-upgrade") ?? CULTURE_COACH_SCENES[0]!;
  if (progressPercent >= 26) return getCoachScene("farm-vs-build") ?? CULTURE_COACH_SCENES[0]!;
  return getCoachScene("relate-daily") ?? CULTURE_COACH_SCENES[0]!;
}

export function pickProfileMoodScene(progressPercent: number): CultureCoachScene {
  return pickCoachSceneByProgress(progressPercent);
}

export const PILLAR_LABELS: Record<CulturePillar, string> = {
  identity: "Identity",
  credentials: "Credentials",
  reputation: "Reputation",
  access: "Access",
  impact: "Impact",
};

export const PILLAR_COLORS: Record<CulturePillar, string> = {
  identity: "#C5FF41",
  credentials: "#00E5FF",
  reputation: "#FFD700",
  access: "#A78BFA",
  impact: "#F472B6",
};
