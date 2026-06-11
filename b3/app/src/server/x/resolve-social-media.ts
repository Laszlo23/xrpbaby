import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Resolve a site-relative social image path to an absolute filesystem path. */
export function resolveSocialMediaPath(
  imagePath: string,
): { ok: true; absPath: string } | { ok: false; error: string } {
  const trimmed = imagePath.trim();
  if (!trimmed.startsWith("/social/")) {
    return { ok: false, error: "invalid_image_path" };
  }
  if (trimmed.includes("..")) {
    return { ok: false, error: "invalid_image_path" };
  }

  const rel = trimmed.replace(/^\//, "");
  const absPath = path.resolve(APP_ROOT, "public", rel);
  const publicRoot = path.resolve(APP_ROOT, "public", "social");
  if (!absPath.startsWith(publicRoot + path.sep) && absPath !== publicRoot) {
    return { ok: false, error: "invalid_image_path" };
  }
  if (!fs.existsSync(absPath)) {
    return { ok: false, error: "image_not_found" };
  }
  return { ok: true, absPath };
}

export function parseMarketingPostBody(raw: unknown): {
  text: string;
  replyToTweetId?: string;
  imagePath?: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.text !== "string") return null;
  const replyToTweetId =
    typeof o.replyToTweetId === "string" && o.replyToTweetId.trim()
      ? o.replyToTweetId.trim()
      : undefined;
  const imagePath =
    typeof o.imagePath === "string" && o.imagePath.trim() ? o.imagePath.trim() : undefined;
  return { text: o.text, replyToTweetId, imagePath };
}
