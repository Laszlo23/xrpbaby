import { FEEDBACK_PASS_THRESHOLD } from "@/lib/feedback-constants";

export type FeedbackInput = {
  triedWhat: string;
  problem: string;
  suggestion?: string;
  evidenceUrl?: string;
  pagePath?: string;
  area?: string;
};

export type QualityScoreResult = {
  score: number;
  passed: boolean;
  rejectReason: string | null;
  coachingTips: string[];
};

const PRAISE_ONLY =
  /^(all good|looks good|i like it|it's great|its great|great app|nice|love it|perfect|no issues|everything works|everything is fine|i love this|awesome|amazing|10\/10|five stars|5 stars)[\s!.?]*$/i;

const FEATURE_PATTERNS = [
  /\/join\b/i,
  /\/voice\b/i,
  /\/forest\b/i,
  /\/marketplace\b/i,
  /\/tg\b/i,
  /\/profile\b/i,
  /\/grant-proof\b/i,
  /\/places\b/i,
  /marketplace/i,
  /telegram/i,
  /wallet/i,
  /identity/i,
  /bcc\b/i,
  /onboarding/i,
  /mini app/i,
  /ton connect/i,
];

const REPRO_STEPS =
  /(when i (click|tap|open|connect)|after (i|connecting|clicking)|step \d|first i|then i|i went to|i tried to|repro(duction)? steps?)/i;

const CONCRETE_OUTCOME =
  /(expected .{3,40} (but|got|instead)|error message|blank screen|stuck on|failed to|doesn't work|does not work|confus(ed|ing)|unclear|broken|crash|timeout|404|500)/i;

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenSet(s: string): Set<string> {
  return new Set(normalizeText(s).split(/\W+/).filter((t) => t.length > 2));
}

function jaccardSimilarity(a: string, b: string): number {
  const sa = tokenSet(a);
  const sb = tokenSet(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) {
    if (sb.has(t)) inter++;
  }
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function isPraiseOnly(text: string): boolean {
  const n = normalizeText(text);
  if (PRAISE_ONLY.test(n)) return true;
  const combined = n.split(/[.!?]/).every((part) => !part.trim() || PRAISE_ONLY.test(part.trim()));
  return combined && n.length < 80;
}

export function scoreFeedbackQuality(
  input: FeedbackInput,
  opts?: {
    priorProblems?: string[];
    duplicateProblemElsewhere?: boolean;
  },
): QualityScoreResult {
  const triedWhat = input.triedWhat.trim();
  const problem = input.problem.trim();
  const suggestion = input.suggestion?.trim() ?? "";
  const evidenceUrl = input.evidenceUrl?.trim() ?? "";
  const combined = `${triedWhat} ${problem} ${suggestion}`;
  const coachingTips: string[] = [];

  if (triedWhat.length < 40) {
    return {
      score: 0,
      passed: false,
      rejectReason: "tried_what_too_short",
      coachingTips: ["Describe what you tried in at least 40 characters — e.g. which page and button."],
    };
  }
  if (problem.length < 60) {
    return {
      score: 0,
      passed: false,
      rejectReason: "problem_too_short",
      coachingTips: ["Explain what went wrong in at least 60 characters — expected vs actual."],
    };
  }
  if (isPraiseOnly(problem) || (isPraiseOnly(triedWhat) && problem.length < 100)) {
    return {
      score: 0,
      passed: false,
      rejectReason: "praise_only",
      coachingTips: [
        '"All good" or "I like it" does not earn points.',
        "Tell us what confused you, what broke, or what you would change.",
      ],
    };
  }

  for (const prior of opts?.priorProblems ?? []) {
    if (jaccardSimilarity(problem, prior) >= 0.72) {
      return {
        score: 0,
        passed: false,
        rejectReason: "duplicate_submission",
        coachingTips: ["You already submitted similar feedback recently. Add new detail or wait for review."],
      };
    }
  }

  if (opts?.duplicateProblemElsewhere) {
    return {
      score: 0,
      passed: false,
      rejectReason: "spam_duplicate",
      coachingTips: ["This exact issue was already reported. Add your own experience or steps."],
    };
  }

  let score = 0;
  const featureBlob = `${combined} ${input.pagePath ?? ""} ${input.area ?? ""}`;
  if (FEATURE_PATTERNS.some((re) => re.test(featureBlob))) {
    score += 15;
  } else {
    coachingTips.push("Mention the page or feature (e.g. /join, marketplace, Telegram).");
  }

  if (REPRO_STEPS.test(combined)) {
    score += 20;
  } else {
    coachingTips.push('Add steps: "When I click…", "After connecting wallet…".');
  }

  if (CONCRETE_OUTCOME.test(combined)) {
    score += 20;
  } else {
    coachingTips.push("Describe the outcome: expected vs what happened, or the error you saw.");
  }

  if (suggestion.length >= 30) {
    score += 10;
  } else {
    coachingTips.push("Optional: a concrete suggestion (30+ chars) boosts your score.");
  }

  if (evidenceUrl.length > 8 && /^https?:\/\//i.test(evidenceUrl)) {
    score += 10;
  }

  const passed = score >= FEEDBACK_PASS_THRESHOLD;
  return {
    score: Math.min(100, score),
    passed,
    rejectReason: passed ? null : "score_below_threshold",
    coachingTips: passed ? [] : coachingTips.slice(0, 3),
  };
}
