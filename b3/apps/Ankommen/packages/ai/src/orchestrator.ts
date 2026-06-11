import type { AgentType } from "@ankommen/database";
import type OpenAI from "openai";
import { getAgentPrompt } from "./prompts/index.js";
import { getChatModel, getLlmSetupHint, getOpenAIClient } from "./llm-client.js";
import { searchKnowledge, formatCitations, formatContext } from "./tools/rag-search.js";
import { wrapWithDisclaimer, detectHighRiskTopics } from "./safety.js";

export interface AgentRequest {
  message: string;
  agentType: AgentType;
  language?: string;
  profileContext?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AgentResponse {
  answer: string;
  citations: ReturnType<typeof formatCitations>;
  nextSteps: string[];
  disclaimer: string;
  confidence: number;
  tokenUsage: number;
}

const agentKeywords: Record<AgentType, string[]> = {
  AUSTRIA_GUIDE: [],
  BENEFITS: ["benefit", "money", "ams", "familienbeihilfe", "sozialhilfe", "support", "allowance"],
  HOUSING: ["housing", "apartment", "rent", "miete", "wohnung", "kaution"],
  DOCUMENT: ["letter", "document", "pdf", "official", "deadline", "ams letter"],
  JOBS_AMS: ["job", "work", "ams", "cv", "bewerbung", "employment"],
  HEALTHCARE: ["health", "doctor", "ögk", "e-card", "hospital", "insurance"],
  SCHOOL_FAMILY: ["school", "kindergarten", "child", "family", "education"],
  TRANSLATION: ["translate", "translation", "meaning", "übersetzen"],
  TOURIST_LONGSTAY: ["tourist", "visit", "short stay", "sim card", "transport"],
  NEARBY_HELP: ["nearby", "office", "where", "map", "caritas", "ma35", "location"],
};

export function classifyAgent(message: string, preferred?: AgentType): AgentType {
  if (preferred && preferred !== "AUSTRIA_GUIDE") return preferred;
  const lower = message.toLowerCase();
  for (const [agent, keywords] of Object.entries(agentKeywords) as [AgentType, string[]][]) {
    if (agent === "AUSTRIA_GUIDE") continue;
    if (keywords.some((k) => lower.includes(k))) return agent;
  }
  return preferred ?? "AUSTRIA_GUIDE";
}

export async function runAgent(request: AgentRequest): Promise<AgentResponse> {
  const agentType = classifyAgent(request.message, request.agentType);
  const ragResults = await searchKnowledge(request.message);
  const citations = formatCitations(ragResults);
  const context = formatContext(ragResults);
  const systemPrompt = getAgentPrompt(agentType);
  const highRisk = detectHighRiskTopics(request.message);

  const userPrompt = `
User language preference: ${request.language ?? "en"}
${request.profileContext ? `User profile:\n${request.profileContext}\n` : ""}
Knowledge base context:
${context}

User message: ${request.message}
${highRisk ? "\nIMPORTANT: This topic may need professional help. Strongly recommend contacting an official office or qualified professional." : ""}

Respond in the user's preferred language. Include clear next steps as a numbered list at the end.
`;

  const openai = getOpenAIClient();
  if (!openai) {
    return {
      answer: wrapWithDisclaimer(
        `I understand you're asking about: "${request.message.slice(0, 100)}". ` +
          `As your ${agentType.replace(/_/g, " ").toLowerCase()} assistant, I recommend checking official sources like austria.gv.at or visiting a local help center. ` +
          `${getLlmSetupHint()}\n\nNext steps:\n1. Visit the relevant office\n2. Gather required documents\n3. Ask Ankommen AI again with specific details`,
      ),
      citations,
      nextSteps: ["Visit official office", "Gather documents", "Confirm with authority"],
      disclaimer: wrapWithDisclaimer("").split("---")[1]?.trim() ?? "",
      confidence: 0.5,
      tokenUsage: 0,
    };
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...(request.history ?? []).slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userPrompt },
  ];

  const completion = await openai.chat.completions.create({
    model: getChatModel(),
    messages,
    temperature: 0.4,
    max_tokens: 1500,
  });

  const rawAnswer = completion.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  const answer = wrapWithDisclaimer(rawAnswer);
  const tokenUsage = completion.usage?.total_tokens ?? 0;

  const nextStepsMatch = rawAnswer.match(/(?:next steps?|nächste schritte?)[:.]?\s*((?:\d+[\.)]\s*.+\n?)+)/i);
  const nextSteps = nextStepsMatch?.[1]
    ? nextStepsMatch[1].split("\n").filter(Boolean).map((s) => s.replace(/^\d+[\.)]\s*/, ""))
    : ["Contact the relevant official office for confirmation"];

  return {
    answer,
    citations,
    nextSteps,
    disclaimer: "This is guidance only — not legal, financial, or medical advice.",
    confidence: ragResults.length > 0 ? Math.min(0.9, ragResults[0]?.score ?? 0.7) : 0.6,
    tokenUsage,
  };
}

export async function analyzeDocument(text: string, language = "en") {
  return runAgent({
    message: `Analyze this official document and explain it simply:\n\n${text.slice(0, 8000)}`,
    agentType: "DOCUMENT",
    language,
  });
}

export async function runBenefitCheck(answers: Record<string, unknown>, language = "en") {
  return runAgent({
    message: `Based on these answers, what benefits MIGHT the user be eligible for? Never guarantee amounts.\n${JSON.stringify(answers)}`,
    agentType: "BENEFITS",
    language,
  });
}

export async function translateText(text: string, from: string, to: string) {
  return runAgent({
    message: `Translate from ${from} to ${to} and explain any official terms:\n\n${text}`,
    agentType: "TRANSLATION",
    language: to,
  });
}
