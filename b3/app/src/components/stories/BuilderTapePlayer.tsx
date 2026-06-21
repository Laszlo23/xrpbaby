"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play } from "lucide-react";

import type { BuilderTape } from "@/content/builder-tapes";
import { BUILDER_TAPE_LISTEN_THRESHOLD } from "@/content/builder-tapes";
import { readLocalTapeProgress, useBuilderTapeProgress } from "@/hooks/useBuilderTapeProgress";
import { cn } from "@/lib/utils";

const PROGRESS_SAVE_MS = 2500;

type BuilderTapePlayerProps = {
  tape: BuilderTape;
  compact?: boolean;
  autoPlay?: boolean;
  onListenThreshold?: (payload: { listenedSeconds: number; durationSeconds: number }) => void;
  className?: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BuilderTapePlayer({
  tape,
  compact = false,
  autoPlay = false,
  onListenThreshold,
  className,
}: BuilderTapePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const thresholdFired = useRef(false);
  const lastPersistAt = useRef(0);
  const { progress, persist, listenRatio } = useBuilderTapeProgress(tape.slug);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(progress?.currentTime ?? 0);
  const [duration, setDuration] = useState(progress?.duration ?? tape.durationEstimate ?? 0);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, []);

  useEffect(() => {
    thresholdFired.current = false;
    lastPersistAt.current = 0;
    const saved = readLocalTapeProgress(tape.slug)?.currentTime ?? 0;
    setCurrentTime(saved);

    const audio = audioRef.current;
    if (audio && saved > 0) {
      audio.currentTime = saved;
    }
  }, [tape.slug]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const t = audio.currentTime;
      const d = audio.duration || duration;
      setCurrentTime(t);

      if (d > 0) {
        const now = Date.now();
        if (now - lastPersistAt.current >= PROGRESS_SAVE_MS) {
          lastPersistAt.current = now;
          persist(t, d);
        }
      }

      if (
        !thresholdFired.current &&
        d > 0 &&
        t / d >= BUILDER_TAPE_LISTEN_THRESHOLD &&
        onListenThreshold
      ) {
        thresholdFired.current = true;
        onListenThreshold({ listenedSeconds: t, durationSeconds: d });
      }
    };

    const onLoaded = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setPlaying(false);
      const d = audio.duration || duration;
      if (d > 0) persist(audio.currentTime, d);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      const d = audio.duration || duration;
      if (d > 0) persist(audio.currentTime, d);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [duration, onListenThreshold, persist, tape.slug]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      void audioRef.current.play().catch(() => undefined);
    }
  }, [autoPlay, tape.slug]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  const onSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = value;
    setCurrentTime(value);
    persist(value, duration);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : listenRatio * 100;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900/80 p-5",
        compact ? "p-4" : "p-6 md:p-8",
        className,
      )}
    >
      <audio ref={audioRef} src={tape.audioUrl} preload="metadata" />

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-full border border-[#C5FF41]/30 bg-[#C5FF41]/10",
            compact ? "h-14 w-14" : "h-20 w-20",
          )}
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80" aria-hidden>
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#C5FF41"
              strokeWidth="3"
              strokeDasharray={`${(progressPct / 100) * 226} 226`}
              strokeLinecap="round"
            />
          </svg>
          <Headphones className={cn("text-[#C5FF41]", compact ? "h-5 w-5" : "h-7 w-7")} />
        </div>

        <div className="min-w-0 flex-1">
          {!compact ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                {tape.kicker}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-white md:text-2xl">
                {tape.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{tape.oneLiner}</p>
            </>
          ) : (
            <p className="font-display text-sm font-semibold text-white">{tape.title}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C5FF41] text-black transition hover:bg-white"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#C5FF41]"
                aria-label="Seek"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSpeed((s) => (s === 1 ? 1.25 : 1))}
              className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400 hover:text-white"
            >
              {speed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
