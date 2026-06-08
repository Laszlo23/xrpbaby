#!/usr/bin/env node
/** Verify OpenAI chat works with current deploy/.env (bootstrap mode). */
const apiKey =
  process.env.AGENT_LLM_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
const model =
  process.env.AGENT_LLM_MODEL?.trim() || process.env.AI_MODEL?.trim() || "gpt-4o-mini";

if (!apiKey) {
  console.error("No OPENAI_API_KEY / AGENT_LLM_API_KEY in env");
  process.exit(1);
}

const res = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    messages: [
      { role: "system", content: "Reply with exactly: OPENAI_OK" },
      { role: "user", content: "ping" },
    ],
    max_tokens: 16,
    temperature: 0,
  }),
  signal: AbortSignal.timeout(60_000),
});

const text = await res.text();
if (!res.ok) {
  console.error(`✗ OpenAI HTTP ${res.status}: ${text.slice(0, 200)}`);
  process.exit(1);
}

const json = JSON.parse(text);
const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
console.log(`✓ OpenAI OK — model=${model} reply=${JSON.stringify(reply.slice(0, 80))}`);
