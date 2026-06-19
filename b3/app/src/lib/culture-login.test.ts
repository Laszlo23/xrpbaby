import { describe, expect, it } from "vitest";
import {
  loginMethodsForSurface,
  primaryLoginLabel,
  shouldAutoOpenLoginModal,
} from "./culture-login";

describe("culture-login", () => {
  it("uses email-first methods in browser", () => {
    expect(loginMethodsForSurface("browser")).toEqual(["email", "google", "apple"]);
    expect(loginMethodsForSurface("baseapp")).toEqual(["email", "google", "apple"]);
  });

  it("uses farcaster-first in mini app", () => {
    expect(loginMethodsForSurface("farcaster")).toEqual(["farcaster", "email", "google", "apple"]);
  });

  it("never includes wallet in loginMethods", () => {
    for (const kind of ["browser", "baseapp", "farcaster"] as const) {
      for (const pref of ["default", "email", "farcaster"] as const) {
        const methods = loginMethodsForSurface(kind, pref);
        expect(methods).not.toContain("wallet");
      }
    }
  });

  it("labels and auto-open follow surface", () => {
    expect(primaryLoginLabel("browser")).toBe("Continue with email");
    expect(primaryLoginLabel("farcaster")).toBe("Continue with Farcaster");
    expect(shouldAutoOpenLoginModal("browser")).toBe(false);
    expect(shouldAutoOpenLoginModal("farcaster")).toBe(true);
  });
});
