import { describe, expect, it } from "vitest";
import { buildMonthlyMintCounts, filterEligibleRecipients, defaultPolicy } from "./policy.js";
import type { CommunityProfileRow } from "./strapi-profiles.js";

const profiles: CommunityProfileRow[] = [
  { documentId: "1", slug: "a", displayName: "A", ownerAddress: "0x1111111111111111111111111111111111111111" },
  { documentId: "2", slug: "b", displayName: "B", ownerAddress: "0x2222222222222222222222222222222222222222" },
];

describe("policy", () => {
  it("rejects recipients who already received ok mint this month", () => {
    const now = new Date("2026-05-15T12:00:00.000Z");
    const ledger = [
      {
        action: "chain.ags_mint_transfer",
        status: "ok",
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
        params: { recipient: profiles[0]!.ownerAddress },
      },
    ];
    const counts = buildMonthlyMintCounts(ledger, now);
    const eligible = filterEligibleRecipients(profiles, counts, undefined, defaultPolicy);
    expect(eligible.map((e) => e.slug)).toEqual(["b"]);
  });

  it("ignores non-ok ledger rows for recipient caps", () => {
    const now = new Date("2026-05-15T12:00:00.000Z");
    const ledger = [
      {
        action: "chain.ags_mint_transfer",
        status: "skipped",
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
        params: { recipient: profiles[0]!.ownerAddress },
      },
    ];
    const counts = buildMonthlyMintCounts(ledger, now);
    const eligible = filterEligibleRecipients(profiles, counts, undefined, {
      ...defaultPolicy,
      maxRecipientsPerTick: 10,
    });
    expect(eligible.length).toBe(2);
  });
});
