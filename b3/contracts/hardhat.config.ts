import hardhatFoundry from "@nomicfoundation/hardhat-foundry";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatFoundry],
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  paths: {
    sources: "./src",
  },
});
