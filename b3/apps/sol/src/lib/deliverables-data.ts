export type DeliverableSeed = {
  slug: string;
  title: string;
  description: string;
  type: "ritual" | "audio" | "worksheet" | "video" | "checklist" | "partner-kit";
  dayNumber: number;
  trackSlug?: string;
  sortOrder: number;
  content: string;
};

export const UNIVERSAL_DAY_ZERO: DeliverableSeed[] = [
  {
    slug: "welcome-your-reset",
    title: "Welcome — Your Reset Starts Now",
    description: "5-minute orientation. What you get today and how to use it.",
    type: "video",
    dayNumber: 0,
    sortOrder: 1,
    content: `## You made the call

Most people talk about change. You showed up.

**Today you receive:**
- Your identity declaration (worksheet)
- Morning + evening ritual cards
- Partner referral kit (share & earn)
- Day 1 track protocol

**Rule one:** Do not optimize. Execute.

Watch this once, then open the next three items in order.`,
  },
  {
    slug: "identity-declaration",
    title: "Identity Declaration Worksheet",
    description: "Write who you are becoming — present tense, no apologies.",
    type: "worksheet",
    dayNumber: 0,
    sortOrder: 2,
    content: `## Identity Declaration

Fill in present tense — as if it's already true.

1. **I am the kind of person who** _______________________
2. **I no longer tolerate** _______________________
3. **My non-negotiable daily standard is** _______________________
4. **When I'm tempted to slip, I will** _______________________
5. **90 days from now, people will say I** _______________________

Sign with today's date. Screenshot it. This is your line in the sand.`,
  },
  {
    slug: "morning-evening-ritual",
    title: "Morning & Evening Ritual Cards",
    description: "10 min morning, 8 min evening — copy-paste until automatic.",
    type: "ritual",
    dayNumber: 0,
    sortOrder: 3,
    content: `## Morning (10 min)
- 2 min: water + light (window or walk)
- 3 min: read identity declaration aloud
- 3 min: breath — 4 sec in, 6 sec out, 12 cycles
- 2 min: one priority written — **only one**

## Evening (8 min)
- 2 min: phone in another room
- 3 min: journal — "What did I protect today?"
- 3 min: preview tomorrow's one priority

**Show up today. Streaks track in your dashboard.**`,
  },
  {
    slug: "partner-referral-kit",
    title: "Partner Referral Kit",
    description: "Your link, scripts, and commission breakdown — start sharing today.",
    type: "partner-kit",
    dayNumber: 0,
    sortOrder: 4,
    content: `## Share & earn

You earn when people you introduce join:

| Level | Who | You earn |
|-------|-----|----------|
| 1 | Direct partners | 30% of their plan |
| 2 | Their partners | 10% |
| 3 | Third level | 5% |

**Monthly ($19):** up to $5.70 direct per member
**Lifetime ($199):** up to $59.70 direct per member

Copy your personal link from the Partner tab. Use the scripts below — don't spam, invite.

> "I'm doing a 90-day reset — identity, habits, accountability. No crypto stuff, just real protocols. Want in?"

Payouts processed monthly once Stripe Connect is linked to your account.`,
  },
];

export const DAY_ONE_BY_TRACK: Record<string, DeliverableSeed> = {
  "sober-reset": {
    slug: "sober-day-1",
    title: "Day 1 — Sober Reset Protocol",
    description: "First 24 hours: environment, triggers, and your replacement menu.",
    type: "checklist",
    dayNumber: 1,
    trackSlug: "sober-reset",
    sortOrder: 10,
    content: `## Day 1 checklist

- [ ] Remove one trigger from your environment (app, bottle, contact, place)
- [ ] Tell one safe person you're starting today
- [ ] Write your top 3 trigger times (when cravings hit)
- [ ] Pick one replacement for each (walk, call, shower, tea, music)
- [ ] Evening: 5-minute check-in — "Did I protect the new me?"

**If you slip:** note what happened, no shame spiral. Reset tomorrow morning.`,
  },
  "new-identity": {
    slug: "identity-day-1",
    title: "Day 1 — New Identity Protocol",
    description: "Change one visible signal today — how you dress, speak, or show up.",
    type: "checklist",
    dayNumber: 1,
    trackSlug: "new-identity",
    sortOrder: 10,
    content: `## Day 1 checklist

- [ ] Pick one visible upgrade (outfit, haircut, workspace, intro line)
- [ ] Record a 60-sec voice note: "This is who I am now"
- [ ] Unfollow 10 accounts that pull you back to the old story
- [ ] Post or send one message that reflects the new standard
- [ ] Evening: mirror exercise — eye contact, say your declaration`,
  },
  "disciplined-self": {
    slug: "discipline-day-1",
    title: "Day 1 — Disciplined Self Protocol",
    description: "Block your calendar before the world steals it.",
    type: "checklist",
    dayNumber: 1,
    trackSlug: "disciplined-self",
    sortOrder: 10,
    content: `## Day 1 checklist

- [ ] Sleep window set (same wake time 7 days)
- [ ] 90-min focus block booked — phone off
- [ ] Movement minimum: 20 min walk or equivalent
- [ ] One distraction deleted from home screen
- [ ] Evening: prep clothes + workspace for tomorrow`,
  },
  "clarity-mind": {
    slug: "clarity-day-1",
    title: "Day 1 — Clarity Mind Protocol",
    description: "One brain dump, one decision, one boundary.",
    type: "checklist",
    dayNumber: 1,
    trackSlug: "clarity-mind",
    sortOrder: 10,
    content: `## Day 1 checklist

- [ ] 12-min guided silence or breath (use ritual card)
- [ ] Brain dump — 10 min, no editing
- [ ] Circle one decision you've been avoiding — decide today
- [ ] One boundary text or conversation scheduled
- [ ] Evening: write tomorrow's single priority`,
  },
  "calm-presence": {
    slug: "calm-day-1",
    title: "Day 1 — Calm Presence Protocol",
    description: "Pause before reaction — install the 6-second rule.",
    type: "checklist",
    dayNumber: 1,
    trackSlug: "calm-presence",
    sortOrder: 10,
    content: `## Day 1 checklist

- [ ] Learn the pause: 6 seconds before any sharp reply
- [ ] One appreciation message to someone in your household
- [ ] Identify your stress thermometer (1-10) at lunch and dinner
- [ ] 10 min outside without phone
- [ ] Evening: family or self check-in — "What do you need tomorrow?"`,
  },
  "purpose-path": {
    slug: "purpose-day-1",
    title: "Day 1 — Purpose Path Protocol",
    description: "Name the problem you solve — start messy, start today.",
    type: "checklist",
    dayNumber: 1,
    trackSlug: "purpose-path",
    sortOrder: 10,
    content: `## Day 1 checklist

- [ ] Write: "I help _________ who _________ to _________"
- [ ] List 5 people who already ask you for this kind of help
- [ ] Draft a $19–$49 offer (one page, plain language)
- [ ] Send one message offering to help one person this week
- [ ] Open Partner tab — your referral link is your first income lever`,
  },
};

