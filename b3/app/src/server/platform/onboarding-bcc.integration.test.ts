import assert from "node:assert/strict";
import { describe, it } from "node:test";

const integrationEnabled =
  process.env.INTEGRATION_TEST === "1" && Boolean(process.env.DATABASE_URL?.trim());

describe("onboarding BCC integration", { skip: !integrationEnabled }, () => {
  it("DATABASE_URL reachable when INTEGRATION_TEST=1", async () => {
    const { getPrisma } = await import("@/server/db/prisma.ts");
    const prisma = getPrisma();
    assert.ok(prisma, "prisma client required for integration tests");
    await prisma.$queryRaw`SELECT 1`;
  });
});

describe("onboarding BCC integration placeholder", { skip: integrationEnabled }, () => {
  it("skipped without INTEGRATION_TEST=1 and DATABASE_URL", () => {
    assert.ok(true);
  });
});
