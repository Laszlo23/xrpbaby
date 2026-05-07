import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { logEliasAgentAction } from "@/server/elias/audit";
import { eliasItinerarySchema, type EliasItinerary } from "@/server/elias/schema";
import { runEliasLangGraph } from "@/server/elias/graph";
import { runEliasEcosystemReply } from "@/server/elias/ecosystem-reply";
import { normalizePrefsEnvelope } from "@/server/elias/prefs-envelope";
import {
  createApprovalRequest,
  createPlan,
  decideLatestApproval,
  ensureThread,
  getGuestSessionByKey,
  getLatestPlanForThread,
  getPlanForSession,
  getPreferenceProfile,
  getThreadForGuest,
  insertMessage,
  listActivePartnerOffers,
  listMessages,
  listQueuedOutboundJobs,
  queueOutboundJob,
  setThreadGraphState,
  updateGuestWallet,
  updatePlanStatus,
  upsertGuestSession,
  upsertPreferenceProfile,
  getPlanConfirmationContext,
} from "@/server/elias/elias-store";
import { getEliasSupabaseAdmin } from "@/server/elias/supabase";
import { sendQueuedForPlan } from "@/server/elias/resend-mail";
import type { EliasGraphState } from "@/server/elias/schema";

const sessionKeySchema = z.object({
  sessionKey: z.string().min(16).max(200),
});

const chatSchema = sessionKeySchema.extend({
  threadId: z.string().uuid().optional().nullable(),
  message: z.string().min(1).max(8000),
  /** `ecosystem_guide` = orb / lore; omits itinerary workflow */
  mode: z.enum(["concierge", "ecosystem_guide"]).optional(),
});

const approveSchema = sessionKeySchema.extend({
  planId: z.string().uuid(),
});

const staffSecretSchema = z.object({
  secret: z.string().min(8).max(400),
  planId: z.string().uuid(),
});

const walletLinkSchema = z.object({
  sessionKey: z.string().min(16).max(200),
  message: z.string().min(10),
  signature: z.string().min(10),
});

function requireStaff(secret: string): boolean {
  const expected = process.env.ELIAS_ADMIN_SECRET?.trim();
  return !!expected && secret === expected;
}

function buildPartnerOutreach(
  itinerary: EliasItinerary,
  partnerName: string,
): {
  subject: string;
  body: string;
} {
  const subject = `Elias Concierge — inquiry: ${itinerary.title} (${partnerName})`;
  const body = `Hello ${partnerName},

A Building Culture / Elias Residence guest has **approved a draft experience plan** that references you.

Plan: ${itinerary.title}
Summary: ${itinerary.summary}

This message is a **non-binding soft inquiry** — please reply with availability, pricing guidance, and any constraints.

— Elias Concierge (Building Culture) — automated partner routing`;
  return { subject, body };
}

export const postEliasEnsureSession = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => sessionKeySchema.parse(raw))
  .handler(async ({ data }): Promise<{ ok: boolean; reason?: string; guestSessionId?: string }> => {
    const sb = getEliasSupabaseAdmin();
    if (!sb) {
      return { ok: false, reason: "supabase_env_missing" };
    }
    const row = await upsertGuestSession(data.sessionKey);
    if (!row) {
      // Env exists, but DB call failed: most likely missing schema or incorrect key / permissions.
      return { ok: false, reason: "supabase_schema_or_key" };
    }
    return { ok: true, guestSessionId: row.id };
  });