export const UNIVERSAL_DAYS_2_7: DeliverableSeed[] = [
  {
    slug: "day-2-environment-audit",
    title: "Day 2 — Clear the Path",
    description: "Audit your environment so the new you has room to breathe.",
    type: "checklist",
    dayNumber: 2,
    sortOrder: 20,
    content: `## Build in real life, digital, or mind

Whatever you're building — a sober life, a brand, a product, calm, purpose — your environment trains you.

- [ ] Remove one object, app, or bookmark that belongs to the old story
- [ ] Add one cue for the new standard (note on desk, wallpaper, alarm label)
- [ ] Write: "The easiest way to slip today is ___" — then block it
- [ ] 10-min walk without phone — notice what your mind wants to escape to
- [ ] Evening: one sentence — "I made space for ___"`,
  },
  {
    slug: "day-3-accountability",
    title: "Day 3 — Tell One Person",
    description: "Accountability isn't performance. It's a seatbelt.",
    type: "worksheet",
    dayNumber: 3,
    sortOrder: 30,
    content: `## Accountability script

**Who I told today (name):** _______________________

**What I said (one sentence):** _______________________

**What I'm building (life / digital / mind):** _______________________

**Check-in day & time we agreed:** _______________________

**If I go quiet, they will:** _______________________

Send the message before you close this tab.`,
  },
  {
    slug: "day-4-build-stack",
    title: "Day 4 — Your Build Stack",
    description: "Name the 3 skills or habits that compound what you're creating.",
    type: "worksheet",
    dayNumber: 4,
    sortOrder: 40,
    content: `## Stack what you're building

**In real life I'm building:** _______________________

**Digitally I'm building:** _______________________

**In my mind I'm building:** _______________________

**Habit #1 (daily, <15 min):** _______________________

**Habit #2 (daily, <15 min):** _______________________

**Habit #3 (3× per week):** _______________________

Pick the smallest version. Consistency beats intensity.`,
  },
  {
    slug: "day-5-week-architecture",
    title: "Day 5 — Week Architecture",
    description: "Book the week before the week books you.",
    type: "checklist",
    dayNumber: 5,
    sortOrder: 50,
    content: `## Calendar as commitment device

- [ ] Same wake time locked for 7 days
- [ ] Three 90-min focus blocks scheduled (phone off)
- [ ] One movement block — non-negotiable
- [ ] One relationship block (call, date, family)
- [ ] One build block for digital work (ship, draft, code, post)
- [ ] Sunday 15-min preview — what's the one priority each day?`,
  },
  {
    slug: "day-6-identity-refresh",
    title: "Day 6 — Read It Aloud Again",
    description: "Identity isn't a document. It's a voice you practice.",
    type: "ritual",
    dayNumber: 6,
    sortOrder: 60,
    content: `## Six-day ritual

1. Stand up. Read your identity declaration out loud — slow.
2. Change one line if it no longer feels true. Save it.
3. Record 30 seconds: "This week I became someone who ___"
4. Send that recording to yourself (voice memo, email, notes).
5. Evening journal: "What would old me not believe I did this week?"`,
  },
  {
    slug: "day-7-week-one-proof",
    title: "Day 7 — Week One Proof",
    description: "Capture evidence. Future you will need it on the hard days.",
    type: "worksheet",
    dayNumber: 7,
    sortOrder: 70,
    content: `## Proof snapshot

**Three things I did this week that old me wouldn't:** 
1. _______________________
2. _______________________
3. _______________________

**Hardest moment and what I did instead:** _______________________

**One person who saw a difference:** _______________________

**Next week's single priority:** _______________________

Screenshot this page or copy to your journal. This is your proof wall seed.`,
  },
];

export const ALL_DELIVERABLE_SEEDS: DeliverableSeed[] = [
  ...UNIVERSAL_DAY_ZERO,
  ...Object.values(DAY_ONE_BY_TRACK),
  ...UNIVERSAL_DAYS_2_7,
];
