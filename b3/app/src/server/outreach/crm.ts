import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

import {
  OUTREACH_AGENT_ID,
  OUTREACH_AGENT_SYSTEM_PROMPT,
  isOutreachSegment,
} from "@/lib/outreach-agent-config";
import { runInference } from "@/server/llm/inference";

const draftInputSchema = z.object({
  targetId: z.string().min(1),
  grantProofSummary: z.string().max(8000).optional(),
});

const draftOutputSchema = z.object({
  emailSubject: z.string().min(1),
  emailBody: z.string().min(1),
  forumPost: z.string().min(1),
  followUpVariants: z.array(z.string()).min(1).max(5),
});

export async function draftOutreachTouch(
  prisma: PrismaClient,
  input: z.infer<typeof draftInputSchema>,
): Promise<
  | { ok: true; touchId: string; draft: z.infer<typeof draftOutputSchema> }
  | { ok: false; error: string; status: number }
> {
  const parsed = draftInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_body", status: 400 };
  }

  const target = await prisma.outreachTarget.findUnique({
    where: { id: parsed.data.targetId },
  });
  if (!target) {
    return { ok: false, error: "target_not_found", status: 404 };
  }

  const grantProof =
    parsed.data.grantProofSummary?.trim() ||
    target.grantProofUrl ||
    "https://app.buildingcultureid.space/grant-proof";

  const userPrompt = `Draft outreach for this target:

Name: ${target.name}
Segment: ${target.segment}
Channel: ${target.channel}
Contact email: ${target.contactEmail ?? "unknown"}
Contact URL: ${target.contactUrl ?? "none"}
Notes: ${target.notes ?? "none"}
Grant proof: ${grantProof}

Partnership brief highlights:
- Free pilot: BCID mint/bridge, dao-member + grant-applicant credentials
- APIs: /api/bcid/resolve, /api/bcid/bridge/culture
- Docs: https://app.buildingcultureid.space/docs/bcid
- RFC: https://app.buildingcultureid.space/docs/rfc
- Feedback: https://app.buildingcultureid.space/voice`;

  const result = await runInference([
    { role: "system", content: OUTREACH_AGENT_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  if (!result.ok || !result.text?.trim()) {
    return { ok: false, error: result.error ?? "inference_failed", status: 502 };
  }

  let json: unknown;
  try {
    const raw = result.text.trim();
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    json = JSON.parse(fenced ? fenced[1]!.trim() : raw);
  } catch {
    return { ok: false, error: "invalid_agent_json", status: 502 };
  }

  const draft = draftOutputSchema.safeParse(json);
  if (!draft.success) {
    return { ok: false, error: "invalid_agent_shape", status: 502 };
  }

  const touch = await prisma.outreachTouch.create({
    data: {
      targetId: target.id,
      channel: target.channel,
      status: "draft",
      emailSubject: draft.data.emailSubject,
      emailBody: draft.data.emailBody,
      forumPost: draft.data.forumPost,
      followUpVariants: draft.data.followUpVariants as Prisma.InputJsonValue,
      grantProofUrl: grantProof,
    },
  });

  try {
    await prisma.agentActionLog.create({
      data: {
        id: randomUUID(),
        agentId: OUTREACH_AGENT_ID,
        action: "outreach.draft",
        params: {
          targetId: target.id,
          segment: target.segment,
        } as Prisma.InputJsonValue,
        dryRun: false,
        status: "ok",
      },
    });
  } catch {
    /* non-fatal */
  }

  return { ok: true, touchId: touch.id, draft: draft.data };
}

export async function listOutreachBoard(prisma: PrismaClient) {
  const targets = await prisma.outreachTarget.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      touches: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
  return { ok: true as const, targets };
}

export async function approveAndSendTouch(
  prisma: PrismaClient,
  input: { touchId: string; sentBy?: string },
): Promise<{ ok: true; resendId: string } | { ok: false; error: string; status: number }> {
  const touch = await prisma.outreachTouch.findUnique({
    where: { id: input.touchId },
    include: { target: true },
  });
  if (!touch) {
    return { ok: false, error: "touch_not_found", status: 404 };
  }
  if (touch.status === "sent") {
    return { ok: false, error: "already_sent", status: 409 };
  }
  if (!touch.target.contactEmail?.trim()) {
    return { ok: false, error: "no_contact_email", status: 400 };
  }
  if (!touch.emailSubject?.trim() || !touch.emailBody?.trim()) {
    return { ok: false, error: "incomplete_draft", status: 400 };
  }

  const { sendOutreachEmail } = await import("@/server/outreach/resend-mail");
  const sent = await sendOutreachEmail({
    to: touch.target.contactEmail.trim(),
    subject: touch.emailSubject.trim(),
    body: touch.emailBody.trim(),
  });

  if (!sent.ok) {
    return { ok: false, error: sent.error, status: 502 };
  }

  await prisma.$transaction([
    prisma.outreachTouch.update({
      where: { id: touch.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        sentBy: input.sentBy ?? "operator",
        resendId: sent.resendId,
      },
    }),
    prisma.outreachTarget.update({
      where: { id: touch.targetId },
      data: {
        status: touch.target.status === "prospect" ? "contacted" : touch.target.status,
      },
    }),
  ]);

  return { ok: true, resendId: sent.resendId };
}

export function validateTargetInput(body: unknown):
  | {
      ok: true;
      data: {
        name: string;
        segment: string;
        channel: string;
        contactEmail?: string;
        contactUrl?: string;
        notes?: string;
        grantProofUrl?: string;
      };
    }
  | { ok: false; error: string } {
  const schema = z.object({
    name: z.string().min(2).max(120),
    segment: z.string().min(2).max(64),
    channel: z.string().min(2).max(32).default("email"),
    contactEmail: z.string().email().optional(),
    contactUrl: z.string().url().optional(),
    notes: z.string().max(2000).optional(),
    grantProofUrl: z.string().url().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, error: "invalid_body" };
  if (!isOutreachSegment(parsed.data.segment)) {
    return { ok: false, error: "invalid_segment" };
  }
  return { ok: true, data: parsed.data };
}
