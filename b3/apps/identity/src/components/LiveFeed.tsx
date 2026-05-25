import { motion } from "framer-motion";

const NAMES = [
  { name: "laszlo.culture", owner: "0x7a..3f1", time: "2s ago", color: "primary" },
  { name: "vienna.build", owner: "0xb2..9c4", time: "14s ago", color: "gold" },
  { name: "tribeca.home", owner: "0x4f..a82", time: "38s ago", color: "primary" },
  { name: "creator.eco", owner: "0xc8..712", time: "1m ago", color: "gold" },
  { name: "atelier.culture", owner: "0x91..d35", time: "2m ago", color: "primary" },
  { name: "soho.city", owner: "0x3e..f08", time: "3m ago", color: "primary" },
  { name: "founder.capital", owner: "0x66..b21", time: "4m ago", color: "gold" },
  { name: "kyoto.home", owner: "0xa1..e9f", time: "6m ago", color: "primary" },
  { name: "studio.build", owner: "0x5d..47a", time: "8m ago", color: "primary" },
  { name: "salon.culture", owner: "0x82..1c6", time: "11m ago", color: "gold" },
];

export function LiveFeed() {
  const items = [...NAMES, ...NAMES];
  return (
    <div className="relative overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
      <div className="animate-marquee flex gap-3 whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((n, i) => (
          <motion.div
            key={i}
            className="glass flex items-center gap-4 rounded-full px-5 py-3"
          >
            <span className={`h-2 w-2 rounded-full ${n.color === "gold" ? "bg-gold" : "bg-primary"} animate-pulse`} />
            <span className="font-display text-base font-medium tracking-tight">
              {n.name.split(".")[0]}
              <span className={n.color === "gold" ? "text-gold" : "text-primary"}>.{n.name.split(".")[1]}</span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{n.owner}</span>
            <span className="font-mono text-[10px] text-muted-foreground">· {n.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
