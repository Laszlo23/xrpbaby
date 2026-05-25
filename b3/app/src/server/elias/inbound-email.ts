/**
 * Normalizes Resend inbound webhook payloads (shape may vary).
 * https://resend.com/docs/dashboard/receiving/introduction
 */
export function parseInboundPartnerPayload(body: unknown): {
  subject: string;
  text: string;
  fromEmail: string | null;
} | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const data = (o.data ?? o.payload ?? o) as Record<string, unknown>;

  const subject =
    typeof data.subject === "string"
      ? data.subject
      : typeof o.subject === "string"
        ? o.subject
        : "(no subject)";

  let text = "";
  if (typeof data.text === "string") text = data.text;
  else if (typeof data.html === "string") text = data.html.replace(/<[^>]+>/g, " ").slice(0, 8000);
  else if (typeof o.text === "string") text = o.text;

  let fromEmail: string | null = null;
  const from = data.from ?? o.from;
  if (typeof from === "string") {
    const m = from.match(/<([^>]+)>/);
    fromEmail = m ? m[1]!.trim() : from.includes("@") ? from.trim() : null;
  } else if (
    from &&
    typeof from === "object" &&
    "email" in from &&
    typeof (from as { email?: string }).email === "string"
  ) {
    fromEmail = (from as { email: string }).email;
  }

  if (!text.trim()) text = "(empty body)";

  return { subject, text, fromEmail };
}
