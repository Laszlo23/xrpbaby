type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export type InferenceBackend = "openai" | "og_compute";

export function getInferenceBackend(): InferenceBackend {
  return process.env.INFERENCE_BACKEND === "og_compute" ? "og_compute" : "openai";
}

/** OpenAI Chat Completions API */
export async function completeOpenAI(
  apiKey: string,
  model: string,
  messages: ChatMsg[],
  opts?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.35,
      max_tokens: opts?.max_tokens ?? 800,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `openai ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Optional remote HTTP inference endpoint (OpenAI-compatible or custom).
 * Set OG_COMPUTE_INFERENCE_URL to a service that accepts POST JSON:
 * { "model": string, "messages": [{ "role": "system"|"user"|"assistant", "content": string }], "temperature": number, "max_tokens": number }
 * and returns either OpenAI-shaped { choices[0].message.content } or { reply: string }.
 */
export async function completeOgCompute(messages: ChatMsg[], opts?: { temperature?: number; max_tokens?: number }): Promise<string> {
  const url = process.env.OG_COMPUTE_INFERENCE_URL;
  if (!url) throw new Error("OG_COMPUTE_INFERENCE_URL not set");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = process.env.OG_COMPUTE_API_KEY;
  if (key) headers.Authorization = `Bearer ${key}`;

  const model = process.env.OG_COMPUTE_MODEL ?? "default";

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.35,
      max_tokens: opts?.max_tokens ?? 800,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `og_compute ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    reply?: string;
  };
  if (typeof data.reply === "string") return data.reply;
  return data.choices?.[0]?.message?.content ?? "";
}

export async function completeChat(
  messages: ChatMsg[],
  opts?: { temperature?: number; max_tokens?: number }
): Promise<{ text: string; backend: InferenceBackend; model: string }> {
  const backend = getInferenceBackend();
  if (backend === "og_compute") {
    const text = await completeOgCompute(messages, opts);
    return { text, backend, model: process.env.OG_COMPUTE_MODEL ?? "og_compute" };
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const text = await completeOpenAI(apiKey, model, messages, opts);
  return { text, backend: "openai", model };
}
