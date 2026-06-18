import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  requireEliasInboundSecret,
  requireOpsDashboardSecret,
  requirePlatformInternalSecret,
} from "./admin-secret.ts";

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { headers });
}

describe("admin-secret gates", () => {
  const env = process.env;

  it("requireOpsDashboardSecret fails closed when unset", () => {
    process.env = { ...env, OPS_DASHBOARD_SECRET: "" };
    const result = requireOpsDashboardSecret(requestWithHeaders({}));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 503);
      assert.equal(result.error, "admin_not_configured");
    }
    process.env = env;
  });

  it("requireOpsDashboardSecret rejects wrong header", () => {
    process.env = { ...env, OPS_DASHBOARD_SECRET: "test-secret" };
    const result = requireOpsDashboardSecret(
      requestWithHeaders({ "x-ops-dashboard-secret": "wrong" }),
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
    process.env = env;
  });

  it("requirePlatformInternalSecret accepts matching header", () => {
    process.env = { ...env, PLATFORM_INTERNAL_SECRET: "internal-test" };
    const result = requirePlatformInternalSecret(
      requestWithHeaders({ "x-platform-internal-secret": "internal-test" }),
    );
    assert.equal(result.ok, true);
    process.env = env;
  });

  it("requireEliasInboundSecret fails closed when unset", () => {
    process.env = { ...env, ELIAS_INBOUND_SECRET: "" };
    const result = requireEliasInboundSecret(requestWithHeaders({}));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "inbound_not_configured");
    process.env = env;
  });
});
