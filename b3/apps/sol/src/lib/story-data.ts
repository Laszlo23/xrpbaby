export type StoryBeat = {
  id: string;
  phase: "dark" | "turn" | "bright" | "together";
  label: string;
  headline: string;
  body: string;
  pullQuote?: string;
};

export const STORY_BEATS: StoryBeat[] = [
  {
    id: "nothing-worked",
    phase: "dark",
    label: "Where I started",
    headline: "Nothing really worked.",
    body: "I wasn't lazy. I wasn't stupid. I tried — hard. New apps every month. New promises every Monday. I'd white-knuckle through a week, feel proud for forty-eight hours, then slide back into the same room, the same habits, the same person I swore I wasn't anymore.",
    pullQuote: "I kept restarting my life without ever finishing a chapter.",
  },
  {
    id: "the-noise",
    phase: "dark",
    label: "The noise",
    headline: "Everything was loud. Nothing was mine.",
    body: "Podcasts at 2x speed. Highlighted PDFs I never opened. Motivation that evaporated by lunch. I collected frameworks like trophies and still woke up feeling behind — behind on work, behind on health, behind on the version of me I kept describing but never becoming.",
  },
  {
    id: "the-cost",
    phase: "dark",
    label: "What it cost",
    headline: "I was disappearing in small pieces.",
    body: "Missed mornings. Broken promises to myself. Conversations I avoided. The worst part wasn't failing — it was starting to believe that maybe I was just someone who doesn't follow through. That story hurt more than any hangover, any lost weekend, any reset I never finished.",
    pullQuote: "The identity I was living didn't match the one I wanted.",
  },
  {
    id: "one-thing",
    phase: "turn",
    label: "The turn",
    headline: "Then I stopped trying everything. I picked one thing.",
    body: "Not ten habits. Not a full life overhaul by Friday. One track. One daily ritual. One honest check-in — morning and night. I stopped negotiating with myself and started building on a single foundation: show up, log it, prove it, repeat.",
    pullQuote: "Stick to one thing long enough and the noise finally goes quiet.",
  },
  {
    id: "stick",
    phase: "turn",
    label: "What sticking looked like",
    headline: "Boring days became the breakthrough.",
    body: "Day 3 wasn't cinematic. Day 5 wasn't a montage. It was mood logged, journal written, one deliverable done, streak kept alive. Small, unglamorous, real. The compound effect wasn't inspiration — it was evidence stacking until I couldn't deny who I was becoming.",
  },
  {
    id: "proof",
    phase: "bright",
    label: "Proof, not vibes",
    headline: "I didn't need more motivation. I needed proof.",
    body: "When the hard days came — and they still do — I didn't reach for a quote. I opened my proof wall: mood lines trending up, journal entries from week one, deliverables marked done. Future me had ammo. That changed everything.",
  },
  {
    id: "identity",
    phase: "bright",
    label: "The shift",
    headline: "I became someone my past self wouldn't recognize.",
    body: "Not overnight. Not perfectly. But clearly. Sober mornings. Clear evenings. A declaration I actually signed. A build focus instead of scattered ambition. For the first time, my calendar and my identity pointed the same direction.",
    pullQuote: "Transformation stopped being a fantasy and became a record.",
  },
  {
    id: "together",
    phase: "together",
    label: "Why RESET exists",
    headline: "Nobody should have to build alone.",
    body: "I built RESET because the road works — but only if you don't walk it in isolation. Daily rituals. Verified proof. Partner income when you help someone start. At least half of every membership fee locks as BCC and stakes in the community pool — your commitment compounds with everyone else's. Same road. Different stories. One commitment: build one thing and stick to it.",
  },
];

export const STORY_FUNNEL_STEPS = [
  { step: "01", title: "Feel the cost", desc: "Name what staying the same is doing to you." },
  { step: "02", title: "Pick one track", desc: "Sober, identity, discipline — not all at once." },
  { step: "03", title: "Show up daily", desc: "Mood, journal, deliverables — evidence, not hype." },
  { step: "04", title: "Anchor your proof", desc: "Make progress real. Unlock what you've earned." },
  { step: "05", title: "Bring someone with you", desc: "50%+ of fees lock as BCC and stake together. Help each other. Earn as a tribe." },
] as const;
