import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CULTURE_LAYERS,
  CULTURE_LAYERS_STACK_DISPLAY,
  DEFAULT_CULTURE_LAYER_ID,
  getCultureLayer,
  isCultureLayerId,
} from "./culture-layers.ts";

describe("culture-layers", () => {
  it("defines exactly 5 layers with unique ids", () => {
    assert.equal(CULTURE_LAYERS.length, 5);
    const ids = CULTURE_LAYERS.map((l) => l.id);
    assert.equal(new Set(ids).size, 5);
  });

  it("layers are numbered 1 through 5", () => {
    const numbers = CULTURE_LAYERS.map((l) => l.number).sort();
    assert.deepEqual(numbers, [1, 2, 3, 4, 5]);
  });

  it("stack display orders capital (5) first, community (1) last", () => {
    assert.equal(CULTURE_LAYERS_STACK_DISPLAY[0]?.id, "capital");
    assert.equal(CULTURE_LAYERS_STACK_DISPLAY.at(-1)?.id, "community");
  });

  it("default layer is community", () => {
    assert.equal(DEFAULT_CULTURE_LAYER_ID, "community");
  });

  it("every sub-item has a non-empty href", () => {
    for (const layer of CULTURE_LAYERS) {
      assert.ok(layer.subItems.length > 0, `${layer.id} has no sub-items`);
      for (const item of layer.subItems) {
        assert.ok(item.href.trim().length > 0, `${layer.id}/${item.id} missing href`);
      }
    }
  });

  it("getCultureLayer returns layer by id", () => {
    const layer = getCultureLayer("agents");
    assert.equal(layer.label, "Agents");
    assert.equal(layer.subItems.length, 4);
  });

  it("isCultureLayerId validates known ids", () => {
    assert.equal(isCultureLayerId("economy"), true);
    assert.equal(isCultureLayerId("invalid"), false);
  });
});
