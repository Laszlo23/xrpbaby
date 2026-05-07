import { useEffect, useState } from "react";

type Options = {
  /** When false, full text is shown immediately (e.g. reduced motion or inactive slide). */
  enabled: boolean;
  msPerChar?: number;
  startDelayMs?: number;
  /** Bump when the source string or slide changes to restart typing. */
  resetKey: string | number;
};

/**
 * Character-at-a-time reveal for headlines. Resets when `resetKey` or `text` changes.
 */
export function useTypewriter(text: string, options: Options) {
  const { enabled, msPerChar = 22, startDelayMs = 140, resetKey } = options;
  const [visibleCount, setVisibleCount] = useState(() => (enabled ? 0 : text.length));

  useEffect(() => {
    if (!text) {
      setVisibleCount(0);
      return;
    }
    if (!enabled) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);
    let cancelled = false;
    const startTimer = window.setTimeout(() => {
      let i = 0;
      const step = () => {
        if (cancelled) return;
        i += 1;
        setVisibleCount(Math.min(i, text.length));
        if (i < text.length) {
          window.setTimeout(step, msPerChar);
        }
      };
      step();
    }, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
    };
  }, [text, enabled, msPerChar, startDelayMs, resetKey]);

  const visibleStr = text.slice(0, visibleCount);
  const done = visibleCount >= text.length;

  return { visibleStr, done };
}
