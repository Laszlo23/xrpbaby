import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FEATURED_PROPERTY_IDS,
  buildPortfolioPresentation,
  getCatalogEntry,
} from "./presentations.js";
import { buildPortfolioCard } from "./buildPortfolioCard.js";

describe("places-portfolio presentations", () => {
  it("featured ids have catalog + presentation", () => {
    for (const id of FEATURED_PROPERTY_IDS) {
      assert.ok(getCatalogEntry(id), `catalog missing ${id}`);
      assert.ok(buildPortfolioPresentation(id), `presentation missing ${id}`);
    }
  });

  it("buildPortfolioCard resolves media urls", () => {
    const card = buildPortfolioCard({
      propertyId: 1,
      placesSiteOrigin: "https://places.example.com",
      detailHref: "/places/properties/1",
      sharesLabel: "12 / 1000",
    });
    assert.ok(card);
    assert.match(card!.heroImageUrl, /^https:\/\/places\.example\.com\//);
    assert.equal(card!.slug, "berggasse-35");
  });
});
