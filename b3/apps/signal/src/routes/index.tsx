import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ParticleField } from "@/components/landing/ParticleField";
import { Ticker } from "@/components/landing/Ticker";

/* ------------- helpers ------------- */

function Reveal({ children, delay = 0, y = 24 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full" style={{ background: "var(--electric)" }} />
      {children}
    </div>
  );
}

function GlowButton({
  children, variant = "primary", as: As = "button", ...rest
}: any) {
  const base =
    "group relative inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium tracking-wide transition-all duration-300 will-change-transform";
  const styles =
    variant === "primary"
      ? "text-primary-foreground bg-foreground hover:scale-[1.02] glow-electric"
      : "text-foreground glass hover:bg-white/10 hover:glow-violet";
  return (
    <As className={`${base} ${styles}`} {...rest}>
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "var(--gradient-electric)", filter: "blur(20px)", zIndex: 0 }} />
      )}
    </As>
  );
}

/* ------------- HERO ------------- */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const reduce = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0"><ParticleField /></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

      {/* Top nav */}
      <header className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 rounded-md" style={{ background: "var(--gradient-electric)" }}>
            <div className="absolute inset-[3px] rounded-[5px] bg-background" />
            <div className="absolute inset-[6px] rounded-sm" style={{ background: "var(--gradient-electric)" }} />
          </div>
          <span className="font-display text-base font-semibold tracking-tight">signal//chain</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a className="transition hover:text-foreground" href="#why">why</a>
          <a className="transition hover:text-foreground" href="#feed">feed</a>
          <a className="transition hover:text-foreground" href="#community">community</a>
          <a className="transition hover:text-foreground" href="#products">products</a>
        </nav>
        <GlowButton as="a" href="#cta" variant="ghost">enter →</GlowButton>
      </header>

      <motion.div style={{ y, opacity }} className="relative z-20 mx-auto flex max-w-6xl flex-col items-center px-6 pt-10 text-center md:pt-20">
        <Eyebrow>live · onchain intelligence</Eyebrow>
        <h1 className="mt-8 font-display text-[clamp(2.5rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-tighter">
          <span className="text-gradient-electric">the future is being</span>
          <br />
          <span className="text-gradient-aurora">built onchain.</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
          real signal. real builders. real culture. <br className="hidden md:block" />
          a newsroom for the post-platform internet.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <GlowButton as="a" href="#cta" variant="primary">enter the network</GlowButton>
          <GlowButton as="a" href="#community" variant="ghost">become a founding member</GlowButton>
        </div>

        {/* floating panels */}
        <div className="pointer-events-none mt-20 hidden w-full grid-cols-3 gap-4 md:grid">
          <FloatingPanel delay={0} title="BASE · L2" stat="14.2B TVL" trend="+3.7%" />
          <FloatingPanel delay={0.15} title="RWA · ONDO" stat="$2.1B vol" trend="+12.4%" highlight />
          <FloatingPanel delay={0.3} title="FARCASTER" stat="612K DAU" trend="+5.2%" />
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-20"><Ticker /></div>
    </section>
  );
}

