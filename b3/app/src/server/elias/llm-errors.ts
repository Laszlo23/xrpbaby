/** Rate limits / overload from OpenAI (LangChain wrapper) or Anthropic SDK. */
export function isLLMRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const o = err as Record<string, unknown>;
  if (o.lc_error_code === "MODEL_RATE_LIMIT") return true;
  if (typeof o.status === "number" && (o.status === 429 || o.status === 529)) return true;
  if (typeof o.message === "string" && /\b429\b|529|rate.?limit|overloaded/i.test(o.message))
    return true;
  const inner = o.error;
  if (inner && typeof inner === "object" && "code" in inner) {
    const code = (inner as { code?: string }).code;
    if (code === "rate_limit_exceeded") return true;
  }
  if (inner && typeof inner === "object" && "type" in inner) {
    const t = (inner as { type?: string }).type;
    if (t === "rate_limit_error" || t === "overloaded_error") return true;
  }
  return false;
}

export function isLLMAuthError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const o = err as Record<string, unknown>;
  if (o.lc_error_code === "MODEL_AUTHENTICATION") return true;
  if (typeof o.status === "number" && (o.status === 401 || o.status === 403)) return true;
  if (
    typeof o.message === "string" &&
    /authentication_error|invalid x-api-key|unauthorized/i.test(o.message)
  )
    return true;
  const inner = o.error;
  if (inner && typeof inner === "object" && "type" in inner) {
    const t = (inner as { type?: string }).type;
    if (t === "authentication_error") return true;
  }
  return false;
}

export function isLLMNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const o = err as Record<string, unknown>;
  if (o.lc_error_code === "MODEL_NOT_FOUND") return true;
  if (typeof o.status === "number" && o.status === 404) return true;
  if (typeof o.message === "string" && /model.*not.*found|404/i.test(o.message)) return true;
  return false;
}

export const ELIAS_RATE_LIMIT_REPLY =
  "**Elias — rate limited** — the model provider is throttling requests. Wait a minute and try again.\n\nIf you want to use Anthropic credits: set `ANTHROPIC_API_KEY` and `ELIAS_LLM_PROVIDER=anthropic` in `frontend/.env`, restart `npm run dev`.\n\nYou can also raise `ELIAS_LLM_MAX_RETRIES` (default 8; falls back to `OPENAI_MAX_RETRIES`).";

export const ELIAS_AUTH_REPLY =
  "**Elias — auth failed** — the AI provider rejected the API key (401/403). If you’re using Claude, double-check `ANTHROPIC_API_KEY` (no quotes, no spaces) and restart `npm run dev`. If you want OpenAI instead, set `ELIAS_LLM_PROVIDER=openai`.";

export const ELIAS_NOT_FOUND_REPLY =
  "**Elias — model not found (404)** — the provider can’t find the model you configured. Check `AI_MODEL` (OpenAI) or `ANTHROPIC_MODEL` (Claude) in `frontend/.env`, then restart `npm run dev`.";
