/**
 * Self-hosted production server for TanStack Start builds.
 * Node builds emit dist/server/server.js; Cloudflare builds emit dist/server/index.js.
 *
 * Serves files from `dist/client` (CSS, JS, media, etc.); the SSR handler alone does not.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distServerDir = path.resolve(__dirname, "..", "dist", "server");
const serverEntryPath = ["server.js", "index.js"]
  .map((name) => path.join(distServerDir, name))
  .find((candidate) => fs.existsSync(candidate));
if (!serverEntryPath) {
  throw new Error(
    "Missing dist/server/server.js or dist/server/index.js — run npm run build first.",
  );
}
const worker = await import(pathToFileURL(serverEntryPath).href);
const clientRoot = path.resolve(__dirname, "..", "dist", "client");

/** Baseline headers for static files (avoid interfering with SSR / embedding flags). */
function applyStaticSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

function mimeForFile(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".ico":
      return "image/x-icon";
    case ".woff2":
      return "font/woff2";
    case ".woff":
      return "font/woff";
    case ".mp4":
      return "video/mp4";
    case ".mp3":
      return "audio/mpeg";
    case ".m4a":
      return "audio/mp4";
    case ".ogg":
      return "audio/ogg";
    case ".wav":
      return "audio/wav";
    case ".webmanifest":
      return "application/manifest+json";
    case ".pdf":
      return "application/pdf";
    case ".html":
      return "text/html; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

/** Resolve a safe path under `dist/client` or return null. */
function resolveClientFile(urlPathname) {
  try {
    const withoutQuery = urlPathname.split("?")[0] ?? "";
    const decoded = decodeURIComponent(withoutQuery);
    if (decoded.includes("\0")) return null;
    const parts = decoded.split("/").filter(Boolean);
    const candidate = path.resolve(clientRoot, ...parts);
    const rel = path.relative(clientRoot, candidate);
    if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
    return candidate;
  } catch {
    return null;
  }
}

async function tryServeClientStatic(req, res, urlPathname) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  const filePath = resolveClientFile(urlPathname);
  if (!filePath) return false;
  let st;
  try {
    st = await fs.promises.stat(filePath);
  } catch {
    return false;
  }
  if (!st.isFile()) return false;

  const rangeHeader = req.headers.range;
  let start = 0;
  let end = st.size - 1;
  let statusCode = 200;

  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (match) {
      const parsedStart = match[1] ? Number.parseInt(match[1], 10) : 0;
      const parsedEnd = match[2] ? Number.parseInt(match[2], 10) : st.size - 1;
      if (
        Number.isFinite(parsedStart) &&
        Number.isFinite(parsedEnd) &&
        parsedStart <= parsedEnd &&
        parsedStart < st.size
      ) {
        start = parsedStart;
        end = Math.min(parsedEnd, st.size - 1);
        statusCode = 206;
      }
    }
  }

  const chunkSize = end - start + 1;

  res.statusCode = statusCode;
  applyStaticSecurityHeaders(res);
  res.setHeader("Content-Type", mimeForFile(filePath));
  res.setHeader("Accept-Ranges", "bytes");
  if (statusCode === 206) {
    res.setHeader("Content-Range", `bytes ${start}-${end}/${st.size}`);
    res.setHeader("Content-Length", String(chunkSize));
  } else {
    res.setHeader("Content-Length", String(st.size));
  }
  if (urlPathname.startsWith("/assets/") || urlPathname.startsWith("/landing/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }

  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  await pipeline(fs.createReadStream(filePath, { start, end }), res);
  return true;
}

/** Supports both `{ fetch }` and `{ default: { fetch } }` shapes from TanStack / Nitro builds. */
function getFetchHandler(mod) {
  if (mod?.default?.fetch && typeof mod.default.fetch === "function")
    return mod.default.fetch.bind(mod.default);
  if (mod?.fetch && typeof mod.fetch === "function") return mod.fetch.bind(mod);
  return null;
}

const port = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host ?? `127.0.0.1:${port}`;
    const url = new URL(req.url || "/", `http://${host}`);
    const headers = new Headers();
    for (const [k, raw] of Object.entries(req.headers)) {
      if (raw === undefined) continue;
      if (Array.isArray(raw)) {
        for (const x of raw) headers.append(k, x);
      } else {
        headers.set(k, raw);
      }
    }

    let body;
    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== undefined) {
      body = Readable.toWeb(req);
    }

    if (await tryServeClientStatic(req, res, url.pathname)) {
      return;
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body,
      duplex: body ? "half" : undefined,
    });

    const fetchHandler = getFetchHandler(worker);
    if (!fetchHandler) {
      throw new Error("dist/server/index.js must export fetch (see scripts/serve-production.mjs)");
    }
    const response = await fetchHandler(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.statusCode = 500;
    res.end("Server error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Listening on 0.0.0.0:${port}`);
});
