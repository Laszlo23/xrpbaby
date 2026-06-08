export const STUDIO_FREE_GENERATIONS_PER_DAY = 5;
export const STUDIO_GENERATION_POINT_COST = 10;
export const STUDIO_DEPLOY_BCC_FEE = 50;
export const STUDIO_MAX_PROJECTS_PER_MEMBER = 10;
export const STUDIO_AGENT_MAX_ITERATIONS = 8;

export function studioSandboxHost(): string | null {
  const host = process.env.STUDIO_SANDBOX_HOST?.trim();
  return host || null;
}

export function studioSandboxSecret(): string | null {
  return process.env.STUDIO_SANDBOX_SECRET?.trim() || null;
}

export function studioPreviewPublicOrigin(): string {
  return (
    process.env.STUDIO_PREVIEW_ORIGIN?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    "http://localhost:5173"
  );
}

export function createOsApiBase(): string | null {
  return process.env.CREATEOS_API_BASE?.trim() || null;
}

export function createOsApiKey(): string | null {
  return process.env.CREATEOS_API_KEY?.trim() || null;
}
