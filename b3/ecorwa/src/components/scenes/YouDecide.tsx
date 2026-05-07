import { useCallback, useRef, useState } from "react";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

const STEP = 4;

/** Full-viewport drag: collapse vs revival blend + live copy */
export const YouDecide = () => {
  const areaRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(58);
  const dragTargetRef = useRef<HTMLDivElement | null>(null);

  const moveToClientX = useCallback((clientX: number) => {
    const el = areaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setP(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") e.preventDefault();
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
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setP((x) => Math.max(0, x - STEP));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setP((x) => Math.min(100, x + STEP));
    }
  };

  const dragProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: () => {
      dragTargetRef.current = null;
    },
  } as const;

  const collapseOpacity = (100 - p) / 100;
  const revivalOpacity = p / 100;
  const hueShift = 215 - (p / 100) * (215 - 73);

  return (
    <section id="you-decide" className="relative min-h-screen overflow-hidden bg-background py-12 md:py-16">
      <div className="container relative z-10 mb-6 px-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-2">
          / you decide
        </p>
        <h2 className="font-bold uppercase leading-[0.95] tracking-tight max-w-3xl" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>
          drag the seam. <span className="text-acid">same building.</span>
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">Today left · vision right.</p>
      </div>

      <div className="relative mx-auto min-h-[min(82vh,840px)] w-full max-w-[1600px] px-4 pb-6">
        <div
          ref={areaRef}
          className={cn(
            "relative h-[min(88vh,920px)] w-full overflow-hidden rounded-2xl shadow-[0_0_80px_-20px_hsl(var(--primary)/0.35)] transition-[border-color,box-shadow] duration-500 md:rounded-3xl",
          )}
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: `hsl(${hueShift} 35% ${28 + (p / 100) * 18}%)`,
            boxShadow: `0 0 ${60 + p * 0.4}px -18px hsl(${hueShift} 60% 50% / ${0.15 + (p / 100) * 0.35})`,
          }}
        >
          <img
            src={media.lagerhausOld}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-[0.65] grayscale transition-opacity duration-300"
            style={{ opacity: collapseOpacity }}
            loading="lazy"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r transition-opacity duration-300"
            style={{
              opacity: collapseOpacity * 0.85,
              background: `linear-gradient(90deg, hsl(215 40% 12% / 0.55) 0%, transparent 65%)`,
            }}
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${p}%)` }}>
            <img
              src={media.lagerhausNew}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.05] saturate-[1.1] transition-opacity duration-300"
              style={{ opacity: revivalOpacity > 0 ? 1 : 0 }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-primary/15 to-transparent" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center px-4 text-center md:top-12">
            <div className="relative inline-block min-h-[3em] min-w-[min(90vw,28rem)]">
              <p
                className="absolute inset-x-0 top-0 font-mono text-xs uppercase leading-relaxed tracking-[0.35em] transition-opacity duration-300 md:text-sm"
                style={{
                  opacity: collapseOpacity,
                  color: `hsl(${hueShift} ${20 + (p / 100) * 40}% ${72 + (p / 100) * 18}%)`,
                  textShadow: "0 2px 24px rgba(0,0,0,0.65)",
                }}
              >
                you are choosing collapse
              </p>
              <p
                className="absolute inset-x-0 top-0 font-mono text-xs uppercase leading-relaxed tracking-[0.35em] transition-opacity duration-300 md:text-sm"
                style={{
                  opacity: revivalOpacity,
                  color: `hsl(${hueShift} ${25 + (p / 100) * 45}% ${65 + (p / 100) * 22}%)`,
                  textShadow: "0 2px 24px rgba(0,0,0,0.65)",
                }}
              >
                you are choosing revival
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-6 left-6 rounded-md bg-background/75 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur-sm md:bottom-10 md:left-10">
            today
          </div>
          <div className="pointer-events-none absolute bottom-6 right-6 rounded-md bg-background/75 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-primary backdrop-blur-sm md:bottom-10 md:right-10">
            community trajectory
          </div>

          <div className="absolute inset-0 z-[5] cursor-ew-resize touch-none select-none" aria-hidden {...dragProps} />

          <div
            role="slider"
            tabIndex={0}
            aria-label="Drag between collapse and revival."
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(p)}
            className="absolute inset-y-0 z-[6] flex w-14 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ left: `${p}%` }}
            {...dragProps}
            onKeyDown={onKeyDown}
          >
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_16px_hsl(var(--primary)/0.8)]" />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/70 bg-background/90 shadow-[0_0_24px_hsl(var(--primary)/0.4)] transition-transform hover:scale-105">
              <span className="block h-4 w-0.5 rounded-full bg-primary" />
              <span className="absolute block h-0.5 w-4 rounded-full bg-primary" />
            </span>
          </div>
        </div>
      </div>

      <p className="container px-4 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        same village · different rulebook · you choose the weight
      </p>
    </section>
  );
};
