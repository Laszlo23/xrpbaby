#!/usr/bin/env node
/**
 * BC Studio sandbox orchestrator — run on VPS Docker host.
 * Env: STUDIO_SANDBOX_SECRET, STUDIO_PORT_MIN=5100, STUDIO_PORT_MAX=5199
 */
import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const exec = promisify(execFile);

const PORT = Number(process.env.STUDIO_ORCHESTRATOR_PORT ?? 8790);
const SECRET = process.env.STUDIO_SANDBOX_SECRET?.trim() ?? "";
const PORT_MIN = Number(process.env.STUDIO_PORT_MIN ?? 5100);
const PORT_MAX = Number(process.env.STUDIO_PORT_MAX ?? 5199);
const WORK_ROOT = process.env.STUDIO_WORK_ROOT ?? "/var/lib/bc-studio";
const IMAGE = process.env.STUDIO_SANDBOX_IMAGE ?? "bc-studio-sandbox:latest";

/** @type {Map<string, { projectId: string, port: number, containerName: string }>} */
const sandboxes = new Map();
const usedPorts = new Set();

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function auth(req) {
  if (!SECRET) return true;
  const h = req.headers.authorization ?? "";
  return h === `Bearer ${SECRET}`;
}

function allocPort() {
  for (let p = PORT_MIN; p <= PORT_MAX; p++) {
    if (!usedPorts.has(p)) {
      usedPorts.add(p);
      return p;
    }
  }
  return null;
}

async function docker(args) {
  const { stdout } = await exec("docker", args, { maxBuffer: 10 * 1024 * 1024 });
  return stdout.trim();
}

async function createSandbox(projectId) {
  const existing = [...sandboxes.values()].find((s) => s.projectId === projectId);
  if (existing) return existing;

  const port = allocPort();
  if (!port) throw new Error("port_pool_exhausted");

  const sandboxId = `bc-${projectId.slice(0, 12)}`;
  const containerName = `bc-studio-${sandboxId}`;
  const workDir = path.join(WORK_ROOT, sandboxId);
  await mkdir(workDir, { recursive: true });

  await docker([
    "run",
    "-d",
    "--name",
    containerName,
    "--rm",
    "-p",
    `${port}:5173`,
    "-v",
    `${workDir}:/workspace`,
    "-w",
    "/workspace",
    "--memory",
    "512m",
    "--cpus",
    "1",
    IMAGE,
  ]);

  const rec = { projectId, port, containerName, sandboxId };
  sandboxes.set(sandboxId, rec);
  return { sandboxId, port, containerName, projectId };
}

async function syncFiles(sandboxId, files) {
  const rec = sandboxes.get(sandboxId);
  if (!rec) throw new Error("not_found");
  const workDir = path.join(WORK_ROOT, sandboxId);
  for (const [rel, content] of Object.entries(files)) {
    const fp = path.join(workDir, rel);
    await mkdir(path.dirname(fp), { recursive: true });
    await writeFile(fp, content, "utf8");
  }
  return { ok: true };
}

async function sandboxHealth(sandboxId) {
  const rec = sandboxes.get(sandboxId);
  if (!rec) return { ready: false, logs: "not_found" };
  try {
    const res = await fetch(`http://127.0.0.1:${rec.port}/`);
    const logs = await docker(["logs", "--tail", "40", rec.containerName]).catch(() => "");
    return { ready: res.ok, logs };
  } catch (e) {
    return { ready: false, logs: e instanceof Error ? e.message : "health_failed" };
  }
}

async function execCommand(sandboxId, command) {
  const rec = sandboxes.get(sandboxId);
  if (!rec) return { ok: false, output: "not_found" };
  const allowed = ["npm install", "npm run build", "npm run dev"];
  if (!allowed.includes(command.trim())) {
    return { ok: false, output: "command_not_allowed" };
  }
  try {
    const out = await docker(["exec", rec.containerName, "sh", "-lc", command]);
    return { ok: true, output: out };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "exec_failed";
    return { ok: false, output: msg };
  }
}

async function deleteSandbox(sandboxId) {
  const rec = sandboxes.get(sandboxId);
  if (!rec) return;
  await docker(["rm", "-f", rec.containerName]).catch(() => {});
  usedPorts.delete(rec.port);
  sandboxes.delete(sandboxId);
  await rm(path.join(WORK_ROOT, sandboxId), { recursive: true, force: true }).catch(() => {});
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (!auth(req)) return json(res, 401, { error: "unauthorized" });

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  try {
    if (req.method === "POST" && parts[0] === "sandboxes" && parts.length === 1) {
      const body = await readBody(req);
      const rec = await createSandbox(String(body.projectId ?? ""));
      return json(res, 200, { sandboxId: rec.sandboxId, port: rec.port });
    }

    if (parts[0] === "sandboxes" && parts.length >= 2) {
      const sandboxId = parts[1];

      if (req.method === "DELETE" && parts.length === 2) {
        await deleteSandbox(sandboxId);
        return json(res, 200, { ok: true });
      }

      if (req.method === "POST" && parts[2] === "sync") {
        const body = await readBody(req);
        await syncFiles(sandboxId, body.files ?? {});
        return json(res, 200, { ok: true });
      }

      if (req.method === "GET" && parts[2] === "health") {
        const health = await sandboxHealth(sandboxId);
        return json(res, 200, health);
      }

      if (req.method === "POST" && parts[2] === "exec") {
        const body = await readBody(req);
        const result = await execCommand(sandboxId, String(body.command ?? ""));
        return json(res, 200, result);
      }

      if (req.method === "GET" && parts[2] === "proxy") {
        const rec = sandboxes.get(sandboxId);
        if (!rec) return json(res, 404, { error: "not_found" });
        const upstream = await fetch(`http://127.0.0.1:${rec.port}/`);
        res.writeHead(upstream.status, {
          "Content-Type": upstream.headers.get("content-type") ?? "text/html",
        });
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.end(buf);
        return;
      }
    }

    json(res, 404, { error: "not_found" });
  } catch (e) {
    json(res, 500, { error: e instanceof Error ? e.message : "server_error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BC Studio orchestrator listening on :${PORT}`);
});
