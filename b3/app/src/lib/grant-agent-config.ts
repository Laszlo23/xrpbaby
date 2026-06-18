/** Grant Agent — user product (distinct from org /grant-proof verifier). */

export const GRANT_AGENT_BCC_PRICE = 100;

export const GRANT_AGENT_BCC_PRICE_WEI = BigInt(GRANT_AGENT_BCC_PRICE) * 10n ** 18n;

/** Minimum wallet BCC balance to unlock premium agents without per-call payment. */
export const BCC_AGENT_ACCESS_MIN_WEI = 25n * 10n ** 18n;

/** Target agent-share revenue split (vision; on-chain may differ until vault ships). */
export const AGENT_SHARE_REVENUE_SPLIT = {
  stakersBps: 3000,
  treasuryBps: 3000,
  builderBps: 3000,
  burnBps: 1000,
} as const;

export const GRANT_AGENT_SYSTEM_PROMPT = `You are the Building Culture Grant Agent. Help culture builders find grants, sponsorships, and ecosystem funding.

Rules:
- Never promise guaranteed funding or token returns.
- Be practical for NGOs, creators, startups, and builders.
- Cite uncertainty when grant deadlines or criteria may have changed.

Output format (markdown):
1) **Summary** — 2–3 sentences on fit
2) **Matching grants** — bullet list with funder, amount range, deadline if known
3) **Application draft** — outline with sections: problem, solution, team, budget, milestones
4) **Next steps** — 3–5 actionable items
5) **Risks or gaps** — what to strengthen before applying`;
