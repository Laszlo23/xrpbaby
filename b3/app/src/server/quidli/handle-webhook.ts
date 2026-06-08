import type { PrismaClient } from "@prisma/client";

export type QuidliWebhookResult =
  | { ok: true; stored: boolean }
  | { ok: false; error: string; status: number };

function verifyQuidliWebhookAuth(request: Request, expectedKey: string): boolean {
  const candidates = [
    request.headers.get("x-quidli-api-key"),
    request.headers.get("x-api-key"),
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""),
    request.headers.get("authorization")?.replace(/^ApiKey\s+/i, ""),
  ];
  return candidates.some((v) => v?.trim() === expectedKey);
}

export async function handleQuidliWebhook(
  request: Request,
  prisma: PrismaClient | null,
  apiKey: string,
): Promise<QuidliWebhookResult> {
  if (!verifyQuidliWebhookAuth(request, apiKey)) {
    return { ok: false, error: "unauthorized", status: 401 };
  }

  let payload: unknown = null;
  const raw = await request.text();
  if (raw.trim()) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      payload = { raw: raw.slice(0, 4000) };
    }
  }

  if (prisma) {
    await prisma.activityEvent.create({
      data: {
        type: "quidli:webhook",
        sourceModule: "quidli",
        payload: payload as object,
      },
    });
  }

  return { ok: true, stored: Boolean(prisma) };
}
