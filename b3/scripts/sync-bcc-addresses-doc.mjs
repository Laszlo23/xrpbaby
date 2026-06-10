#!/usr/bin/env node
/**
 * Merge contracts/deployments/bcc-8453.json into docs/ADDRESSES.json (bcc section).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bccFile = path.join(root, "contracts", "deployments", "bcc-8453.json");
const addressesFile = path.join(root, "docs", "ADDRESSES.json");

function main() {
  const bcc = JSON.parse(fs.readFileSync(bccFile, "utf8"));
  const doc = JSON.parse(fs.readFileSync(addressesFile, "utf8"));
  const contracts = bcc.contracts ?? {};

  doc.updated = new Date().toISOString().slice(0, 10);
  doc.networks = doc.networks ?? {};
  doc.networks["8453"] = doc.networks["8453"] ?? { name: "Base" };
  doc.networks["8453"].bcc = {
    BCC: bcc.bccToken ?? contracts.BCC ?? "",
    BCD_legacy: doc.networks["8453"].bcc?.BCD_legacy ?? "",
    BccRootsStaking: contracts.BccRootsStaking ?? "",
    BccTwapOracle: contracts.BccTwapOracle ?? "",
    MockBccUsdOracle: contracts.MockBccUsdOracle ?? "",
    CultureLayerIdentityV2: contracts.CultureLayerIdentityV2 ?? "",
    BuildingCultureHubV2: contracts.BuildingCultureHubV2 ?? "",
    BuildingCultureTicketV2: contracts.BuildingCultureTicketV2 ?? "",
    PrimaryShareSaleBcc: contracts.PrimaryShareSaleBcc ?? "",
  };

  if (bcc.networks?.["84532"]?.contracts?.BccRootsStaking) {
    doc.networks["84532"] = doc.networks["84532"] ?? { name: "Base Sepolia" };
    doc.networks["84532"].bcc = {
      BccRootsStaking: bcc.networks["84532"].contracts.BccRootsStaking,
    };
  }

  const sepFile = path.join(root, "contracts", "deployments", "bcc-84532.json");
  if (fs.existsSync(sepFile)) {
    const sep = JSON.parse(fs.readFileSync(sepFile, "utf8"));
    const sepAddr = sep.contracts?.BccRootsStaking;
    if (sepAddr) {
      doc.networks["84532"] = doc.networks["84532"] ?? { name: "Base Sepolia", explorer: "https://sepolia.basescan.org" };
      doc.networks["84532"].bcc = doc.networks["84532"].bcc ?? {};
      doc.networks["84532"].bcc.BccRootsStaking = sepAddr;
    }
  }

  fs.writeFileSync(addressesFile, `${JSON.stringify(doc, null, 2)}\n`);
  console.log("Updated", addressesFile);
}

main();
