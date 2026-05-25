/** Short, plain-language copy for critical user paths. */

export const plainLabels = {
  landing: {
    heroSubtitle: "We help people bring empty places back to life — together, not through banks.",
    ctaExplore: "See what we build",
    ctaJoin: "Join free",
  },
  join: {
    eyebrow: "Get started",
    title: "Create your pass",
    subtitle: "Connect your wallet with one tap. One quick sign-in links you to Culture Points.",
    intentPrompt: "What do you want to do?",
    intents: {
      explore: { label: "Look around", hint: "See hubs, stories, and people." },
      build: { label: "Build", hint: "Ship projects and grow with the community." },
      gather: { label: "Meet people", hint: "Join quests and earn Culture Points." },
    },
    emailPlaceholder: "Email (optional — for updates)",
    signIn: "Sign in & go to your hub",
    signingIn: "Signing you in…",
    connectHint: "Connect your wallet above to continue.",
    errors: {
      saveFailed: "We could not save your profile. Please try again.",
      signInFailed: "Sign-in was cancelled or failed. Please try again.",
    },
    backToStory: "← Back to the story",
    alreadyInside: "Already have a pass?",
    goToHub: "Go to your community hub",
  },
  forest: {
    eyebrow: "COMMUNITY HUB",
    modulesEyebrow: "YOUR LANES",
    modulesTitle: "What you can do",
    modulesSubtitle: "Each door is part of the same movement — places, culture, and participation.",
    statsSection: "Your stats",
    pulseTitle: "Community pulse",
    pulseSubtitle: "See live growth, social streams, and daily updates",
    createPass: "Create your pass",
    readStory: "Read the story",
  },
  play: {
    tagline: "Play = drops and rewards. Win real-world art and stays with onchain tickets.",
    bottomNavPlay: "Play — drops & rewards",
  },
} as const;
