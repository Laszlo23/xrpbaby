"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Short lines so one row fits on mobile + desktop; includes community + uplift. */
const QUOTES = [
  "Be · Build · Trust",
  "Join the community",
  "Build together · rise together",
  "Own what matters",
  "Culture is the asset",
  "Community-owned cultural assets",
  "Transparency at scale",
  "Community-first capital",
  "Liquidity meets place",
  "Your place in the story",
] as const;

const TYPING_MS = 56;
const HOLD_MS = 4000;
const DELETE_MS = 36;
const BETWEEN_MS = 750;

function splitQuote(s: string): { a: string; b: string | null } {
  const idx = s.indexOf(" · ");
  if (idx === -1) return { a: s, b: null };
  return { a: s.slice(0, idx), b: s.slice(idx + 3) };
}

export function TypewriterQuotes() {
  const [text, setText] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;
    setText(QUOTES[quoteIndex]!);
  }, [reduceMotion, quoteIndex]);

  useEffect(() => {
    if (!reduceMotion) return;
    const id = window.setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;
    let charIndex = 0;
    let qIdx = 0;
    type Mode = "type" | "hold" | "del" | "between";
    let mode: Mode = "type";
    let t: ReturnType<typeof setTimeout>;

    const full = () => QUOTES[qIdx]!;

    const schedule = (fn: () => void, ms: number) => {
      t = setTimeout(fn, ms);
    };

    const loop = () => {
      if (cancelled) return;
      const s = full();

      if (mode === "type") {
        charIndex += 1;
        setText(s.slice(0, charIndex));
        if (charIndex >= s.length) {
          mode = "hold";
          schedule(loop, HOLD_MS);
        } else {
          schedule(loop, TYPING_MS);
        }
        return;
      }
      if (mode === "hold") {
        mode = "del";
        schedule(loop, 0);
        return;
      }
      if (mode === "del") {
        charIndex -= 1;
        setText(s.slice(0, Math.max(0, charIndex)));
        if (charIndex <= 0) {
          mode = "between";
          schedule(loop, BETWEEN_MS);
        } else {
          schedule(loop, DELETE_MS);
        }
        return;
      }
      qIdx = (qIdx + 1) % QUOTES.length;
      charIndex = 0;
      mode = "type";
      schedule(loop, TYPING_MS);
    };

    schedule(loop, TYPING_MS);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [reduceMotion]);

  const displayParts = splitQuote(text);

  return (
    <div
      className="relative z-10 mx-auto w-full max-w-[min(100%,56rem)] overflow-hidden rounded-lg px-3 py-1 sm:w-fit sm:rounded-xl sm:px-4 sm:py-1.5 md:rounded-2xl"
      aria-live="polite"
    >
      {/* Opaque on small screens so story text never shows through */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-lg border border-white/10 sm:rounded-xl md:rounded-2xl max-sm:bg-black/85 max-sm:shadow-none sm:border-white/12 sm:bg-black/50 ${!reduceMotion ? "sm:animate-[immersive-quote-glow_8s_ease-in-out_infinite_alternate]" : ""}`}
        aria-hidden
      />
      <p className="relative mx-auto max-w-full text-center font-mono text-[0.62rem] font-semibold uppercase leading-none tracking-[0.06em] text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.95)] sm:text-[0.7rem] sm:tracking-[0.07em] md:text-sm md:tracking-[0.09em]">
        <span className="inline-block w-full max-w-full truncate whitespace-nowrap">
          {reduceMotion ? (
            <>
              <span className="text-white">{displayParts.a}</span>
              {displayParts.b != null && (
                <>
                  <span className="text-white/95"> · </span>
                  <span className="text-gradient-eco">{displayParts.b}</span>
                </>
              )}
            </>
          ) : (
            <>
              <span className="text-white">{text}</span>
              <span className="ml-0.5 inline-block h-[0.75em] w-px translate-y-0.5 animate-pulse bg-eco-light/90" aria-hidden />
            </>
          )}
        </span>
      </p>
      <div className="relative mt-1 flex flex-col items-center gap-0.5 sm:mt-1.5">
        <Link
          href="/community"
          className="text-[8px] font-semibold uppercase tracking-[0.2em] text-eco-light/95 underline decoration-eco/50 underline-offset-[2px] transition hover:text-white hover:decoration-eco sm:text-[9px]"
        >
          Join the community
        </Link>
        <span className="text-[8px] font-medium uppercase tracking-[0.26em] text-white/45 sm:text-[9px] sm:tracking-[0.28em]">
          Building Culture
        </span>
      </div>
    </div>
  );
}
