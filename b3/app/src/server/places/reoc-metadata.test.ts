import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReocMetadata, getCatalogProperty, rwaShareIconUrl } from "./reoc-metadata.ts";

describe("reoc-metadata", () => {
  it("catalog has 8 properties with share tokens", () => {
    for (let id = 1; id <= 8; id++) {
      const entry = getCatalogProperty(id);
      assert.ok(entry, `missing catalog entry ${id}`);
      assert.match(entry.shareToken ?? "", /^0x[a-fA-F0-9]{40}$/);
    }
  });

  it("buildReocMetadata returns REOC v1 shape for property 1", () => {
    const req = new Request("https://app.buildingcultureid.space/places/api/reoc/1");
    const meta = buildReocMetadata(1, req);
    assert.ok(meta);
    assert.equal(meta.reocVersion, "1.0.0");
    assert.equal(meta.propertyId, "1");
    assert.equal(meta.chainId, 8453);
    assert.ok(meta.documents.length >= 2);
    assert.equal(meta.image, rwaShareIconUrl("https://app.buildingcultureid.space"));
    assert.ok(meta.token?.address);
    assert.equal(meta.token?.symbol, "OG1");
  });

  it("returns null for unknown property", () => {
    assert.equal(buildReocMetadata(999), null);
  });
});