function FloatingPanel({ title, stat, trend, delay = 0, highlight = false }:
  { title: string; stat: string; trend: string; delay?: number; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.6 + delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative animate-float overflow-hidden rounded-2xl p-4 text-left ${highlight ? "glass-strong glow-electric" : "glass"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{title}</span>
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full" style={{ background: "var(--electric)" }} />
      </div>
      <div className="mt-3 font-display text-2xl">{stat}</div>
      <div className="mt-1 font-mono text-xs" style={{ color: "var(--positive)" }}>{trend}</div>
      <Sparkline />
    </motion.div>
  );
}

function Sparkline() {
  const pts = [10, 8, 14, 11, 18, 15, 22, 19, 28, 24, 32, 30, 38];
  const max = 40;
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${i * 8} ${max - p}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" className="mt-3 h-10 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--electric)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--electric)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 96 40 L 0 40 Z`} fill="url(#sg)" />
      <path d={d} fill="none" stroke="var(--electric)" strokeWidth="1.2" />
    </svg>
  );
}

/* ------------- WHY ------------- */

function Why() {
  return (
    <section id="why" className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal><Eyebrow>why this exists</Eyebrow></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              the news cycle is <span className="text-gradient-aurora">already late.</span>
            </h2>
          </Reveal>
        </div>
        <div className="md:col-span-7 md:pt-24">
          <Reveal delay={0.2}>
            <p className="text-lg text-muted-foreground md:text-xl">
              By the time mainstream media calls it a story, the network already moved.
              We sit on the wire — between AI, crypto, RWAs, culture, and the people
              quietly building the next decade. No noise. No takes-for-clicks. Pure signal,
              storytelling, and alpha.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["00", "headlines you read after"],
              ["01", "signal you act on"],
              ["02", "culture you build with"],
            ].map(([n, t]) => (
              <Reveal key={n} delay={0.3 + Number(n) * 0.1}>
                <div className="glass rounded-xl p-5">
                  <div className="font-mono text-xs text-muted-foreground">/{n}</div>
                  <div className="mt-3 font-display text-base">{t}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------- BENTO FEED ------------- */

function Feed() {
  return (
    <section id="feed" className="relative mx-auto max-w-7xl px-6 py-32">
      <Reveal><Eyebrow>real-time · web3 wire</Eyebrow></Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          one feed for <span className="text-gradient-aurora">everything that matters.</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-6">
        <BentoCard className="md:col-span-4 md:row-span-2" tag="AI · LIVE" title="GPT-5 omni rollout shifts the agent stack">
          <ChartArea />
        </BentoCard>
        <BentoCard className="md:col-span-2" tag="BTC" title="$98,420" sub="+2.4% 24h" big />
        <BentoCard className="md:col-span-2" tag="ETH" title="$3,812" sub="+1.1% 24h" />

        <BentoCard className="md:col-span-2 md:row-span-2" tag="RWA" title="Tokenized treasuries cross $4.8B">
          <Bars />
        </BentoCard>
        <BentoCard className="md:col-span-2" tag="BASE" title="14.2B TVL" sub="+3.7% week" />
        <BentoCard className="md:col-span-2" tag="FARCASTER" title="612K DAU" sub="frames v2 live" />

        <BentoCard className="md:col-span-3" tag="DEFI" title="liquid restaking dominates flows">
          <Pulse />
        </BentoCard>
        <BentoCard className="md:col-span-3" tag="CULTURE" title="onchain music charts launch on zora" />
      </div>
    </section>
  );
}

function BentoCard({ className = "", tag, title, sub, big, children }:
  { className?: string; tag: string; title: string; sub?: string; big?: boolean; children?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl glass p-5 transition-shadow hover:glow-electric ${className}`}
    >
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{tag}</span>
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full" style={{ background: "var(--electric)" }} />
      </div>
      <div className={`mt-3 font-display ${big ? "text-4xl" : "text-xl"} leading-tight`}>{title}</div>
      {sub && <div className="mt-1 font-mono text-xs" style={{ color: "var(--positive)" }}>{sub}</div>}
      {children && <div className="absolute inset-x-5 bottom-5">{children}</div>}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
           style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--electric) 15%, transparent), transparent 60%)" }} />
    </motion.div>
  );
}

