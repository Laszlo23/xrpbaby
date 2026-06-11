import OpenAI from "openai";

function getBaseURL() {
  return process.env.OPENAI_BASE_URL?.trim();
}

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

function isUsingLocalRunner() {
  return Boolean(getBaseURL());
}

/** True when OpenAI cloud or Docker Model Runner is configured. */
export function isLlmConfigured(): boolean {
  return Boolean(getApiKey() || getBaseURL());
}

let cachedClient: OpenAI | null | undefined;
let cachedClientKey: string | undefined;

export function getOpenAIClient(): OpenAI | null {
  if (!isLlmConfigured()) return null;

  const clientKey = `${getBaseURL() ?? ""}|${getApiKey() ?? ""}`;
  if (cachedClient === undefined || cachedClientKey !== clientKey) {
    cachedClientKey = clientKey;
    cachedClient = new OpenAI({
      apiKey: getApiKey() || "local",
      ...(getBaseURL() ? { baseURL: getBaseURL() } : {}),
    });
  }
  return cachedClient;
}

export function getChatModel(): string {
  return process.env.OPENAI_MODEL?.trim() || (isUsingLocalRunner() ? "ai/llama3.2" : "gpt-4o-mini");
}

export function getEmbeddingModel(): string | null {
  const explicit = process.env.OPENAI_EMBEDDING_MODEL?.trim();
  if (explicit) return explicit;
  if (!isUsingLocalRunner()) return "text-embedding-3-small";
  return null;
}

export function getLlmSetupHint(): string {
  if (isUsingLocalRunner()) {
    return "Enable Docker Model Runner, pull your models, and set OPENAI_MODEL (and OPENAI_EMBEDDING_MODEL for RAG).";
  }
  return "Set OPENAI_API_KEY for OpenAI cloud, or OPENAI_BASE_URL for Docker Model Runner.";
}

export async function createEmbedding(text: string): Promise<number[] | null> {
  const openai = getOpenAIClient();
  const model = getEmbeddingModel();
  if (!openai || !model) return null;

  const res = await openai.embeddings.create({ model, input: text });
  return res.data[0]?.embedding ?? null;
}
