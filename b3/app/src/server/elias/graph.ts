import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";

import type { EliasGraphState } from "@/server/elias/schema";
import { eliasItinerarySchema, type EliasItinerary } from "@/server/elias/schema";
import { bindEliasStructuredOutput, createEliasChatModel } from "@/server/elias/llm-client";
import {
  ELIAS_AUTH_REPLY,
  ELIAS_NOT_FOUND_REPLY,
  ELIAS_RATE_LIMIT_REPLY,
  isLLMAuthError,
  isLLMNotFoundError,
  isLLMRateLimitError,
} from "@/server/elias/llm-errors";

const EliasAnnotation = Annotation.Root({
  phase: Annotation<string>,
  userMessage: Annotation<string>,
  prefs: Annotation<Record<string, unknown>>({
    reducer: (left, right) => ({ ...left, ...right }),
    default: () => ({}),
  }),
  prefsReady: Annotation<boolean>,
  assistantReply: Annotation<string>,
  /** Serialized itinerary — validated at graph boundary */
  itinerary: Annotation<Record<string, unknown> | undefined>(),
});

function getChatModel() {
  return createEliasChatModel({ temperature: 0.55 });
}

const prefsExtractSchema = z.object({
  assistantReply: z.string(),
  prefsPatch: z.record(z.unknown()),
  prefsComplete: z.boolean(),
});

function routeStart(state: typeof EliasAnnotation.State): "collect_prefs" | "draft_plan" {
  return state.phase === "draft_plan" ? "draft_plan" : "collect_prefs";
}

function afterCollect(state: typeof EliasAnnotation.State): "draft_plan" | typeof END {
  return state.prefsReady ? "draft_plan" : END;
}

async function collectPrefs(state: typeof EliasAnnotation.State) {
  const model = getChatModel();
  const mergedPrefs = { ...state.prefs };

  if (!model) {
    return {
      prefs: mergedPrefs,
      prefsReady: Object.keys(mergedPrefs).length >= 4,
      assistantReply:
        "**Elias (offline)** — set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` on the server (`frontend/.env`; optional `ELIAS_LLM_PROVIDER=anthropic`).\n\nTell me your dates, budget band, and what kind of Vienna trip you want (romantic weekend, art, family, founders retreat…).",
    };
  }

  const structured = bindEliasStructuredOutput(model, prefsExtractSchema);
  const sys =
    new SystemMessage(`You are **Elias Concierge** for Elias Residence Vienna / Building Culture.

Goal: collect enough preference signal to draft a multi-day Vienna experience plan.

Rules:
- Be warm, concise, luxury-hospitality tone.
- Merge guest answers into prefsPatch (budget, datesOrSeason, partySize, vibe, dietary, mobility, interests).
- Set prefsComplete true only when you have: approximate timing (dates or season), party size or solo/couple, budget band (rough), and primary vibe/theme.
- Never claim confirmed bookings or prices — everything is indicative until partners confirm.
- Ask at most one follow-up when prefsComplete is false.`);

  const human = new HumanMessage(
    JSON.stringify({
      existingPrefs: mergedPrefs,
      latestMessage: state.userMessage,
    }),
  );

  let raw: unknown;
  try {
    raw = await structured.invoke([sys, human]);
  } catch (e) {
    if (isLLMRateLimitError(e)) {
      return {
        prefs: mergedPrefs,
        prefsReady: false,
        assistantReply: ELIAS_RATE_LIMIT_REPLY,
      };
    }
    if (isLLMAuthError(e)) {
      return {
        prefs: mergedPrefs,
        prefsReady: false,
        assistantReply: ELIAS_AUTH_REPLY,
      };
    }
    if (isLLMNotFoundError(e)) {
      return {
        prefs: mergedPrefs,
        prefsReady: false,
        assistantReply: ELIAS_NOT_FOUND_REPLY,
      };
    }
    throw e;
  }
  let out: z.infer<typeof prefsExtractSchema>;
  try {
    out = prefsExtractSchema.parse(raw);
  } catch {
    return {
      prefs: mergedPrefs,
      prefsReady: false,
      assistantReply:
        "Something went wrong reading the assistant response — please send your message again.",
    };
  }
  const nextPrefs = { ...mergedPrefs, ...out.prefsPatch };
  return {
    prefs: nextPrefs,
    prefsReady: out.prefsComplete,
    assistantReply: out.assistantReply,
  };
}

