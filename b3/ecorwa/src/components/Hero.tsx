import { useCallback, useEffect, useRef, useState } from "react";
import { media } from "@/lib/media";
import { ArrowRight } from "lucide-react";
import { buildchainAppUrl } from "@/lib/site-urls";
import { cn } from "@/lib/utils";
import { useParallaxLayer } from "@/hooks/use-parallax-layer";

const STEP = 3;

/**
 * Extra “zoom out”: image layer is larger than the viewport so object-cover shows more scene
 * (full building + foreground). Match old/new wrappers so the seam stays aligned.
 */
const ZOOM_FRAME_CLASS =
  "absolute left-1/2 top-1/2 h-[126%] w-[126%] min-h-[126%] min-w-[126%] -translate-x-1/2 -translate-y-1/2";

/** Object anchor — slightly lower bias keeps parking / tires in frame when zoomed out */
const OBJ_OLD = "object-[50%_46%]";
const OBJ_NEW = "object-[50%_47%]";

/** Full sweep duration — slower reads calmer and more “premium” */
const ANIM_MS = 22000;
const P_MIN = 18;
const P_MAX = 84;

const DUST_SPECS = [
  { l: "8%", t: "18%", d: 0, s: 0.4 },
  { l: "22%", t: "42%", d: 0.4, s: 0.35 },
  { l: "35%", t: "12%", d: 0.2, s: 0.5 },
  { l: "55%", t: "58%", d: 0.6, s: 0.3 },
  { l: "72%", t: "28%", d: 0.1, s: 0.45 },
  { l: "88%", t: "72%", d: 0.8, s: 0.38 },
  { l: "18%", t: "78%", d: 0.5, s: 0.32 },
  { l: "63%", t: "88%", d: 0.3, s: 0.42 },
];

