import { afterEach, describe, expect, it } from "vitest";
import { agentsPaused, econLive } from "./env.js";

describe("env flags", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("agentsPaused true for 1/true/yes", () => {
    process.env.AGENTS_PAUSED = "1";
    expect(agentsPaused()).toBe(true);
    process.env.AGENTS_PAUSED = "TRUE";
    expect(agentsPaused()).toBe(true);
  });

  it("econLive false by default", () => {
    delete process.env.ECON_LIVE;
    expect(econLive()).toBe(false);
  });

  it("econLive true when set", () => {
    process.env.ECON_LIVE = "true";
    expect(econLive()).toBe(true);
  });
});