async function draftPlan(state: typeof EliasAnnotation.State) {
  const model = getChatModel();
  if (!model) {
    return {
      assistantReply:
        "Draft planning needs an LLM API key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`). Your preferences are saved — try again when configured.",
    };
  }

  const structured = bindEliasStructuredOutput(model, eliasItinerarySchema);
  const sys =
    new SystemMessage(`You are **Elias Concierge** drafting a structured itinerary for Vienna.

Rules:
- Output must satisfy the schema: title, summary, schedule with day blocks, partners (names can be descriptive placeholders like "Private gallery partner").
- Include optional partner contactEmail only when plausible — otherwise omit.
- priceBand is indicative only.
- Match prefs: ${JSON.stringify(state.prefs)}`);

  const human = new HumanMessage(
    `Build the best draft itinerary for this guest. User thread context: ${state.userMessage}`,
  );

  let raw: unknown;
  try {
    raw = await structured.invoke([sys, human]);
  } catch (e) {
    if (isLLMRateLimitError(e)) {
      return { assistantReply: ELIAS_RATE_LIMIT_REPLY };
    }
    if (isLLMAuthError(e)) {
      return { assistantReply: ELIAS_AUTH_REPLY };
    }
    if (isLLMNotFoundError(e)) {
      return { assistantReply: ELIAS_NOT_FOUND_REPLY };
    }
    return {
      assistantReply:
        "I couldn’t finalize a structured plan this round — please add any missing dates or budget hint, then send another message.",
    };
  }

  const parsed = eliasItinerarySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      assistantReply:
        "The draft didn’t pass validation — try adding clearer dates or themes, then message again.",
    };
  }
  const itinerary = parsed.data;

  const assistantReply = `Here's your **draft experience**: **${itinerary.title}**\n\n${itinerary.summary}\n\nReview the itinerary card below and tap **Approve plan** when you want us to email partners (no charges are made here).`;

  return {
    itinerary: itinerary as unknown as Record<string, unknown>,
    assistantReply,
  };
}

function buildGraph() {
  return new StateGraph(EliasAnnotation)
    .addNode("collect_prefs", collectPrefs)
    .addNode("draft_plan", draftPlan)
    .addConditionalEdges(START, routeStart, {
      collect_prefs: "collect_prefs",
      draft_plan: "draft_plan",
    })
    .addConditionalEdges("collect_prefs", afterCollect, {
      draft_plan: "draft_plan",
      [END]: END,
    })
    .addEdge("draft_plan", END);
}

let compiled: ReturnType<ReturnType<typeof buildGraph>["compile"]> | null = null;

export async function runEliasLangGraph(input: {
  dbPhase: EliasGraphState;
  userMessage: string;
  prefs: Record<string, unknown>;
}): Promise<{
  assistantReply: string;
  prefs: Record<string, unknown>;
  itinerary: EliasItinerary | null;
  /** Phase to persist after this turn */
  nextDbPhase: EliasGraphState;
}> {
  const invokePhase =
    input.dbPhase === "draft_plan"
      ? "draft_plan"
      : input.dbPhase === "collect_prefs"
        ? "collect_prefs"
        : "collect_prefs";

  if (!compiled) {
    compiled = buildGraph().compile();
  }

  const result = await compiled.invoke({
    phase: invokePhase,
    userMessage: input.userMessage,
    prefs: input.prefs,
    prefsReady: false,
    assistantReply: "",
  });

  const rawIt = result.itinerary;
  const itineraryParsed =
    rawIt && typeof rawIt === "object" ? eliasItinerarySchema.safeParse(rawIt) : null;
  const itinerary = itineraryParsed && itineraryParsed.success ? itineraryParsed.data : null;
  let nextDbPhase: EliasGraphState = input.dbPhase;

  if (itinerary) {
    nextDbPhase = "await_user_approval";
  } else if (invokePhase === "collect_prefs" && !itinerary) {
    nextDbPhase = "collect_prefs";
  } else if (invokePhase === "draft_plan" && !itinerary) {
    nextDbPhase = "collect_prefs";
  }

  return {
    assistantReply: result.assistantReply || "…",
    prefs: result.prefs ?? input.prefs,
    itinerary,
    nextDbPhase,
  };
}
