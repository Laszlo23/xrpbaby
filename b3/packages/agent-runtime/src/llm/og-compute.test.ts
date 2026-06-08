import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveOgRouterConfig, ogInferenceConfigured } from "./og-compute.js";

describe("resolveOgRouterConfig", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.OG_COMPUTE_ROUTER_API_KEY;
    delete process.env.ZERO_G_ROUTER_API_KEY;
  });

  afterEach(() => {
    process.env = env;
  });

  it("returns null when no router key", () => {
    expect(resolveOgRouterConfig()).toBeNull();
    expect(ogInferenceConfigured()).toBe(false);
  });

  it("prefers OG_COMPUTE_ROUTER_API_KEY", () => {
    process.env.OG_COMPUTE_ROUTER_API_KEY = "sk-test";
    const cfg = resolveOgRouterConfig();
    expect(cfg?.apiKey).toBe("sk-test");
    expect(cfg?.baseUrl).toContain("router-api.0g.ai");
    expect(ogInferenceConfigured()).toBe(true);
  });

  it("uses testnet URL when OG_COMPUTE_NETWORK=testnet", () => {
    process.env.OG_COMPUTE_ROUTER_API_KEY = "sk-test";
    process.env.OG_COMPUTE_NETWORK = "testnet";
    const cfg = resolveOgRouterConfig();
    expect(cfg?.network).toBe("testnet");
    expect(cfg?.baseUrl).toContain("testnet");
    expect(cfg?.mode).toBe("router");
  });

  it("supports direct wallet mode", () => {
    delete process.env.OG_COMPUTE_ROUTER_API_KEY;
    process.env.OG_COMPUTE_DIRECT_API_KEY = "app-sk-test";
    process.env.OG_COMPUTE_DIRECT_URL = "https://provider.example/v1/chat/completions";
    const cfg = resolveOgRouterConfig();
    expect(cfg?.mode).toBe("direct");
    expect(cfg?.apiKey).toBe("app-sk-test");
  });
});
