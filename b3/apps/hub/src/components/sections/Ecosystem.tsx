import { motion } from "framer-motion";
import { useRef, useState } from "react";

const products = [
  {
    url: "https://0x.buildingculture.capital",
    label: "0x.buildingculture.capital",
    desc: "Onchain treasury & raw protocol surface.",
    tag: "protocol",
  },
  {
    url: "https://buildingculture.capital",
    label: "buildingculture.capital",
    desc: "The umbrella. Vision, capital, ecosystem.",
    tag: "core",
  },
  {
    url: "https://app.buildingculture.capital",
    label: "app.buildingculture.capital",
    desc: "Live dApp. Hold, move, build.",
    tag: "app",
  },
  {
    url: "https://eco.buildingculture.capital",
    label: "eco.buildingculture.capital",
    desc: "Eco layer — real-world ownership rails.",
    tag: "eco",
  },
];

const positions = [
  { x: 12, y: 18 },
  { x: 70, y: 12 },
  { x: 18, y: 68 },
  { x: 72, y: 72 },
];

const Card = ({ p }: { p: typeof products[number] }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });
  return (
    <motion.a
      ref={ref}
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setT({ rx: -py * 8, ry: px * 10 });
      }}
      onMouseLeave={() => setT({ rx: 0, ry: 0 })}
      style={{ transform: `perspective(1000px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)` }}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 30 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-card/60 hover:glow-gold"
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-secondary-glow/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
           style={{ background: "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), hsl(var(--primary)/0.12), transparent 40%)" }} />
      <div className="relative flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{p.tag}</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary-glow/40 bg-secondary/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-eco">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary-glow animate-pulse-glow" />
          live
        </span>
      </div>
      <h3 className="relative mt-12 font-display text-2xl leading-tight text-foreground md:text-3xl">
        {p.label}
      </h3>
      <p className="relative mt-3 max-w-md text-sm text-muted-foreground">{p.desc}</p>
      <div className="relative mt-10 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-gold transition-transform duration-500 group-hover:translate-x-2">
        open <span>→</span>
      </div>
    </motion.a>
  );
};

export const Ecosystem = () => {
  return (
    <section id="ecosystem" className="relative overflow-hidden px-6 py-32 md:px-16 md:py-48 lg:px-24">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">02 — live ecosystem</p>
          <h2 className="mt-6 font-display text-4xl text-balance md:text-6xl lg:text-7xl">
            four products. <span className="italic text-muted-foreground">one network.</span>
          </h2>
        </motion.div>

        {/* network background */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <svg className="h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
            {positions.map((a, i) =>
              positions.slice(i + 1).map((b, j) => (
                <line
                  key={`${i}-${j}`}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="hsl(var(--primary))" strokeWidth="0.08" strokeDasharray="0.6 0.6"
                />
              ))
            )}
          </svg>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((p) => <Card key={p.url} p={p} />)}
        </div>
      </div>
    </section>
  );
};
