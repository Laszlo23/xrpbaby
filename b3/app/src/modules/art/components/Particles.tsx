import { useEffect, useRef } from "react";

export function Particles({ count = 40 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = c.offsetWidth * dpr;
      c.height = c.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.6 + 0.3,
      vy: -(Math.random() * 0.2 + 0.05) * dpr,
      vx: (Math.random() - 0.5) * 0.05 * dpr,
      a: Math.random() * 0.5 + 0.1,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -10) {
          d.y = c.height + 10;
          d.x = Math.random() * c.width;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.9 0.08 80 / ${d.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