export const postEliasChat = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => chatSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      reason?: string;
      assistantReply?: string;
      threadId?: string;
      graphState?: EliasGraphState;
      plan?: { id: string; status: string } | null;
      itinerary?: EliasItinerary | null;
    }> => {
      // Burst guard: prevent rapid double-submits (helps avoid provider 429s).
      // In-memory only; resets on server restart.
      const now = Date.now();
      const prev = eliasLastChatAt.get(data.sessionKey) ?? 0;
      if (now - prev < 1200) {
        return { ok: false, reason: "elias_rate_limited_local" };
      }
      eliasLastChatAt.set(data.sessionKey, now);

      const guest = await getGuestSessionByKey(data.sessionKey);
      if (!guest) {
        return { ok: false, reason: "supabase_or_unknown_session" };
      }

      const desiredMode = data.mode === "ecosystem_guide" ? "ecosystem_guide" : "concierge";
      const thread = await ensureThread(guest.id, data.threadId ?? undefined, {
        threadKind: desiredMode === "ecosystem_guide" ? "ecosystem_guide" : "concierge",
      });
      if (!thread) {
        return { ok: false, reason: "thread_error" };
      }

      const eco = thread.thread_kind === "ecosystem_guide";

      if (eco) {
        await insertMessage(thread.id, "user", data.message);
        let prefsIn = normalizePrefsEnvelope(await getPreferenceProfile(thread.id));
        const ecoOut = await runEliasEcosystemReply({
          userMessage: data.message,
          prefs: prefsIn,
        });
        const mergedPrefs = normalizePrefsEnvelope(ecoOut.prefs);
        await upsertPreferenceProfile(thread.id, mergedPrefs);
        await insertMessage(thread.id, "assistant", ecoOut.assistantReply, { ecosystemGuide: true });
        return {
          ok: true,
          assistantReply: ecoOut.assistantReply,
          threadId: thread.id,
          graphState: thread.graph_state,
          plan: null,
          itinerary: null,
        };
      }

      const st = thread.graph_state;
      if (st === "await_user_approval" || st === "compose_partner_emails" || st === "completed") {
        const line =
          st === "await_user_approval"
            ? "Your plan is ready for review — use **Approve plan** below before we email partners."
            : "This itinerary thread is closed for chat edits. Start a new conversation from Elias if you need changes.";
        await insertMessage(thread.id, "user", data.message);
        await insertMessage(thread.id, "assistant", line);
        const latest = await getLatestPlanForThread(thread.id);
        return {
          ok: true,
          assistantReply: line,
          threadId: thread.id,
          graphState: st,
          plan: latest ? { id: latest.id, status: latest.status } : null,
          itinerary:
            latest?.itinerary && typeof latest.itinerary === "object"
              ? eliasItinerarySchema.safeParse(latest.itinerary).success
                ? eliasItinerarySchema.parse(latest.itinerary)
                : null
              : null,
        };
      }

      await insertMessage(thread.id, "user", data.message);

      const prefs = normalizePrefsEnvelope(await getPreferenceProfile(thread.id));

      const graphOut = await runEliasLangGraph({
        dbPhase: st,
        userMessage: data.message,
        prefs,
      });

      const mergedPrefs = normalizePrefsEnvelope(graphOut.prefs);
      await upsertPreferenceProfile(thread.id, mergedPrefs);

      let planId: string | null = null;
      const itinerary: EliasItinerary | null = graphOut.itinerary;

      if (itinerary) {
        const created = await createPlan(thread.id, itinerary);
        if (created?.id) {
          planId = created.id;
          await createApprovalRequest(created.id, {
            ...itinerary,
            eliasVersion: 1,
          } as unknown as Record<string, unknown>);
          await setThreadGraphState(thread.id, "await_user_approval");
          await logEliasAgentAction({
            action: "elias.plan_drafted",
            params: { planId, threadId: thread.id },
            status: "ok",
          });
        }
      } else {
        await setThreadGraphState(thread.id, graphOut.nextDbPhase);
      }

      await insertMessage(thread.id, "assistant", graphOut.assistantReply, {
        planId: planId ?? undefined,
        hasItinerary: Boolean(itinerary),
      });

      const latest = planId
        ? { id: planId, status: "pending_approval" as const }
        : await getLatestPlanForThread(thread.id).then((p) =>
            p ? { id: p.id, status: p.status } : null,
          );

      return {
        ok: true,
        assistantReply: graphOut.assistantReply,
        threadId: thread.id,
        graphState: itinerary ? "await_user_approval" : graphOut.nextDbPhase,
        plan: latest,
        itinerary,
      };
    },
  );

const eliasLastChatAt = new Map<string, number>();

