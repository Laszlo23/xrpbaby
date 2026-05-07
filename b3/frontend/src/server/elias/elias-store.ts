import type { EliasGraphState } from "@/server/elias/schema";
import type { EliasItinerary } from "@/server/elias/schema";
import { getEliasSupabaseAdmin } from "@/server/elias/supabase";

export type EliasThreadKind = "concierge" | "ecosystem_guide";

export async function upsertGuestSession(
  externalSessionKey: string,
): Promise<{ id: string } | null> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data: existing } = await sb
    .from("elias_guest_sessions")
    .select("id")
    .eq("external_session_key", externalSessionKey)
    .maybeSingle();
  if (existing?.id) return { id: existing.id as string };
  const { data, error } = await sb
    .from("elias_guest_sessions")
    .insert({ external_session_key: externalSessionKey })
    .select("id")
    .single();
  if (error || !data?.id) return null;
  return { id: data.id as string };
}

export async function updateGuestWallet(
  sessionKey: string,
  walletAddress: string,
): Promise<boolean> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return false;
  const { error } = await sb
    .from("elias_guest_sessions")
    .update({ wallet_address: walletAddress.toLowerCase() })
    .eq("external_session_key", sessionKey);
  return !error;
}

export async function getGuestSessionByKey(
  sessionKey: string,
): Promise<{ id: string; wallet_address: string | null } | null> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("elias_guest_sessions")
    .select("id, wallet_address")
    .eq("external_session_key", sessionKey)
    .maybeSingle();
  if (error || !data?.id) return null;
  return {
    id: data.id as string,
    wallet_address: (data.wallet_address as string | null) ?? null,
  };
}

export async function getThreadForGuest(threadId: string, guestSessionId: string) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("elias_threads")
    .select("id, graph_state, thread_kind")
    .eq("id", threadId)
    .eq("guest_session_id", guestSessionId)
    .maybeSingle();
  if (!data?.id) return null;
  const tkRaw = (data as { thread_kind?: string | null }).thread_kind;
  const thread_kind: EliasThreadKind =
    tkRaw === "ecosystem_guide" ? "ecosystem_guide" : "concierge";
  return {
    id: data.id as string,
    graph_state: data.graph_state as EliasGraphState,
    thread_kind,
  };
}

export async function ensureThread(
  sessionId: string,
  threadId?: string | null,
  opts?: { threadKind?: EliasThreadKind },
) {
  const desiredKind: EliasThreadKind = opts?.threadKind ?? "concierge";
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  if (threadId) {
    const { data } = await sb
      .from("elias_threads")
      .select("id, graph_state, thread_kind")
      .eq("id", threadId)
      .eq("guest_session_id", sessionId)
      .maybeSingle();
    if (data?.id) {
      const tkRaw = (data as { thread_kind?: string | null }).thread_kind;
      const thread_kind: EliasThreadKind =
        tkRaw === "ecosystem_guide" ? "ecosystem_guide" : "concierge";
      if (thread_kind !== desiredKind) {
        // Stale orb vs concierge separation — allocate a fresh thread below
      } else {
        return {
          id: data.id as string,
          graph_state: data.graph_state as EliasGraphState,
          thread_kind,
        };
      }
    }
  }
  const row: Record<string, unknown> = {
    guest_session_id: sessionId,
    graph_state: "collect_prefs",
    thread_kind: desiredKind,
  };
  const { data, error } = await sb
    .from("elias_threads")
    .insert(row)
    .select("id, graph_state, thread_kind")
    .single();
  if (error || !data?.id) return null;
  const tkRaw = (data as { thread_kind?: string | null }).thread_kind;
  const thread_kind: EliasThreadKind =
    tkRaw === "ecosystem_guide" ? "ecosystem_guide" : "concierge";
  return {
    id: data.id as string,
    graph_state: data.graph_state as EliasGraphState,
    thread_kind,
  };
}

export async function listMessages(threadId: string) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("elias_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  return (data ?? []) as {
    id: string;
    role: string;
    content: string;
    created_at: string;
  }[];
}

export async function insertMessage(
  threadId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: Record<string, unknown>,
) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("elias_messages")
    .insert({ thread_id: threadId, role, content, metadata: metadata ?? null })
    .select("id")
    .single();
  if (error) return null;
  return data?.id as string | undefined;
}

export async function getPreferenceProfile(threadId: string): Promise<Record<string, unknown>> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return {};
  const { data } = await sb
    .from("elias_preference_profiles")
    .select("prefs")
    .eq("thread_id", threadId)
    .maybeSingle();
  const prefs = data?.prefs;
  if (prefs && typeof prefs === "object" && !Array.isArray(prefs)) {
    return prefs as Record<string, unknown>;
  }
  return {};
}

export async function upsertPreferenceProfile(threadId: string, prefs: Record<string, unknown>) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return false;
  const { error } = await sb
    .from("elias_preference_profiles")
    .upsert(
      { thread_id: threadId, prefs, updated_at: new Date().toISOString() },
      { onConflict: "thread_id" },
    );
  return !error;
}

