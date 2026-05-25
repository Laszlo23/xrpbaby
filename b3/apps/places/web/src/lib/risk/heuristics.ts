/**
 * Lightweight text risk scoring (0–100). Not a substitute for KYC or chain rules.
 * Higher = more suspicious patterns (phishing, seed phrase harvest, impersonation).
 */

const PATTERNS: { re: RegExp; weight: number; flag: string }[] = [
  { re: /\b(seed phrase|recovery phrase|mnemonic|private key)\b/i, weight: 35, flag: "secrets_request" },
  { re: /\b(send (?:us )?your (?:key|password)|verify (?:your )?wallet)\b/i, weight: 30, flag: "phishing_style" },
  { re: /\b(click (?:this )?link|telegram only|whatsapp (?:me|only))\b/i, weight: 20, flag: "off_platform" },
  { re: /\b(double your|guaranteed returns?|risk[- ]free)\b/i, weight: 25, flag: "scam_marketing" },
  { re: /\b(urgent|act now|limited time)\b.*\b(send|transfer|approve)\b/i, weight: 15, flag: "urgency_payment" },
  { re: /\b(fake|impersonat|official support dm)\b/i, weight: 20, flag: "impersonation" },
];

export type RiskResult = {
  score: number;
  flags: string[];
};

export function scoreMessageText(text: string): RiskResult {
  const flags: string[] = [];
  let score = 0;
  const t = text.slice(0, 8000);
  for (const { re, weight, flag } of PATTERNS) {
    if (re.test(t)) {
      score += weight;
      flags.push(flag);
    }
  }
  score = Math.min(100, score);
  return { score, flags: [...new Set(flags)] };
}
