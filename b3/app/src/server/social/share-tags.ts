/** Server-side social quest tag targets (env-overridable). */

export function resolveFarcasterTagHandle(): string {
  const raw =
    process.env.SOCIAL_FC_HANDLE?.trim() ||
    process.env.VITE_SOCIAL_FC_HANDLE?.trim() ||
    "0xleonardo";
  return raw.replace(/^@/, "").toLowerCase();
}

export function resolveXTagHandles(): string[] {
  const raw =
    process.env.SOCIAL_X_HANDLES?.trim() ||
    process.env.VITE_SOCIAL_X_HANDLES?.trim() ||
    "bihary41418,buildingcultu3";
  return raw
    .split(",")
    .map((h) => h.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean);
}

export function textMentionsHandle(text: string, handle: string): boolean {
  const t = text.toLowerCase();
  const h = handle.toLowerCase();
  return t.includes(`@${h}`) || t.includes(`x.com/${h}`) || t.includes(`twitter.com/${h}`);
}

export function textMentionsAllHandles(text: string, handles: string[]): boolean {
  if (handles.length === 0) return true;
  return handles.every((h) => textMentionsHandle(text, h));
}
