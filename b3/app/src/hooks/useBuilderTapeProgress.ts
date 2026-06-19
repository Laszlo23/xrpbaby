import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "bc-builder-tape-progress:";

export type LocalTapeProgress = {
  currentTime: number;
  duration: number;
  updatedAt: number;
};

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function readLocalTapeProgress(slug: string): LocalTapeProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalTapeProgress;
    if (typeof parsed.currentTime !== "number" || typeof parsed.duration !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalTapeProgress(slug: string, progress: LocalTapeProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(progress));
  } catch {
    /* ignore quota */
  }
}

export function tapeListenRatio(progress: LocalTapeProgress | null): number {
  if (!progress || progress.duration <= 0) return 0;
  return Math.min(1, progress.currentTime / progress.duration);
}

export function useBuilderTapeProgress(slug: string) {
  const [progress, setProgress] = useState<LocalTapeProgress | null>(() =>
    readLocalTapeProgress(slug),
  );

  useEffect(() => {
    setProgress(readLocalTapeProgress(slug));
  }, [slug]);

  const persist = useCallback(
    (currentTime: number, duration: number) => {
      const next: LocalTapeProgress = {
        currentTime,
        duration,
        updatedAt: Date.now(),
      };
      writeLocalTapeProgress(slug, next);
      setProgress(next);
    },
    [slug],
  );

  const listenRatio = tapeListenRatio(progress);

  return { progress, persist, listenRatio };
}
