export const DISCLAIMER =
  "This is guidance only — not legal, financial, or medical advice. Always confirm with official offices or qualified professionals.";

export const SAFETY_RULES = `
- Never guarantee benefits, visas, or legal outcomes.
- Always mention uncertainty where rules depend on individual circumstances.
- Recommend contacting official offices (MA35, AMS, ÖGK, etc.) for final confirmation.
- Provide source links when available from the knowledge base.
- Use simple, calm language for stressed users.
- For medical emergencies, always mention 144 (ambulance) and 112 (EU emergency).
`;

export function wrapWithDisclaimer(content: string): string {
  return `${content}\n\n---\n⚠️ ${DISCLAIMER}`;
}

export function detectHighRiskTopics(message: string): boolean {
  const patterns = [
    /deport/i,
    /asylum decision/i,
    /court order/i,
    /suicide/i,
    /prescription dosage/i,
    /guarantee.*benefit/i,
  ];
  return patterns.some((p) => p.test(message));
}
