const items = [
  { s: "BTC", v: "$98,420", d: "+2.4%", up: true },
  { s: "ETH", v: "$3,812", d: "+1.1%", up: true },
  { s: "SOL", v: "$214.30", d: "-0.8%", up: false },
  { s: "BASE TVL", v: "$14.2B", d: "+3.7%", up: true },
  { s: "RWA Vol", v: "$2.1B/24h", d: "+12.4%", up: true },
  { s: "Farcaster DAU", v: "612K", d: "+5.2%", up: true },
  { s: "AI Index", v: "1,284", d: "+1.9%", up: true },
  { s: "Stables Mkt", v: "$192B", d: "+0.4%", up: true },
  { s: "ONDO", v: "$1.42", d: "-2.1%", up: false },
  { s: "Tokenized T-Bills", v: "$4.8B", d: "+0.9%", up: true },
];

export function Ticker() {
  const row = [...items, ...items];
  return (
    <div className="marquee-mask relative overflow-hidden border-y border-white/10 bg-black/40 py-3 backdrop-blur-md">
      <div className="flex w-max animate-ticker gap-10 whitespace-nowrap">
        {row.map((it, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-xs">
            <span className="text-muted-foreground tracking-widest">{it.s}</span>
            <span className="text-foreground">{it.v}</span>
            <span style={{ color: it.up ? "var(--positive)" : "var(--negative)" }}>{it.d}</span>
            <span className="h-1 w-1 rounded-full bg-electric/70" style={{ background: "var(--electric)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
