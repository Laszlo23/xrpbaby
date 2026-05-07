import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@bc/contracts-sdk": path.resolve(__dirname, "../contracts-sdk/src/index.ts"),
      "@bc/proof": path.resolve(__dirname, "../proof/src/index.ts"),
    },
  },
});