export async function setThreadGraphState(threadId: string, graphState: EliasGraphState) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return false;
  const { error } = await sb
    .from("elias_threads")
    .update({ graph_state: graphState, updated_at: new Date().toISOString() })
    .eq("id", threadId);
  return !error;
}

export async function createPlan(threadId: string, itinerary: EliasItinerary) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("elias_plans")
    .insert({
      thread_id: threadId,
      itinerary: itinerary as unknown as Record<string, unknown>,
      status: "pending_approval",
      version: 1,
    })
    .select("id")
    .single();
  if (error || !data?.id) return null;
  return { id: data.id as string };
}

export async function getPlanForSession(planId: string, sessionId: string) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data: plan } = await sb
    .from("elias_plans")
    .select("id, thread_id, itinerary, status")
    .eq("id", planId)
    .maybeSingle();
  if (!plan?.thread_id) return null;
  const { data: thread } = await sb
    .from("elias_threads")
    .select("guest_session_id")
    .eq("id", plan.thread_id as string)
    .maybeSingle();
  if (!thread || (thread as { guest_session_id: string }).guest_session_id !== sessionId) {
    return null;
  }
  return {
    id: plan.id as string,
    thread_id: plan.thread_id as string,
    itinerary: plan.itinerary,
    status: plan.status as string,
  };
}

export async function updatePlanStatus(planId: string, status: string) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return false;
  const { error } = await sb
    .from("elias_plans")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", planId);
  return !error;
}

export async function getLatestPlanForThread(threadId: string) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("elias_plans")
    .select("id, itinerary, status, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.id) return null;
  return data as {
    id: string;
    itinerary: unknown;
    status: string;
    created_at: string;
  };
}

/** Server-side XP verification — returns wallet expected for SIWE match */
export async function getPlanConfirmationContext(planId: string) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data: plan } = await sb
    .from("elias_plans")
    .select("id, status, thread_id")
    .eq("id", planId)
    .maybeSingle();
  if (!plan?.thread_id) return null;
  const { data: thread } = await sb
    .from("elias_threads")
    .select("guest_session_id")
    .eq("id", plan.thread_id as string)
    .maybeSingle();
  const sid = (thread as { guest_session_id?: string } | null)?.guest_session_id;
  if (!sid) return null;
  const { data: sess } = await sb
    .from("elias_guest_sessions")
    .select("wallet_address")
    .eq("id", sid)
    .maybeSingle();
  return {
    status: plan.status as string,
    walletAddress: ((sess as { wallet_address?: string | null })?.wallet_address ?? null) as
      | string
      | null,
  };
}

export async function listActivePartnerOffers() {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("elias_partner_offers")
    .select("id, category, title, body, partner_email, metadata")
    .eq("active", true)
    .limit(50);
  return (data ?? []) as {
    id: string;
    category: string;
    title: string;
    body: string | null;
    partner_email: string | null;
    metadata: unknown;
  }[];
}

export async function insertPartnerOfferFromInbound(input: {
  category: string;
  title: string;
  body: string;
  partner_email: string | null;
  metadata?: Record<string, unknown>;
}) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("elias_partner_offers")
    .insert({
      category: input.category,
      title: input.title,
      body: input.body,
      partner_email: input.partner_email,
      metadata: input.metadata ?? {},
      active: true,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id as string | undefined;
}

export async function createApprovalRequest(planId: string, snapshot: Record<string, unknown>) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("elias_approval_requests")
    .insert({ plan_id: planId, snapshot })
    .select("id")
    .single();
  if (error) return null;
  return data?.id as string | undefined;
}

export async function decideLatestApproval(
  planId: string,
  decision: "approved" | "rejected",
  snapshot: Record<string, unknown>,
): Promise<boolean> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return false;
  const { data: rows } = await sb
    .from("elias_approval_requests")
    .select("id")
    .eq("plan_id", planId)
    .is("decision", null)
    .order("created_at", { ascending: false })
    .limit(1);
  const id = rows?.[0]?.id as string | undefined;
  if (!id) return false;
  const { error } = await sb
    .from("elias_approval_requests")
    .update({
      decision,
      decided_at: new Date().toISOString(),
      snapshot,
    })
    .eq("id", id);
  return !error;
}

/** Queue outbound email — idempotent per plan + recipient */
export async function queueOutboundJob(input: {
  planId: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  idempotencyKey: string;
}) {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return { ok: false as const };
  const { error } = await sb.from("elias_outbound_jobs").insert({
    plan_id: input.planId,
    to_email: input.toEmail,
    subject: input.subject,
    body_text: input.bodyText,
    status: "queued",
    idempotency_key: input.idempotencyKey,
  });
  if (error?.code === "23505") return { ok: true as const, duplicate: true };
  if (error) return { ok: false as const };
  return { ok: true as const };
}

export async function listQueuedOutboundJobs() {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("elias_outbound_jobs")
    .select("id, plan_id, to_email, subject, status, created_at")
    .in("status", ["queued", "failed"])
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as {
    id: string;
    plan_id: string;
    to_email: string;
    subject: string;
    status: string;
    created_at: string;
  }[];
}
