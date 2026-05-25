import { Resend } from "resend";

import { getEliasSupabaseAdmin } from "@/server/elias/supabase";

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function defaultFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Elias Concierge <onboarding@resend.dev>";
}

export async function sendQueuedOutboundByIds(ids: string[]): Promise<{
  sent: number;
  errors: string[];
}> {
  const resend = getResendClient();
  const sb = getEliasSupabaseAdmin();
  const errors: string[] = [];
  if (!resend || !sb) {
    if (!resend) errors.push("RESEND_API_KEY not set — outbound emails not sent.");
    if (!sb) errors.push("Supabase not configured.");
    return { sent: 0, errors };
  }

  let sent = 0;
  for (const id of ids) {
    const { data: row } = await sb
      .from("elias_outbound_jobs")
      .select("id, to_email, subject, body_text, status")
      .eq("id", id)
      .maybeSingle();
    if (!row || row.status !== "queued") continue;
    const r = row as {
      id: string;
      to_email: string;
      subject: string;
      body_text: string;
      status: string;
    };
    try {
      const out = await resend.emails.send({
        from: defaultFromEmail(),
        to: r.to_email,
        subject: r.subject,
        text: r.body_text,
      });
      if (out.error) {
        errors.push(`${r.id}: ${out.error.message}`);
        await sb.from("elias_outbound_jobs").update({ status: "failed" }).eq("id", r.id);
        continue;
      }
      sent++;
      await sb
        .from("elias_outbound_jobs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", r.id);
    } catch (e) {
      errors.push(`${id}: ${e instanceof Error ? e.message : "send_error"}`);
      await sb.from("elias_outbound_jobs").update({ status: "failed" }).eq("id", r.id);
    }
  }

  return { sent, errors };
}

export async function sendQueuedForPlan(planId: string): Promise<{
  sent: number;
  errors: string[];
}> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return { sent: 0, errors: ["Supabase not configured."] };
  const { data } = await sb
    .from("elias_outbound_jobs")
    .select("id")
    .eq("plan_id", planId)
    .eq("status", "queued");
  const ids = (data ?? []).map((r) => (r as { id: string }).id);
  return sendQueuedOutboundByIds(ids);
}