export const postEliasApprovePlan = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => approveSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      reason?: string;
      emailedPartners?: number;
      errors?: string[];
    }> => {
      const guest = await getGuestSessionByKey(data.sessionKey);
      if (!guest) return { ok: false, reason: "unknown_session" };

      const plan = await getPlanForSession(data.planId, guest.id);
      if (!plan || plan.status !== "pending_approval") {
        return { ok: false, reason: "plan_not_pending" };
      }

      const parsed = eliasItinerarySchema.safeParse(plan.itinerary);
      if (!parsed.success) return { ok: false, reason: "invalid_itinerary" };

      const it = parsed.data;
      await decideLatestApproval(data.planId, "approved", it as unknown as Record<string, unknown>);
      await updatePlanStatus(data.planId, "approved");

      const partners = it.partners.filter((p) => p.contactEmail?.includes("@"));
      for (const p of partners) {
        const { subject, body } = buildPartnerOutreach(it, p.name);
        const email = p.contactEmail!;
        const idempotencyKey = `plan:${data.planId}:to:${email}`;
        await queueOutboundJob({
          planId: data.planId,
          toEmail: email,
          subject,
          bodyText: body,
          idempotencyKey,
        });
      }

      const sendResult = await sendQueuedForPlan(data.planId);
      await updatePlanStatus(data.planId, "partner_outreach");

      await logEliasAgentAction({
        action: "elias.plan_approved_partner_email",
        params: {
          planId: data.planId,
          queued: partners.length,
          sent: sendResult.sent,
        },
        status: sendResult.errors.length ? "partial" : "ok",
        errorMsg: sendResult.errors.length ? sendResult.errors.slice(0, 3).join("; ") : undefined,
      });

      return {
        ok: true,
        emailedPartners: sendResult.sent,
        errors: sendResult.errors.length ? sendResult.errors : undefined,
      };
    },
  );

export const postEliasStaffConfirmPlan = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => staffSecretSchema.parse(raw))
  .handler(async ({ data }): Promise<{ ok: boolean; reason?: string }> => {
    if (!requireStaff(data.secret)) {
      return { ok: false, reason: "unauthorized" };
    }
    const ok = await updatePlanStatus(data.planId, "confirmed");
    if (ok) {
      await logEliasAgentAction({
        action: "elias.plan_confirmed_staff",
        params: { planId: data.planId },
        status: "ok",
      });
    }
    return ok ? { ok: true } : { ok: false, reason: "update_failed" };
  });

export const postEliasStaffQueueSnapshot = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ secret: z.string().min(8).max(400) }).parse(raw))
  .handler(async ({ data }) => {
    if (!requireStaff(data.secret)) {
      return { ok: false as const, reason: "unauthorized" as const };
    }
    const jobs = await listQueuedOutboundJobs();
    const offersRaw = await listActivePartnerOffers();
    const offers = offersRaw.map((o) => ({
      id: o.id,
      category: o.category,
      title: o.title,
      body: o.body,
      partner_email: o.partner_email,
    }));
    return { ok: true as const, jobs, offers };
  });

export const postEliasLinkWallet = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => walletLinkSchema.parse(raw))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const { verifySiweSignature } = await import("@bc/identity/server");
    try {
      const address = await verifySiweSignature(data.message, data.signature);
      const ok = await updateGuestWallet(data.sessionKey, address);
      return ok ? { ok: true } : { ok: false, error: "supabase_or_session" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "siwe_error" };
    }
  });

const loadThreadSchema = sessionKeySchema.extend({
  threadId: z.string().uuid(),
});

export const postEliasLoadThread = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => loadThreadSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      reason?: string;
      messages?: { role: string; content: string }[];
      graphState?: EliasGraphState;
      plan?: { id: string; status: string; itinerary?: EliasItinerary | null } | null;
    }> => {
      const guest = await getGuestSessionByKey(data.sessionKey);
      if (!guest) return { ok: false, reason: "unknown_session" };
      const thread = await getThreadForGuest(data.threadId, guest.id);
      if (!thread) return { ok: false, reason: "unknown_thread" };
      const rows = await listMessages(data.threadId);
      const latest = await getLatestPlanForThread(data.threadId);
      const itineraryParsed =
        latest?.itinerary && typeof latest.itinerary === "object"
          ? eliasItinerarySchema.safeParse(latest.itinerary)
          : null;
      const itinerary: EliasItinerary | null =
        itineraryParsed && itineraryParsed.success ? itineraryParsed.data : null;
      return {
        ok: true,
        messages: rows.map((r) => ({ role: r.role, content: r.content })),
        graphState: thread.graph_state,
        plan: latest ? { id: latest.id, status: latest.status, itinerary } : null,
      };
    },
  );
