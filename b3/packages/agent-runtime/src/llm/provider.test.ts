import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { openAiAllowed, resolveLlmProviderMode } from "./provider.js";

describe("resolveLlmProviderMode", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.AGENT_LLM_PROVIDER;
    delete process.env.AGENT_BOOTSTRAP_MODE;
    delete process.env.AGENT_LLM_ALLOW_OPENAI_FALLBACK;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = env;
  });

  it("defaults to 0g", () => {
    expect(resolveLlmProviderMode()).toBe("0g");
  });

  it("bootstrap mode uses auto", () => {
    process.env.AGENT_BOOTSTRAP_MODE = "1";
    expect(resolveLlmProviderMode()).toBe("auto");
  });

  it("auto allows OpenAI when key present", () => {
    process.env.AGENT_LLM_PROVIDER = "auto";
    process.env.OPENAI_API_KEY = "sk-test";
    expect(openAiAllowed()).toBe(true);
  });

  it("0g mode blocks OpenAI without fallback flag", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    expect(openAiAllowed()).toBe(false);
  });
});
