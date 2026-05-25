import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-architecture.jpg";
import particlesImg from "@/assets/particles.jpg";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { Particles, Streaks } from "@/components/Particles";
import { SearchMint } from "@/components/SearchMint";
import { LiveFeed } from "@/components/LiveFeed";
import { DomainCard3D } from "@/components/DomainCard3D";
import { MiniIndexGate } from "@/components/mini/MiniIndexGate";
import { pageMeta } from "@/lib/seo/meta";
import { absoluteUrl } from "@/lib/seo/site";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
    tld: typeof search.tld === "string" ? search.tld : undefined,
  }),
  head: () => {
    const { meta, links } = pageMeta({
      title: "Culture Layer — Own your name. Own your future.",
      description:
        "Mint your onchain identity on Base. .culture, .build, .home, .eco — not usernames. Digital sovereignty.",
      path: "/",
    });
    return {
      meta: [
        ...meta,
        {
          property: "og:title",
          content: "Culture Layer — Identity, finally owned.",
        },
        {
          property: "og:description",
          content: "The internet gave everyone a voice. Web3 gives everyone ownership.",
        },
      ],
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Culture Layer",
            url: absoluteUrl("/"),
            potentialAction: {
              "@type": "SearchAction",
              target: `${absoluteUrl("/")}?name={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        },
      ],
    };
  },
  component: IndexPage,
});

function IndexPage() {
  return (
    <MiniIndexGate>
      <Home />
    </MiniIndexGate>
  );
}

const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <motion.div {...FADE_UP} className="mb-6 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {n}
      </span>
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {children}
      </span>
    </motion.div>
  );
}

function Home() {
  return (
    <div id="top" className="relative min-h-screen bg-background text-foreground">
      <Nav />

      {/* HERO */}
      <section className="hero-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-32">
        <div className="grid-overlay absolute inset-0 opacity-60" />
        <div className="absolute inset-0 noise" />
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1280}
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[120vh] w-full object-cover opacity-25 mix-blend-screen"
          style={{ maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }}
        />
        <Particles count={50} />
        <Streaks />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Building Culture · Live on Base
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
            className="mt-8 font-display text-[clamp(3rem,9vw,8.5rem)] font-medium leading-[0.92] tracking-[-0.04em]"
          >
            <span className="text-gradient">Own your name.</span>
            <br />
            <span className="font-serif italic text-gradient-gold">
              Own your future.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mx-auto mt-8 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
          >
            The internet gave everyone a voice. Web3 gives everyone ownership.
            Claim your identity on the culture layer of the internet — not a username,
            a digital home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14 flex justify-center"
          >
            <SearchMint id="claim" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>12,847 names minted</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>2,104 founding members</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>onchain · soulbound</span>
          </motion.div>
        </div>
      </section>

      {/* LIVE FEED */}
      <section className="relative border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              live mints
            </span>
            <span>block #18,492,031</span>
          </div>
        </div>
        <LiveFeed />
      </section>

      {/* WHY IDENTITY MATTERS */}
      <section id="why" className="relative px-4 py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel n="01 / manifesto">why identity matters</SectionLabel>

          <motion.h2
            {...FADE_UP}
            className="max-w-4xl font-display text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1] tracking-[-0.03em] text-gradient"
          >
            Old systems gave identity through banks, governments, and platforms.
            <span className="font-serif italic text-gradient-gold"> This new system gives it back.</span>
          </motion.h2>

          <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2">
            {[
              {
                k: "Rented",
                title: "The old internet",
                items: [
                  "Username on a platform",
                  "Profile owned by company",
                  "Banned without recourse",
                  "Identity = product to sell",
                  "Reputation locked behind silos",
                ],
                muted: true,
              },
              {
                k: "Owned",
                title: "The culture layer",
                items: [
                  "Name owned in your wallet",
                  "Profile portable across every app",
                  "No central authority to remove you",
                  "You are the asset",
                  "Reputation follows you forever",
                ],
                muted: false,
              },
            ].map((col) => (
              <div
                key={col.k}
                className={`relative p-10 ${col.muted ? "bg-background" : "bg-surface-elevated"}`}
              >
                <div className="flex items-baseline justify-between">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
                      col.muted ? "text-muted-foreground" : "text-gold"
                    }`}
                  >
                    {col.k}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {col.muted ? "→ extractive" : "→ generative"}
                  </span>
                </div>
                <h3
                  className={`mt-4 font-display text-3xl font-medium tracking-tight ${
                    col.muted ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {col.title}
                </h3>
                <ul className="mt-10 space-y-4">
                  {col.items.map((it) => (
                    <li
                      key={it}
                      className={`flex items-start gap-3 text-base ${
                        col.muted ? "text-muted-foreground line-through decoration-1" : "text-foreground"
                      }`}
                    >
                      <span
                        className={`mt-2 h-1 w-1 flex-none rounded-full ${
                          col.muted ? "bg-muted-foreground" : "bg-primary"
                        }`}
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IDENTITY PREVIEW CARDS */}
      <section id="identity" className="relative px-4 py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${particlesImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <SectionLabel n="02 / identity">a name becomes everything</SectionLabel>

          <motion.div {...FADE_UP} className="max-w-3xl">
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-gradient">
              Wallet. Profile. Reputation. <br />
              <span className="font-serif italic text-gradient-gold">Home.</span>
            </h2>
            <p className="mt-6 max-w-xl text-muted-foreground">
              One name. Every surface. A .culture name is your wallet identity,
              your social handle, your community key, your reputation layer —
              fused into a single onchain object you own forever.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DomainCard3D
              name="laszlo"
              tld="culture"
              variant="primary"
              badges={["Founding", "Verified", "Farcaster", "Patron tier"]}
            />
            <DomainCard3D
              name="vienna"
              tld="build"
              variant="gold"
              badges={["Architect", "Real estate", "DAO ops"]}
            />
            <DomainCard3D
              name="tribeca"
              tld="home"
              variant="primary"
              badges={["Resident", "Soulbound", "Salon access"]}
            />
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="relative px-4 py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel n="03 / capabilities">built into every name</SectionLabel>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {[
              ["Instant search", "AI-powered name discovery with semantic suggestions"],
              ["One-click Base", "Onboard in seconds. No seed phrase, no extension."],
              ["Soulbound reputation", "Your XP, badges, and history travel with the name"],
              ["Token-gated rooms", "Salons, communities, IRL events keyed to your identity"],
              ["Farcaster native", "Social graph and casts wired in from day one"],
              ["Dynamic profile cards", "Screenshot-worthy by default. Shareable everywhere."],
            ].map(([title, desc], i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative bg-background p-8 transition hover:bg-surface"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
                <h3 className="mt-8 font-display text-xl font-medium tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                <div className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM MAP */}
      <section id="ecosystem" className="relative overflow-hidden px-4 py-32">
        <div className="grid-overlay absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <SectionLabel n="04 / ecosystem">one name. infinite surfaces.</SectionLabel>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <motion.div {...FADE_UP}>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-gradient">
                The map of a <span className="font-serif italic text-gradient-gold">new digital city.</span>
              </h2>
              <p className="mt-6 text-muted-foreground">
                Every TLD opens a different chamber of culture. Choose a citizenship.
                Belong to many.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { tld: ".culture", desc: "creators, salons, taste" },
                { tld: ".build", desc: "architects, makers, studios" },
                { tld: ".home", desc: "residency, place, IRL" },
                { tld: ".eco", desc: "climate, land, regen" },
                { tld: ".capital", desc: "capital allocators, DAOs" },
                { tld: ".city", desc: "civic, neighborhoods, scenes" },
              ].map((t, i) => (
                <motion.div
                  key={t.tld}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="glass group relative cursor-pointer rounded-2xl p-5 transition hover:bg-surface-elevated"
                >
                  <div
                    className={`font-display text-2xl font-medium tracking-tight ${
                      i % 2 === 0 ? "text-primary" : "text-gold"
                    }`}
                  >
                    {t.tld}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDING MEMBERS */}
      <section id="founders" className="relative px-4 py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel n="05 / founders">early supporter benefits</SectionLabel>

          <div className="glass-strong relative overflow-hidden rounded-3xl p-10 sm:p-16">
            <div
              className="pointer-events-none absolute -inset-px opacity-60"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div className="relative grid gap-12 lg:grid-cols-2">
              <div>
                <motion.h2
                  {...FADE_UP}
                  className="font-display text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em]"
                >
                  Be a <span className="text-gradient-gold font-serif italic">founder</span>,<br />
                  not a follower.
                </motion.h2>
                <p className="mt-6 max-w-md text-muted-foreground">
                  The first 5,000 members shape the protocol. Lifetime status,
                  permanent reputation boost, and a seat at every governance
                  table that comes after.
                </p>
                <div className="mt-10 flex items-center gap-6">
                  <div>
                    <div className="font-display text-4xl font-medium text-gold">
                      2,104
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      of 5,000 claimed
                    </div>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <div className="font-display text-4xl font-medium">42%</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      filled · 4 days
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["01", "Founding badge", "Permanent visual mark on every profile"],
                  ["02", "+2x XP forever", "Reputation compounds faster"],
                  ["03", "Premium TLDs", "First access to .capital and .city"],
                  ["04", "Governance seat", "Vote on every protocol decision"],
                ].map(([n, t, d]) => (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex items-start gap-5 rounded-2xl border border-border bg-surface/60 p-5"
                  >
                    <span className="font-mono text-xs text-gold">{n}</span>
                    <div>
                      <div className="font-display font-medium">{t}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{d}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CINEMATIC CTA */}
      <section className="relative overflow-hidden px-4 py-40">
        <Particles count={30} />
        <div className="hero-bg absolute inset-0" />
        <div className="grid-overlay absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            {...FADE_UP}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold"
          >
            06 / the threshold
          </motion.div>

          <motion.h2
            {...FADE_UP}
            transition={{ duration: 1, delay: 0.1 }}
            className="mt-8 font-display text-[clamp(3rem,10vw,9rem)] font-medium leading-[0.9] tracking-[-0.045em]"
          >
            <span className="text-gradient">Not usernames.</span>
            <br />
            <span className="font-serif italic text-gradient-gold">
              Digital sovereignty.
            </span>
          </motion.h2>

          <motion.p
            {...FADE_UP}
            transition={{ duration: 1, delay: 0.25 }}
            className="mx-auto mt-10 max-w-xl text-muted-foreground"
          >
            Building culture, one name at a time. Step into the layer that owns
            itself.
          </motion.p>

          <motion.a
            {...FADE_UP}
            transition={{ duration: 1, delay: 0.4 }}
            href="#claim"
            className="group relative mt-14 inline-flex items-center gap-3 overflow-hidden rounded-full bg-foreground px-8 py-5 font-display text-base font-semibold text-background transition hover:scale-[1.03]"
          >
            <span className="relative z-10">Claim your name</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </motion.a>

          <motion.div
            {...FADE_UP}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
          >
            onchain · base · forever
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
