import {
  studioPreviewPublicOrigin,
  studioSandboxHost,
  studioSandboxSecret,
} from "@/server/studio/config";

export type SandboxCreateResult = {
  sandboxId: string;
  port: number;
  previewUrl: string;
};

function orchestratorUrl(path: string): string | null {
  const host = studioSandboxHost();
  if (!host) return null;
  const base = host.replace(/\/$/, "");
  return `${base}${path}`;
}

function authHeaders(): Record<string, string> {
  const secret = studioSandboxSecret();
  return secret ? { Authorization: `Bearer ${secret}` } : {};
}

export function isSandboxConfigured(): boolean {
  return Boolean(studioSandboxHost());
}

export function localPreviewUrl(projectId: string, port?: number | null): string | null {
  if (!port) return null;
  const origin = studioPreviewPublicOrigin().replace(/\/$/, "");
  return `${origin}/api/studio/preview/${projectId}`;
}

export async function createSandbox(
  projectId: string,
): Promise<SandboxCreateResult | { error: string }> {
  const url = orchestratorUrl("/sandboxes");
  if (!url) return { error: "sandbox_not_configured" };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ projectId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { error: text || `sandbox_create_failed_${res.status}` };
  }

  const data = (await res.json()) as {
    sandboxId: string;
    port: number;
  };

  return {
    sandboxId: data.sandboxId,
    port: data.port,
    previewUrl: localPreviewUrl(projectId, data.port) ?? `http://127.0.0.1:${data.port}`,
  };
}

export async function syncSandboxFiles(
  sandboxId: string,
  files: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  const url = orchestratorUrl(`/sandboxes/${encodeURIComponent(sandboxId)}/sync`);
  if (!url) return { ok: false, error: "sandbox_not_configured" };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ files }),
  });

  if (!res.ok) {
    return { ok: false, error: await res.text().catch(() => "sync_failed") };
  }
  return { ok: true };
}

export async function deleteSandbox(sandboxId: string): Promise<void> {
  const url = orchestratorUrl(`/sandboxes/${encodeURIComponent(sandboxId)}`);
  if (!url) return;
  await fetch(url, { method: "DELETE", headers: authHeaders() }).catch(() => {});
}

export async function getSandboxHealth(
  sandboxId: string,
): Promise<{ ready: boolean; logs?: string }> {
  const url = orchestratorUrl(`/sandboxes/${encodeURIComponent(sandboxId)}/health`);
  if (!url) return { ready: false, logs: "sandbox_not_configured" };

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { ready: false, logs: await res.text().catch(() => "") };
  const data = (await res.json()) as { ready: boolean; logs?: string };
  return data;
}

export async function runSandboxCommand(
  sandboxId: string,
  command: string,
): Promise<{ ok: boolean; output: string }> {
  const url = orchestratorUrl(`/sandboxes/${encodeURIComponent(sandboxId)}/exec`);
  if (!url) return { ok: false, output: "sandbox_not_configured" };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ command }),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; output?: string };
  return { ok: Boolean(data.ok), output: data.output ?? "" };
}
