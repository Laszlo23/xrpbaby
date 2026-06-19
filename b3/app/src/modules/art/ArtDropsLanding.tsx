import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArtNav } from "@/modules/art/components/ArtNav";
import { Particles } from "@/modules/art/components/Particles";
import { ArtFooter } from "@/modules/art/components/ArtFooter";
import { EditionManifesto } from "@/modules/art/components/artwork/EditionManifesto";
import { ArtworkChapter } from "@/modules/art/components/artwork/ArtworkChapter";
import { StoryInterlude } from "@/modules/art/components/artwork/StoryInterlude";
import { ArtworkOnchainStats } from "@/modules/art/components/web3/ArtworkOnchainStats";
import { CommunityActivity } from "@/modules/art/components/web3/CommunityActivity";
import { ClientOnly } from "@/modules/art/components/web3/ClientOnly";
import { MintTicketButton } from "@/modules/art/components/web3/MintTicketButton";
import { artworks, interludes } from "@/modules/art/data/artworks";
import type { ArtworkData } from "@/modules/art/data/artworks";
import { formatEur } from "@/modules/art/lib/format";

export function ArtDropsLanding() {
  return (
    <div className="relative min-h-screen bg-background text-foreground grain">
      <ArtNav />
      <Hero />
      <Story />
      <EditionManifesto />
      <ArtworksTeasers />
      <StoryInterlude kicker={interludes[0].kicker} body={interludes[0].body} />
      <ArtworkChapter art={artworks[0]} />
      <StoryInterlude kicker={interludes[1].kicker} body={interludes[1].body} align="left" />
      <ArtworkChapter art={artworks[1]} reverse />
      <StoryInterlude kicker={interludes[2].kicker} body={interludes[2].body} />
      <HowItWorks />
      <Why />
      <Community />
      <FinalCTA />
      <ArtFooter />
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroImage = artworks[0].image;

  return (
    <section ref={ref} className="relative h-[100svh] overflow-hidden">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <img
          src={heroImage}
          alt={artworks[0].title}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        <div className="absolute inset-0 aurora-bg opacity-70" />
      </motion.div>
      <Particles count={60} />

      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-16 max-w-7xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8"
        >
          ⎯⎯ Edition 01 · Onchain art raffles · Win the physical painting
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="font-display text-[clamp(3rem,10vw,9rem)] leading-[0.92] text-balance"
        >
          Culture belongs to <em className="text-gold-gradient">everyone.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          Museum-scale paintings, opened as transparent onchain raffles. Buy a ticket for your
          chance to win the physical artwork — when 1,000 tickets sell, one holder wins the canvas.
          Everyone else keeps proof they entered.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#artworks"
            className="px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em] hover:scale-[1.02] transition-transform glow-gold"
          >
            Explore the works
          </a>
          <a
            href="#participate-horizon"
            className="px-7 py-3.5 rounded-full glass text-sm uppercase tracking-[0.18em] hover:bg-foreground hover:text-background transition-all"
          >
            Enter the raffle
          </a>
          <a
            href="#how"
            className="px-3 py-3.5 text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
          >
            How it works →
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
          Scroll
        </motion.div>
      </motion.div>
    </section>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

function Story() {
  const items = [
    {
      k: "01",
      t: "Transparency",
      d: "Every raffle entry, every sale, every winner — onchain. No hidden draw. You see who entered and who won the painting.",
    },
    {
      k: "02",
      t: "Participation",
      d: "€45 or €70 buys a raffle ticket — not the whole painting. One ticket can win a work worth tens of thousands.",
    },
    {
      k: "03",
      t: "Physical art",
      d: "This is a raffle for a real canvas. The painting stays in vault until the last ticket sells — then one winner receives the physical artwork.",
    },
    {
      k: "04",
      t: "Culture, not speculation",
      d: "We fund art, not derivatives. Hold it in your home — not in a spreadsheet. No casino. No hype.",
    },
    {
      k: "05",
      t: "The story remains",
      d: "Most tickets do not win — that is the raffle. Every entry is still recorded onchain as proof you took part in Edition 01.",
    },
  ];
  return (
    <section id="story" className="relative py-32 md:py-48 px-6 md:px-16 max-w-7xl mx-auto">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8">
          ⎯⎯ The Story
        </p>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02] max-w-4xl text-balance">
          For decades, the finest art lived behind{" "}
          <em className="text-gold-gradient">closed doors.</em>
        </h2>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          A private viewing. A whispered price. A signature in a ledger no one else could read.
          Building Culture is the opposite of that room — a public, verifiable way to stand beside a
          work you believe in.
        </p>
      </Reveal>

      <div className="mt-24 grid md:grid-cols-2 gap-px bg-border/40 rounded-2xl overflow-hidden">
        {items.map((it, i) => (
          <Reveal key={it.k} delay={i * 0.08}>
            <div className="bg-background p-10 h-full flex flex-col gap-4">
              <span className="text-xs tracking-[0.3em] text-primary">{it.k}</span>
              <h3 className="font-display text-3xl">{it.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ArtworksTeasers() {
  return (
    <section
      id="artworks"
      className="relative py-32 md:py-48 px-6 md:px-16 max-w-7xl mx-auto scroll-mt-24"
    >
      <Reveal>
        <div className="flex items-end justify-between flex-wrap gap-6 mb-20">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
              ⎯⎯ Edition 01
            </p>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02]">
              The Works.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Two raffles for two physical paintings. Read each work — then enter for your chance to
            win the canvas.
          </p>
        </div>
      </Reveal>
      <div className="space-y-24 md:space-y-32">
        {artworks.map((art, i) => (
          <ArtworkTeaser key={art.id} art={art} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function ArtworkTeaser({ art, reverse }: { art: ArtworkData; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const pct = art.supply > 0 ? Math.round((art.sold / art.supply) * 100) : 0;

  return (
    <Reveal>
      <div
        ref={ref}
        className={`grid md:grid-cols-12 gap-10 md:gap-16 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
      >
        <div className="md:col-span-7 relative group">
          <a
            href={`#work-${art.id}`}
            className="block relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-sm exhibition-frame"
          >
            <motion.img
              style={{ y }}
              src={art.image}
              alt={art.title}
              className="absolute inset-0 h-[120%] w-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
            <div className="absolute top-5 left-5 right-5 flex justify-between text-[10px] uppercase tracking-[0.3em] text-foreground/70">
              <span>
                Work {art.edition} · {art.year}
              </span>
              <span>Verified ⌁ Onchain</span>
            </div>
          </a>
        </div>

        <div className="md:col-span-5 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
              {art.artist.name}
            </p>
            <h3 className="font-display text-4xl md:text-5xl leading-[1.05] italic">{art.title}</h3>
            <p className="mt-4 font-display text-lg italic text-muted-foreground">{art.tagline}</p>
          </div>

          <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm border-y hairline py-6">
            <Spec label="Medium" value={art.medium} />
            <Spec label="Dimensions" value={art.dimensions} />
            <Spec label="Est. value" value={formatEur(art.valueEur)} />
            <Spec label="Raffle" value={`1,000 × ${formatEur(art.priceEur)}`} />
          </dl>

          <ClientOnly
            fallback={
              <div className="space-y-4">
                <div className="flex justify-between text-xs uppercase tracking-[0.2em]">
                  <span className="text-muted-foreground">
                    {art.sold} of {art.supply.toLocaleString("de-DE")} tickets
                  </span>
                  <span className="text-primary">{pct}%</span>
                </div>
                <div className="h-[3px] bg-border/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <a
                  href={`#participate-${art.id}`}
                  className="inline-block px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] glow-gold"
                >
                  Enter raffle · {formatEur(art.priceEur)}
                </a>
              </div>
            }
          >
            <ArtworkOnchainStats
              slug={art.id}
              fallbackPriceEur={art.priceEur}
              fallbackValueEur={art.valueEur}
              fallbackSold={art.sold}
              fallbackSupply={art.supply}
              marketingSupply={art.supply}
            />
          </ClientOnly>

          <div className="flex flex-wrap gap-3">
            <a
              href={`#work-${art.id}`}
              className="px-7 py-3.5 rounded-full glass text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all"
            >
              Enter the work
            </a>
            <ClientOnly
              fallback={
                <a
                  href={`#participate-${art.id}`}
                  className="px-7 py-3.5 rounded-full border hairline text-xs uppercase tracking-[0.2em] hover:border-primary/50 transition-all"
                >
                  Enter raffle
                </a>
              }
            >
              <MintTicketButton
                slug={art.id}
                fallbackPriceEur={art.priceEur}
                className="px-7 py-3.5 rounded-full border hairline text-xs uppercase tracking-[0.2em] hover:border-primary/50 transition-all bg-transparent text-foreground shadow-none glow-gold-none"
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="font-display text-lg md:text-xl">{value}</dd>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "I",
      t: "Buy a raffle ticket onchain",
      d: "Connect your wallet and mint your entry on Base. Each ticket is one chance to win the physical painting — recorded publicly.",
    },
    {
      n: "II",
      t: "Watch the raffle fill",
      d: "Every ticket sale is visible onchain. The progress bar shows how close we are to the draw — and to naming a winner.",
    },
    {
      n: "III",
      t: "One ticket wins the artwork",
      d: "When ticket #1,000 sells, verifiable randomness picks the winner. The physical painting leaves the vault for their wall — insured, documented, real.",
    },
  ];
  return (
    <section
      id="how"
      className="relative py-32 md:py-48 px-6 md:px-16 border-t hairline scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8 text-center">
            ⎯⎯ How the raffle works
          </p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02] text-center max-w-4xl mx-auto text-balance">
            Enter once. <em className="text-gold-gradient">One winner</em> takes the canvas.
          </h2>
        </Reveal>

        <div className="mt-24 grid md:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="bg-background p-10 md:p-12 h-full flex flex-col gap-6 relative group">
                <div className="font-display text-7xl text-gold-gradient italic">{s.n}</div>
                <h3 className="font-display text-3xl leading-tight">{s.t}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="mt-12 flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {[
              "Verifiable winner draw",
              "Open contract source",
              "Base L2",
              "Physical artwork prize",
              "No KYC to enter",
            ].map((b) => (
              <span key={b} className="glass px-4 py-2 rounded-full">
                ⌁ {b}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="relative py-32 md:py-48 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-16 items-center">
        <Reveal>
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6">
              ⎯⎯ Why Building Culture
            </p>
            <h2 className="font-display text-5xl md:text-6xl leading-[1.02]">
              We're <em className="text-gold-gradient">not</em> selling JPEGs.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="md:col-span-3 space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Building Culture is a bridge — between the hand of an artist working pastel or oil
              onto linen, and a community that funds, witnesses, and ultimately holds the work.
            </p>
            <p>
              Angeli and Scheibl are paid through each edition. Participants enter a raffle for the
              physical work — not a speculative token. One winner receives the painting. The chain
              shows every entry and the final draw.
            </p>
            <p className="font-display text-2xl text-foreground italic">
              "Culture should be participatory, not extractive."
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section
      id="community"
      className="relative py-32 md:py-48 px-6 md:px-16 max-w-7xl mx-auto scroll-mt-24"
    >
      <Reveal>
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8">
          ⎯⎯ Community
        </p>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] max-w-3xl text-balance">
          Collectors, artists, witnesses —{" "}
          <em className="text-gold-gradient">one wall of culture.</em>
        </h2>
      </Reveal>

      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Reveal>
          <div className="glass rounded-2xl p-7 h-full">
            <ClientOnly>
              <CommunityActivity />
            </ClientOnly>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass rounded-2xl p-7 h-full flex flex-col">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-5">
              Community wall
            </p>
            <div className="space-y-5 flex-1">
              {[
                {
                  n: "lia.eth",
                  q: "First time I've stood inside a painting I helped bring into the world.",
                },
                { n: "0xC0…2af", q: "Watching the edition fill in real time — strangely moving." },
                {
                  n: "moss.eth",
                  q: "Two raffle tickets — double the chance someone in my family wins the canvas.",
                },
              ].map((m, i) => (
                <div key={i}>
                  <p className="font-display text-lg italic leading-snug">&ldquo;{m.q}&rdquo;</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">
                    — {m.n}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <a
            href="https://buildingcultureid.space/demo/atlas/creators?ref=art-drops"
            className="glass rounded-2xl p-7 h-full flex flex-col transition-colors hover:border-gold/40 border border-transparent"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-5">
              Culture Atlas
            </p>
            <h3 className="font-display text-xl leading-snug">
              Musicians &amp; storytellers — archive living culture
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
              Contribute music, voice, and personal stories to community-owned cultural editions
              across the world.
            </p>
            <span className="mt-5 text-xs uppercase tracking-[0.2em] text-gold-gradient">
              Apply as a creator →
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="glass rounded-2xl p-7 h-full">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-5">
              Early participation
            </p>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent border hairline flex items-center justify-center font-display text-2xl text-gold-gradient"
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
              Every raffle entry is recorded onchain — proof you entered Edition 01, win or not.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const stormImage = artworks[1].image;

  return (
    <section
      ref={ref}
      className="relative h-[90svh] overflow-hidden flex items-center justify-center"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={stormImage}
          alt={artworks[1].title}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
      </motion.div>
      <Particles count={40} />
      <Reveal>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-10">
            ⎯⎯ The Invitation
          </p>
          <h2 className="font-display text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] text-balance">
            The last ticket triggers the <em className="text-gold-gradient">draw.</em>
          </h2>
          <p className="mt-10 text-lg text-muted-foreground max-w-xl mx-auto">
            {formatEur(45)} or {formatEur(70)} buys one raffle entry. One ticket will win a
            museum-scale painting worth tens of thousands — the rest keep their onchain proof of
            participation.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a
              href="#participate-horizon"
              className="px-9 py-4 rounded-full bg-primary text-primary-foreground text-sm uppercase tracking-[0.2em] hover:scale-[1.02] transition glow-gold"
            >
              Enter the raffle
            </a>
            <a
              href="#artworks"
              className="px-9 py-4 rounded-full glass text-sm uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all"
            >
              View the works
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
