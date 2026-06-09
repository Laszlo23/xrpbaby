#!/usr/bin/env node
import fs from "node:fs";

function argValue(name, fallback = "") {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function readJsonFile(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function readSnapshotFile(path) {
  try {
    const raw = fs.readFileSync(path, "utf8").trim();
    if (!raw || raw === "null") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const matrix = readJsonFile(argValue("--matrix"));
const addresses = readJsonFile(argValue("--addresses"));
const testSnapshot = readJsonFile(argValue("--test-snapshot"));
const applicant = readJsonFile("docs/GRANT_APPLICANT.json");
const origin = argValue("--origin");
const ts = argValue("--ts");
const out = argValue("--out");

const bundle = {
  generatedAtUtc: ts,
  baseOrigin: origin,
  publicVerifierUrl: `${origin}/grant-proof`,
  verificationMatrix: matrix,
  testGateSnapshot: testSnapshot,
  applicant,
  addresses,
  contractsAuditNote: argValue("--contracts-note"),
  httpChecks: {
    agentCard: argValue("--http-agent"),
    x402Premium: argValue("--http-x402"),
    tradingHealth: argValue("--http-trading"),
    marketHealth: argValue("--http-market-health"),
    marketBcc: argValue("--http-market-bcc"),
    pulseMetrics: argValue("--http-pulse"),
    groveTick: argValue("--http-grove"),
    grantVerification: argValue("--http-grant"),
  },
  snapshots: {
    agentCard: readSnapshotFile(argValue("--agent")),
    tradingHealth: readSnapshotFile(argValue("--trading")),
    marketHealth: readSnapshotFile(argValue("--market-health")),
    marketBcc: readSnapshotFile(argValue("--market-bcc")),
    pulseMetrics: readSnapshotFile(argValue("--pulse")),
    groveTick: readSnapshotFile(argValue("--grove")),
    grantVerification: readSnapshotFile(argValue("--grant-api")),
  },
  audience: {
    ecosystem: {
      baseMainnet: {
        identity: addresses?.networks?.["8453"]?.identity?.CultureLayerIdentity,
        bcc: addresses?.networks?.["8453"]?.bcc?.BCC,
        placesRegistry: addresses?.networks?.["8453"]?.places?.PropertyRegistry,
        explorer: addresses?.networks?.["8453"]?.explorer,
      },
      ogAgentId: {
        contract: "0x0451b1d37058ad57df22d7185aabc6b0a36fc41e",
        proofUrl: `${origin}/0g/agentid`,
        explorer: "https://chainscan.0g.ai/address/0x0451b1d37058ad57df22d7185aabc6b0a36fc41e",
      },
      chainlinkComplianceDoc: "docs/CHAINLINK_RWA_COMPLIANCE.md",
    },
    socialImpact: {
      surfaces: ["/forest", "/join", "/signal", "/welcome"],
      narrative:
        "Community culture receipts — Forest, onboarding, and signal lanes for social-impact programs.",
      liveUrls: {
        forest: `${origin}/forest`,
        join: `${origin}/join`,
        signal: `${origin}/signal`,
      },
    },
    investor: {
      overviewUrl: `${origin}/investors`,
      manualRevenueProof: {
        externalPaidTransactionTxHash: "",
        settlementRecipientAddress: "",
        settlementLogReference: "",
        counterparty: "",
        notes: "",
      },
    },
  },
  scopeBoundaries: {
    econLive: "ECON_LIVE=0 — full economics gated per deploy/VERIFY_GATE.md",
    tradingAgent: "/api/trading/health may warn until trading sidecar is deployed",
    groveSocial: "X/Farcaster outbound optional until credentials are set",
    notLegalAdvice: "Technical verification pack — not a securities disclosure",
  },
  docs: {
    grantReadinessPack: "docs/GRANT_READINESS_PACK.md",
    ogHackathonJudge: "docs/0G_HACKATHON_JUDGE_README.md",
    placesGrants: "apps/places/docs/grants.md",
    investorPlaybook: "docs/INVESTOR_PROOF_PLAYBOOK.md",
  },
};

fs.writeFileSync(out, JSON.stringify(bundle, null, 2));
