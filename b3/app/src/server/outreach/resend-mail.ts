import { Resend } from "resend";

export function getOutreachResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function outreachFromEmail(): string {
  return (
    process.env.OUTREACH_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Building Culture <hello@buildingcultureid.space>"
  );
}

export async function sendOutreachEmail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ ok: true; resendId: string } | { ok: false; error: string }> {
  const resend = getOutreachResendClient();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const out = await resend.emails.send({
    from: outreachFromEmail(),
    to: input.to,
    subject: input.subject,
    text: input.body,
  });

  if (out.error) {
    return { ok: false, error: out.error.message };
  }

  const resendId = out.data?.id ?? "unknown";
  return { ok: true, resendId };
}