export const Hero = () => {
  const compareAreaRef = useRef<HTMLDivElement>(null);
  const parallaxBg = useParallaxLayer(0.12);
  const [p, setP] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseNudge, setMouseNudge] = useState(0);
  const [showBackToLife, setShowBackToLife] = useState(false);
  const dragTargetRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const pauseAnimUntilRef = useRef(0);

  const moveToClientX = useCallback((clientX: number) => {
    const el = compareAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setP(Math.max(0, Math.min(100, pct)));
  }, []);

  /** Oscillating mask: runs until pointer drag; keyboard pauses briefly */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let frame = 0;
    const t0 = performance.now();
    let lastCommit = 0;

    const loop = (now: number) => {
      const pausedByDrag = draggingRef.current;
      const pausedByKeyboard = now < pauseAnimUntilRef.current;
      if (!pausedByDrag && !pausedByKeyboard && now - lastCommit >= 32) {
        lastCommit = now;
        const elapsed = (now - t0) % ANIM_MS;
        const wave = (Math.sin((elapsed / ANIM_MS) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        const next = P_MIN + wave * (P_MAX - P_MIN);
        setP(next);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setShowBackToLife(true);
      return;
    }
    const t = window.setTimeout(() => setShowBackToLife(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = compareAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    setMouseNudge(nx * 20);
  };

  const onMouseLeave = () => setMouseNudge(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      e.preventDefault();
    }
    draggingRef.current = true;
    setIsDragging(true);
    dragTargetRef.current = e.currentTarget;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveToClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragTargetRef.current?.hasPointerCapture(e.pointerId)) return;
    moveToClientX(e.clientX);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragTargetRef.current = null;
    draggingRef.current = false;
    setIsDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    pauseAnimUntilRef.current = performance.now() + 2800;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setP((x) => Math.max(0, x - STEP));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setP((x) => Math.min(100, x + STEP));
    } else if (e.key === "Home") {
      e.preventDefault();
      setP(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setP(100);
    }
  };

  const dragProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: () => {
      dragTargetRef.current = null;
      draggingRef.current = false;
      setIsDragging(false);
    },
  } as const;

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      <div ref={parallaxBg} className="parallax-layer absolute inset-0 will-change-transform">
        <div
          ref={compareAreaRef}
          className="relative h-full min-h-screen w-full shadow-[inset_0_0_100px_rgba(0,0,0,0.45),inset_0_-80px_120px_rgba(0,0,0,0.35)]"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {/* Today — grayscale, zoomed out + subtle “system” drift + grain */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className={ZOOM_FRAME_CLASS}>
              <div className="h-full w-full motion-safe:animate-hero-drift">
                <div className="pointer-events-none h-full w-full origin-center will-change-transform motion-safe:animate-hero-left-zoom">
                  <img
                    src={media.lagerhausOld}
                    alt="Raiffeisen Lagerhaus Bernhardsthal today"
                    className={cn(
                      "h-full w-full object-cover grayscale",
                      OBJ_OLD,
                      "brightness-[0.82] contrast-[1.05] saturate-[0.85]"
                    )}
                  />
                </div>
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,hsl(0_0%_0%/0.25)_100%)] motion-safe:animate-flicker-cold"
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/[0.1]" />
            {/* Cold “system” bias on the left of the seam — follows mask */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[hsl(215_35%_12%/0.45)] via-[hsl(215_25%_8%/0.15)] to-transparent"
              style={{ clipPath: `inset(0 ${100 - p}% 0 0)` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-noise opacity-[0.14] mix-blend-overlay" aria-hidden />
            {DUST_SPECS.map((d, i) => (
              <span
                key={i}
                className="pointer-events-none absolute h-1 w-1 rounded-full bg-white/35 blur-[1px] motion-safe:animate-float"
                style={{ left: d.l, top: d.t, opacity: d.s, animationDelay: `${d.d}s` }}
                aria-hidden
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/42" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/25 to-transparent" />
          </div>

          {/* Vision — color, warm lift, same zoom + clip */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${p}%)`, willChange: "clip-path" }}
          >
            <div className={ZOOM_FRAME_CLASS}>
              <div className="pointer-events-none h-full w-full origin-center will-change-transform motion-safe:animate-hero-right-zoom">
                <img
                  src={media.lagerhausNew}
                  alt="Vision of the revitalized Lagerhaus"
                  className={cn(
                    "h-full w-full object-cover brightness-[1.06] saturate-[1.08]",
                    OBJ_NEW
                  )}
                />
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-primary/15 motion-safe:animate-flicker-warm"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-accent/[0.06]" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/18 via-transparent to-background/28" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/18 to-transparent" />
          </div>

          {/* Full-frame film grain (subtle) */}
          <div
            className="pointer-events-none absolute inset-0 bg-noise opacity-[0.06] mix-blend-soft-light"
            aria-hidden
          />

          <p
            className={cn(
              "pointer-events-none absolute bottom-[11%] left-[6%] z-[2] font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] transition-opacity duration-500 md:text-xs",
              isDragging && "opacity-25"
            )}
          >
            today
          </p>
          <p
            className={cn(
              "pointer-events-none absolute bottom-[11%] right-[6%] z-[2] font-mono text-[10px] uppercase tracking-[0.35em] text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] transition-opacity duration-500 md:text-xs",
              isDragging && "opacity-25"
            )}
          >
            vision
          </p>

          <div
            className="absolute inset-0 z-[5] cursor-ew-resize touch-none select-none"
            aria-hidden
            {...dragProps}
          />

          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare today’s building with the revitalized vision. Drag horizontally. Animation pauses while you drag."
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(p)}
            className={cn(
              "absolute inset-y-0 z-[6] flex w-16 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center transition-[filter] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isDragging && "drop-shadow-[0_0_28px_hsl(var(--primary)/0.85)]"
            )}
            style={{ left: `calc(${p}% + ${mouseNudge}px)` }}
            {...dragProps}
            onKeyDown={onKeyDown}
          >
            <span
              className={cn(
                "pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent transition-[box-shadow] duration-300",
                isDragging ? "shadow-[0_0_20px_hsl(var(--primary)/0.85)]" : "shadow-[0_0_10px_hsl(var(--primary)/0.45)]",
              )}
            />
            <span
              className={cn(
                "pointer-events-none relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-primary/50 bg-background/90 backdrop-blur-sm transition-all duration-300",
                isDragging ? "scale-[1.03] shadow-[0_0_28px_hsl(var(--primary)/0.45)]" : "shadow-[0_0_18px_hsl(var(--primary)/0.25)]",
              )}
            >
              <span className="block h-4 w-px rounded-full bg-primary" />
            </span>
          </div>
        </div>
      </div>

      {/* Foreground stack: dims while dragging so the comparison reads */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[7] transition-[opacity,filter] duration-500 ease-out",
          isDragging ? "opacity-[0.07] blur-[2px]" : "opacity-100 blur-0"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="pointer-events-none relative z-10 min-h-screen flex flex-col items-center justify-end px-5 text-center pt-20 pb-12 md:pb-16 md:pt-20">
        <div
          className={cn(
            "transition-[opacity,filter] duration-500 ease-out",
            isDragging ? "opacity-[0.06] blur-[1.5px]" : "opacity-100 blur-0"
          )}
        >
          <div className="pointer-events-auto inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary pulse-dot" />
              <span className="relative rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              1,247 builders already joined
            </span>
          </div>

          <h1
            className="pointer-events-none font-sans font-bold uppercase leading-[0.88] tracking-tight max-w-6xl animate-fade-in"
            style={{ animationDelay: "0.1s", fontSize: "clamp(2.75rem, 9vw, 8rem)" }}
          >
            we bring places <br />
            <span
              className={cn(
                "inline-block text-acid text-glow transition-all duration-500 ease-out",
                showBackToLife ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-sm translate-y-3",
              )}
            >
              back to life.
            </span>
          </h1>

          <p
            className="pointer-events-none mt-8 max-w-xl text-base md:text-xl text-muted-foreground font-light animate-fade-in"
            style={{ animationDelay: "0.25s" }}
          >
            banks see <span className="line-through opacity-60">risk</span>.{" "}
            we see <span className="text-accent">potential</span>.
          </p>
        </div>

        <div
          className={cn(
            "pointer-events-auto mt-12 flex flex-col sm:flex-row gap-4 animate-fade-in transition-[opacity,filter] duration-500 ease-out",
            isDragging ? "opacity-[0.15] blur-[1px]" : "opacity-100 blur-0"
          )}
          style={{ animationDelay: "0.4s" }}
        >
          <a href="#join" className="btn-acid">
            join the revival <ArrowRight size={16} />
          </a>
          <a href="#project" className="btn-ghost-acid">
            see the first place
          </a>
        </div>

        <p
          className={cn(
            "pointer-events-auto mt-8 max-w-lg text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground animate-fade-in transition-[opacity,filter] duration-500 ease-out",
            isDragging ? "opacity-[0.12] blur-[1px]" : "opacity-100 blur-0"
          )}
          style={{ animationDelay: "0.5s" }}
        >
          <a
            href={buildchainAppUrl()}
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary/90 underline-offset-4 transition-colors hover:text-accent"
          >
            Win stays & experiences — ticket NFTs on BUILDCHAIN ↗
          </a>
        </p>

        <div
          className={cn(
            "pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500",
            isDragging ? "opacity-[0.15]" : "opacity-100"
          )}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">scroll</span>
          <div className="relative w-px h-12 bg-border overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-4 bg-primary animate-scan" />
          </div>
        </div>
      </div>
    </section>
  );
};