function ChartArea() {
  return (
    <svg viewBox="0 0 400 120" className="h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ca" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--electric)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 90 C 40 70, 80 100, 120 60 S 200 20, 240 50 S 320 90, 400 30 L 400 120 L 0 120 Z" fill="url(#ca)" />
      <path d="M0 90 C 40 70, 80 100, 120 60 S 200 20, 240 50 S 320 90, 400 30" fill="none" stroke="var(--electric)" strokeWidth="1.5" />
    </svg>
  );
}
function Bars() {
  const bars = [30, 50, 40, 70, 55, 85, 65, 95, 80];
  return (
    <div className="flex h-24 items-end gap-2">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${b}%`, background: "var(--electric)", opacity: 0.85 }} />
      ))}
    </div>
  );
}
function Pulse() {
  return (
    <svg viewBox="0 0 400 60" className="h-12 w-full" preserveAspectRatio="none">
      <path d="M0 30 L80 30 L100 10 L120 50 L140 30 L220 30 L240 5 L260 55 L280 30 L400 30" fill="none" stroke="var(--electric)" strokeWidth="1.5" />
    </svg>
  );
}

/* ------------- ECOSYSTEM ------------- */

const eco = [
  { tag: "AI", title: "agents that ship", body: "autonomous workflows, model wars, the new compute economy.", color: "var(--electric)" },
  { tag: "WEB3", title: "the new rails", body: "L2s, restaking, intents, and the infra you should own.", color: "var(--violet)" },
  { tag: "CULTURE", title: "the post-platform feed", body: "creators, taste, memes, and the social graph you actually own.", color: "var(--gold)" },
  { tag: "REAL ESTATE", title: "tokenized ground", body: "RWAs, fractional ownership, and yield onchain.", color: "var(--electric)" },
  { tag: "GAMING", title: "play-to-own", body: "fully onchain games, item economies, and player markets.", color: "var(--violet)" },
  { tag: "IDENTITY", title: "you, onchain", body: "ENS, attestations, reputation as the new login.", color: "var(--gold)" },
];

function Ecosystem() {
  const [active, setActive] = useState(1);
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-32">
      <Reveal><Eyebrow>the ecosystem</Eyebrow></Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          six frontiers. <span className="text-gradient-aurora">one timeline.</span>
        </h2>
      </Reveal>

      <div className="mt-16 flex flex-col gap-3 md:flex-row md:h-[460px]">
        {eco.map((e, i) => (
          <motion.button
            key={e.tag}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            animate={{ flex: active === i ? 4 : 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="group relative min-h-[180px] overflow-hidden rounded-2xl border border-white/10 text-left"
            style={{
              background: `color-mix(in oklab, ${e.color} 14%, var(--card))`,
            }}
          >
            <div className="absolute inset-0 opacity-30 grid-bg" />
            <div className="absolute inset-0 animate-scanline" style={{ background: `color-mix(in oklab, ${e.color} 10%, transparent)`, height: "30%" }} />
            <div className="relative flex h-full flex-col justify-between p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{e.tag}</div>
              <div>
                <div className="font-display text-2xl md:text-3xl" style={{ color: active === i ? "white" : undefined }}>{e.title}</div>
                <motion.p
                  animate={{ opacity: active === i ? 1 : 0, y: active === i ? 0 : 10 }}
                  transition={{ duration: 0.4 }}
                  className="mt-3 max-w-sm text-sm text-muted-foreground"
                >
                  {e.body}
                </motion.p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* ------------- COMMUNITY ------------- */

function Community() {
  return (
    <section id="community" className="relative overflow-hidden py-32">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div>
          <Reveal><Eyebrow>gated · founding members</Eyebrow></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              an inner circle, <span className="text-gradient-aurora">not an audience.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              private alpha rooms. token-gated drops. founder-only briefings.
              Carry your badge across the network — your reputation is the access.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex gap-3">
              <GlowButton as="a" href="#cta" variant="primary">claim your badge</GlowButton>
              <GlowButton as="a" href="#cta" variant="ghost">view membership</GlowButton>
            </div>
          </Reveal>
        </div>

        <div className="relative h-[460px]">
          {[
            { x: "10%", y: "5%", rot: -8, label: "FOUNDING · 0001", c: "var(--electric)" },
            { x: "45%", y: "25%", rot: 4, label: "ALPHA ROOM", c: "var(--violet)" },
            { x: "8%", y: "55%", rot: 6, label: "ONCHAIN PRESS", c: "var(--gold)" },
            { x: "50%", y: "60%", rot: -3, label: "GENESIS PASS", c: "var(--electric)" },
          ].map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, rotate: 0, scale: 1.04 }}
              className="absolute h-44 w-44 rounded-2xl glass-strong p-4"
              style={{ left: b.x, top: b.y, transform: `rotate(${b.rot}deg)`, boxShadow: `0 30px 80px -20px color-mix(in oklab, ${b.c} 40%, transparent)` }}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-6 rounded-md" style={{ background: b.c }} />
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground">VERIFIED</span>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground">/badge</div>
                  <div className="mt-1 font-display text-sm leading-tight">{b.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------- PRODUCTS ------------- */

const products = [
  { name: "Signal Pass", price: "$29/mo", desc: "the daily wire. premium feed, frames, alerts.", tag: "MEMBERSHIP" },
  { name: "Founders Pass", price: "$1,200", desc: "lifetime alpha. token-gated rooms. genesis badge.", tag: "LIFETIME", featured: true },
  { name: "Research Pack — RWAs", price: "$199", desc: "deep dive: tokenized treasuries, real estate, credit.", tag: "RESEARCH" },
  { name: "Builder Tools (AI)", price: "$49/mo", desc: "newsroom AI: drafts, summaries, onchain scans.", tag: "TOOLING" },
  { name: "IRL · NYC Salon", price: "$450", desc: "intimate dinner, founders + writers, quarterly.", tag: "EVENT" },
  { name: "Genesis Drop", price: "0.08 ETH", desc: "tokenized cover art. utility across the network.", tag: "DROP" },
];

function Products() {
  return (
    <section id="products" className="relative mx-auto max-w-7xl px-6 py-32">
      <Reveal><Eyebrow>products · fixed price</Eyebrow></Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          things you can <span className="text-gradient-aurora">actually own.</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.06}>
            <div className={`group relative h-full overflow-hidden rounded-2xl p-6 ${p.featured ? "glass-strong glow-violet" : "glass"} transition-transform duration-500 hover:-translate-y-1`}>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{p.tag}</span>
                <span>{i + 1}/{products.length}</span>
              </div>
              <div className="mt-6 font-display text-2xl">{p.name}</div>
              <div className="mt-2 font-mono text-sm" style={{ color: p.featured ? "var(--gold)" : "var(--electric)" }}>{p.price}</div>
              <p className="mt-4 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="text-muted-foreground">acquire</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------- SOCIAL PROOF ------------- */

const posts = [
  { who: "@dwr.eth", role: "farcaster", text: "this is the only feed I open before charts.", reacts: "1.2k" },
  { who: "@punk6529", role: "collector", text: "signal > noise. finally.", reacts: "812" },
  { who: "@balajis", role: "founder", text: "the newsroom for the network state.", reacts: "3.4k" },
  { who: "@cobie", role: "trader", text: "they were 6 hours ahead on the ondo move.", reacts: "942" },
  { who: "@linda.xyz", role: "builder", text: "every team I respect reads this.", reacts: "611" },
  { who: "@vitalik.eth", role: "—", text: "interesting framing on RWAs this week.", reacts: "5.1k" },
];

function Social() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal><Eyebrow>the network speaks</Eyebrow></Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
              <span className="text-gradient-aurora">42,108</span> builders<br />already on the wire.
            </h2>
            <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
              <Stat n="42,108" l="members" />
              <Stat n="+312" l="today" pulse />
              <Stat n="98%" l="renew rate" />
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="glass h-full rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full" style={{ background: "var(--electric)" }} />
                  <div>
                    <div className="text-sm font-medium">{p.who}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-base text-foreground/90">"{p.text}"</p>
                <div className="mt-6 flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>♡ {p.reacts}</span>
                  <span>↗ recast</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l, pulse }: { n: string; l: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {pulse && <span className="h-2 w-2 animate-pulse-dot rounded-full" style={{ background: "var(--positive)" }} />}
      <span className="font-display text-lg text-foreground">{n}</span>
      <span>{l}</span>
    </div>
  );
}

/* ------------- FINAL CTA ------------- */

function FinalCTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section id="cta" className="relative overflow-hidden py-32">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
           style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--electric) 30%, transparent), transparent 60%)", filter: "blur(40px)" }} />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal><Eyebrow>the call</Eyebrow></Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-8 font-display text-5xl font-semibold leading-[1.02] tracking-tighter md:text-7xl">
            the next internet <br />
            <span className="text-gradient-aurora">will not be built<br />by spectators.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground">
            join the wire. early access, founding badge, and the briefings the rest of the internet will read tomorrow.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <form
            onSubmit={(e) => { e.preventDefault(); setDone(true); }}
            className="mx-auto mt-10 flex max-w-lg flex-col items-stretch gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <input
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@network.eth"
                className="h-14 w-full rounded-full border border-white/15 bg-white/[0.04] px-6 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-white/40 focus:bg-white/[0.06]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition focus-within:opacity-100"
                   style={{ boxShadow: "var(--shadow-glow-electric)" }} />
            </div>
            <GlowButton variant="primary" type="submit">{done ? "you're on the wire" : "request access"}</GlowButton>
          </form>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            no spam. unsubscribe with one click. signal only.
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------- FOOTER ------------- */

function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 rounded-md" style={{ background: "var(--gradient-electric)" }}>
                <div className="absolute inset-[3px] rounded-[5px] bg-background" />
                <div className="absolute inset-[6px] rounded-sm" style={{ background: "var(--gradient-electric)" }} />
              </div>
              <span className="font-display text-base font-semibold tracking-tight">signal//chain</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              a newsroom for the post-platform internet. on the pulse of time.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            {[
              ["network", ["feed", "ecosystem", "research", "drops"]],
              ["members", ["founders", "alpha rooms", "events", "badges"]],
              ["company", ["manifesto", "press", "careers", "contact"]],
            ].map(([h, items]) => (
              <div key={h as string}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">/{h}</div>
                <ul className="mt-4 space-y-2 text-sm">
                  {(items as string[]).map((it) => (
                    <li key={it}><a href="#" className="transition hover:text-electric" style={{ color: "var(--foreground)" }}>{it}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row">
          <div>© 2026 signal//chain · built onchain</div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full" style={{ background: "var(--positive)" }} />
            all systems live
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------- ROOT ------------- */

function Landing() {
  // mouse-reactive radial highlight on bento cards
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const card = t.closest<HTMLElement>(".group");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <main className="relative isolate overflow-hidden">
      <Hero />
      <Why />
      <Feed />
      <Ecosystem />
      <Community />
      <Products />
      <Social />
      <FinalCTA />
      <Footer />
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "signal//chain — onchain news, culture & the next internet" },
      { name: "description", content: "Real signal. Real builders. Real culture. A newsroom for the post-platform internet — AI, crypto, RWAs, Farcaster, and the future of ownership." },
      { property: "og:title", content: "signal//chain — onchain news & culture" },
      { property: "og:description", content: "On the pulse of time. Where AI, crypto, RWAs and culture converge." },
    ],
  }),
  component: Landing,
});
