import { describe, expect, it } from "vitest";
import {
  hqProgressPercent,
  triple333RoundPercent,
  triple333TicketsSold,
} from "@/lib/campaign-fundraise";
import { getPacksByCampaign, HQ_FUNDRAISE_GOAL_USD } from "@/lib/packs";

describe("campaign-fundraise", () => {
  it("computes HQ percent capped at 100", () => {
    expect(hqProgressPercent(0)).toBe(0);
    expect(hqProgressPercent(HQ_FUNDRAISE_GOAL_USD / 2)).toBe(50);
    expect(hqProgressPercent(HQ_FUNDRAISE_GOAL_USD * 2)).toBe(100);
  });

  it("caps triple 333 ticket count", () => {
    expect(triple333TicketsSold(400)).toBe(333);
    expect(triple333RoundPercent(166)).toBe(50);
  });

  it("exposes campaign pack tiers", () => {
    expect(getPacksByCampaign("hq").map((p) => p.slug)).toEqual([
      "pack_77777",
      "hq_stay_77",
      "hq_cowork_177",
      "hq_founding_777",
    ]);
    expect(getPacksByCampaign("triple_333")[0]?.slug).toBe("pack_triple_333");
  });
});
