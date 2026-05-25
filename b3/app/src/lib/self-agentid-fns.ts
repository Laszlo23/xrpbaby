import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SELF_BASE_URL = "https://app.ai.self.xyz";

type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | {
      [key: string]: Json;
    };

type SelfResult = { ok: true; data: Json } | { ok: false; status: number; error: Json };

const startSchema = z.object({
  mode: z.enum(["linked", "wallet-free", "ed25519", "ed25519-linked", "privy", "smartwallet"]),
  network: z.enum(["mainnet", "testnet"]),
  humanAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
  ed25519Pubkey: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/)
    .optional(),
  ed25519Signature: z
    .string()
    .regex(/^[0-9a-fA-F]{128}$/)
    .optional(),
  disclosures: z
    .object({
      minimumAge: z.union([z.literal(0), z.literal(18), z.literal(21)]).optional(),
      ofac: z.boolean().optional(),
      nationality: z.boolean().optional(),
      name: z.boolean().optional(),
      date_of_birth: z.boolean().optional(),
      gender: z.boolean().optional(),
      issuing_state: z.boolean().optional(),
    })
    .partial()
    .optional(),
});

function coerceJson(txt: string): Json {
  if (!txt) return null;
  try {
    return JSON.parse(txt) as Json;
  } catch {
    return txt;
  }
}

async function postJson(path: string, body: unknown): Promise<SelfResult> {
  const r = await fetch(`${SELF_BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const txt = await r.text();
  const parsed = coerceJson(txt);
  if (!r.ok) {
    return { ok: false, status: r.status, error: parsed };
  }
  return { ok: true, data: parsed };
}

async function getJson(pathWithQuery: string): Promise<SelfResult> {
  const r = await fetch(`${SELF_BASE_URL}${pathWithQuery}`, { method: "GET" });
  const txt = await r.text();
  const parsed = coerceJson(txt);
  if (!r.ok) {
    return { ok: false, status: r.status, error: parsed };
  }
  return { ok: true, data: parsed };
}

export const postSelfStartRegistration = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => startSchema.parse(raw))
  .handler(async ({ data }) => {
    return await postJson("/api/agent/register", data);
  });

export const postSelfPollRegistrationStatus = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ token: z.string().min(8).max(2000) }).parse(raw))
  .handler(async ({ data }) => {
    const token = encodeURIComponent(data.token);
    return await getJson(`/api/agent/register/status?token=${token}`);
  });

export const postSelfRegenerateQr = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ token: z.string().min(8).max(2000) }).parse(raw))
  .handler(async ({ data }) => {
    const token = encodeURIComponent(data.token);
    return await getJson(`/api/agent/register/qr?token=${token}`);
  });

export const postSelfExportPrivateKey = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => z.object({ token: z.string().min(8).max(2000) }).parse(raw))
  .handler(async ({ data }) => {
    return await postJson("/api/agent/register/export", { token: data.token });
  });

export const postSelfEd25519Challenge = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        pubkey: z.string().regex(/^[0-9a-fA-F]{64}$/),
        network: z.enum(["mainnet", "testnet"]),
        humanAddress: z
          .string()
          .regex(/^0x[0-9a-fA-F]{40}$/)
          .optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    return await postJson("/api/agent/register/ed25519-challenge", data);
  });
