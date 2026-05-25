import { appendFileSync } from "node:fs";

export type ChatAuditPayload = {
  event: "chat_completion" | "risk_alert" | "handoff";
  mode: string;
  riskScore: number;
  riskFlags: string[];
  ragChunkIds: string[];
  userMessageHash: string;
  replyChars: number;
  model?: string;
  backend?: string;
};

function hashSnippet(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16);
}

export function hashUserMessage(text: string): string {
  return hashSnippet(text.trim().slice(0, 2000));
}

/** Structured audit: enable with CHAT_AUDIT_LOG=1 (stdout) or set CHAT_AUDIT_LOG_PATH for append-only file (Node server only). */
export function auditChat(payload: ChatAuditPayload): void {
  const line = JSON.stringify({ t: new Date().toISOString(), ...payload });
  if (process.env.CHAT_AUDIT_LOG === "1") {
    console.info("[chat-audit]", line);
  }
  const p = process.env.CHAT_AUDIT_LOG_PATH;
  if (p) {
    try {
      appendFileSync(p, `${line}\n`, "utf8");
    } catch {
      /* ignore write errors e.g. read-only FS */
    }
  }
}
