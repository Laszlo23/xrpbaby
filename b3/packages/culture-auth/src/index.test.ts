import { test } from "node:test";
import assert from "node:assert/strict";
import {
  authHubLoginUrl,
  authHubLogoutUrl,
  isAllowedReturnUrl,
  shouldUseAuthHub,
} from "./auth-hub.js";
import { isCultureNetworkId } from "./networks.js";

test("auth hub URLs encode returnUrl", () => {
  const url = authHubLoginUrl("https://art.buildingcultureid.space/mint");
  assert.match(url, /returnUrl=/);
  assert.ok(url.startsWith("https://app.buildingcultureid.space/auth/login"));
});

test("auth hub logout URL", () => {
  const url = authHubLogoutUrl("https://buildingcultureid.space/");
  assert.ok(url.includes("/auth/logout"));
});

test("shouldUseAuthHub detects cross-origin", () => {
  assert.equal(
    shouldUseAuthHub("https://buildingcultureid.space", "https://app.buildingcultureid.space"),
    true,
  );
  assert.equal(
    shouldUseAuthHub("https://app.buildingcultureid.space", "https://app.buildingcultureid.space"),
    false,
  );
});

test("isAllowedReturnUrl accepts ecosystem domains", () => {
  assert.equal(isAllowedReturnUrl("https://art.buildingcultureid.space/"), true);
  assert.equal(isAllowedReturnUrl("https://bcdai.buildingcultureid.space/"), true);
  assert.equal(isAllowedReturnUrl("https://0x.buildingculture.capital/"), true);
  assert.equal(isAllowedReturnUrl("https://evil.example/phish"), false);
});

test("isCultureNetworkId", () => {
  assert.equal(isCultureNetworkId("base"), true);
  assert.equal(isCultureNetworkId("eth"), false);
});
