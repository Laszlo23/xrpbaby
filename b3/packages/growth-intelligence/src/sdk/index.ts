import type { GrowthEventInput, GrowthEventKind } from "../types.js";

export type GrowthSdkConfig = {
  appSlug: string;
  apiKey: string;
  endpoint?: string;
  maskSelectors?: string[];
  sampleRate?: number;
  flushIntervalMs?: number;
};

const DEFAULT_ENDPOINT = "/api/intelligence";

let config: GrowthSdkConfig | null = null;
let sessionId = "";
let queue: GrowthEventInput[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let lastClickTs = 0;
let clickBurst = 0;
let initialized = false;

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `gi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function shouldSample(rate: number): boolean {
  return Math.random() <= rate;
}

function isMasked(target: EventTarget | null): boolean {
  if (!config?.maskSelectors?.length || !(target instanceof Element)) return false;
  return config.maskSelectors.some((sel) => target.closest(sel));
}

function selectorFor(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls =
    el.classList.length > 0
      ? `.${Array.from(el.classList).slice(0, 3).join(".")}`
      : "";
  const text = (el.textContent ?? "").trim().slice(0, 40);
  return text ? `${tag}${id}${cls}[${text}]` : `${tag}${id}${cls}`;
}

function enqueue(kind: GrowthEventKind, partial: Partial<GrowthEventInput> = {}): void {
  if (!config) return;
  const rate = config.sampleRate ?? 1;
  if (kind === "mousemove" && !shouldSample(0.05)) return;

  queue.push({
    kind,
    pathname: typeof window !== "undefined" ? window.location.pathname : "/",
    viewportW: typeof window !== "undefined" ? window.innerWidth : undefined,
    viewportH: typeof window !== "undefined" ? window.innerHeight : undefined,
    ts: Date.now(),
    ...partial,
  });

  if (queue.length >= 50) void flush();
}

async function flush(): Promise<void> {
  if (!config || queue.length === 0) return;
  const batch = queue.splice(0, 100);
  const endpoint = (config.endpoint ?? DEFAULT_ENDPOINT).replace(/\/$/, "");

  try {
    await fetch(`${endpoint}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "X-GI-App": config.appSlug,
      },
      body: JSON.stringify({ sessionId, events: batch }),
      keepalive: true,
    });
  } catch {
    queue.unshift(...batch);
  }
}

function onClick(ev: MouseEvent): void {
  if (isMasked(ev.target)) return;
  const el = ev.target instanceof Element ? ev.target : null;
  const now = Date.now();
  if (now - lastClickTs < 800) clickBurst += 1;
  else clickBurst = 1;
  lastClickTs = now;

  const kind: GrowthEventKind = clickBurst >= 4 ? "rage_click" : "click";
  enqueue(kind, {
    x: ev.clientX,
    y: ev.clientY,
    selector: el ? selectorFor(el) : undefined,
  });
}

function onScroll(): void {
  const doc = document.documentElement;
  const depth = Math.round(
    ((window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1)) * 100,
  );
  enqueue("scroll", { scrollDepth: Math.min(100, depth) });
}

function onMouseMove(ev: MouseEvent): void {
  enqueue("mousemove", { x: ev.clientX, y: ev.clientY });
}

function onPageView(): void {
  enqueue("page_view", { pathname: window.location.pathname });
}

export function initGrowthIntelligence(cfg: GrowthSdkConfig): void {
  if (typeof window === "undefined" || initialized) return;
  if (!cfg.apiKey?.trim()) return;

  config = {
    flushIntervalMs: 5000,
    sampleRate: 1,
    ...cfg,
  };
  sessionId = randomId();
  initialized = true;

  onPageView();
  document.addEventListener("click", onClick, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("beforeunload", () => void flush());

  const interval = config.flushIntervalMs ?? 5000;
  flushTimer = setInterval(() => void flush(), interval);

  const origPush = history.pushState.bind(history);
  history.pushState = (...args) => {
    origPush(...args);
    onPageView();
  };
  window.addEventListener("popstate", onPageView);
}

export function trackGrowthEvent(
  kind: GrowthEventKind,
  meta?: Record<string, unknown>,
): void {
  enqueue(kind, { meta, pathname: typeof window !== "undefined" ? window.location.pathname : "/" });
}

export function getGrowthSessionId(): string {
  return sessionId;
}

export function shutdownGrowthIntelligence(): void {
  if (flushTimer) clearInterval(flushTimer);
  document.removeEventListener("click", onClick);
  window.removeEventListener("scroll", onScroll);
  document.removeEventListener("mousemove", onMouseMove);
  void flush();
  initialized = false;
  config = null;
}
