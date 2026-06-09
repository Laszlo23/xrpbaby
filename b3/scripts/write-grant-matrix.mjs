#!/usr/bin/env node
import fs from "node:fs";

const checksFile = process.argv[2];
const origin = process.argv[3];
const matrixFile = process.argv[4];

const raw = fs.existsSync(checksFile) ? fs.readFileSync(checksFile, "utf8") : "";
const checks = raw
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const pass = checks.filter((c) => c.status === "pass").length;
const warn = checks.filter((c) => c.status === "warn").length;
const fail = checks.filter((c) => c.status === "fail").length;

const payload = {
  generatedAtUtc: new Date().toISOString(),
  origin,
  summary: { pass, warn, fail },
  checks,
};

fs.mkdirSync(matrixFile.replace(/\/[^/]+$/, ""), { recursive: true });
fs.writeFileSync(matrixFile, JSON.stringify(payload, null, 2));
console.log("Grant verify matrix:", JSON.stringify(payload.summary));
