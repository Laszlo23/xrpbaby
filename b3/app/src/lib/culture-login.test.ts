import { describe, expect, it } from "vitest";
import {
  loginMethodsForSurface,
  primaryLoginLabel,
  shouldAutoOpenLoginModal,
  CULTURE_PRIVY_LOGIN_METHODS,
} from "./culture-login";

describe("culture-login", () => {
  it("includes farcaster in browser login modal", () => {
    const methods = loginMethodsForSurface("browser");
    expect(methods).toContain("farcaster");
    expect(methods).toContain("email");
    expect(methods).not.toContain("wallet");
  });

  it("uses farcaster-first in mini app", () => {
    expect(loginMethodsForSurface("farcaster")[0]).toBe("farcaster");
  });

  it("email preference keeps farcaster available", () => {
    const methods = loginMethodsForSurface("browser", "email");
    expect(methods[0]).toBe("email");
    expect(methods).toContain("farcaster");
  });

  it("exports social + farcaster login method set", () => {
    expect(CULTURE_PRIVY_LOGIN_METHODS).toEqual(["farcaster", "email", "google", "apple"]);
  });

  it("labels and auto-open follow surface", () => {
    expect(primaryLoginLabel("browser")).toBe("Log in or sign up");
    expect(primaryLoginLabel("farcaster")).toBe("Continue with Farcaster");
    expect(shouldAutoOpenLoginModal("browser")).toBe(false);
    expect(shouldAutoOpenLoginModal("farcaster")).toBe(true);
  });
});
