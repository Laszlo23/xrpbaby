import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runTick } from "./dispatcher.js";

describe("dispatcher", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.AGENTS_PAUSED;
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("returns AGENTS_PAUSED without DATABASE_URL", async () => {
    process.env.AGENTS_PAUSED = "true";
    const r = await runTick({ agent: "news-writer-1" });
    expect(r).toHaveLength(1);
    expect(r[0]?.skipped).toBe("AGENTS_PAUSED");
  });

  it("throws when not paused and DATABASE_URL missing", async () => {
    process.env.AGENTS_PAUSED = "false";
    await expect(runTick({ agent: "news-writer-1" })).rejects.toThrow("DATABASE_URL");
  });
});
