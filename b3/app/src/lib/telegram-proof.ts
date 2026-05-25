/** Audit-style proof URLs for Telegram quests (invite links, group posts, share links). */
export function isPlausibleTelegramProofUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    const h = u.hostname.replace(/^www\./, "").toLowerCase();
    return h === "t.me" || h === "telegram.me" || h === "telegram.dog";
  } catch {
    return false;
  }
}
