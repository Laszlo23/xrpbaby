import Link from "next/link";
import {
  Home, Wallet, FileText, Briefcase, HeartPulse, GraduationCap,
  Languages, Mail, Scale, MapPin, Globe, Bot, MessageCircle, Sparkles,
  ArrowRight, ShieldCheck, Flag,
} from "lucide-react";

const services = [
  { icon: Home, label: "Housing", color: "text-primary", bg: "bg-primary-soft" },
  { icon: Wallet, label: "Financial Support", color: "text-success", bg: "bg-success-soft" },
  { icon: FileText, label: "Residence & Visa", color: "text-primary", bg: "bg-primary-soft" },
  { icon: Briefcase, label: "Jobs & AMS", color: "text-accent", bg: "bg-accent-soft" },
  { icon: HeartPulse, label: "Healthcare", color: "text-accent", bg: "bg-accent-soft" },
  { icon: GraduationCap, label: "Schools & Kindergarten", color: "text-warning-foreground", bg: "bg-warning-soft" },
  { icon: Languages, label: "German Courses", color: "text-primary", bg: "bg-primary-soft" },
  { icon: Mail, label: "Understand Letters", color: "text-accent", bg: "bg-accent-soft" },
  { icon: Scale, label: "Your Rights", color: "text-success", bg: "bg-success-soft" },
  { icon: MapPin, label: "Nearby Help Centers", color: "text-primary", bg: "bg-primary-soft" },
  { icon: Globe, label: "Translation", color: "text-warning-foreground", bg: "bg-warning-soft" },
  { icon: Bot, label: "AI Assistant", color: "text-accent", bg: "bg-accent-soft" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 glass-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Flag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">
              Ankommen <span className="gradient-text">AI</span>
            </span>
          </Link>
          <nav className="hidden gap-8 md:flex">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground">Services</a>
            <a href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#trust" className="text-sm font-medium text-muted-foreground hover:text-foreground">Trust & Safety</a>
          </nav>
          <Link href="/app" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
            Open App <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Made for newcomers in Austria 🇦🇹
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Welcome to Austria.
              <span className="block gradient-text">Your AI guide for everything you need.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Find housing, financial support, jobs, healthcare, schools, government offices, and understand official letters — all in your own language.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/assistant" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90">
                <MessageCircle className="h-5 w-5" /> Start Chat
              </Link>
              <Link href="/app/onboarding" className="inline-flex items-center gap-2 rounded-full bg-success px-6 py-3.5 text-base font-semibold text-success-foreground shadow-soft hover:opacity-90">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Free & private</div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> 14 languages</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
            <div className="relative flex aspect-[3/2] items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-glow">
              <span className="text-6xl">🇦🇹</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-4xl font-bold md:text-5xl">How it works</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Three simple steps. No paperwork. No confusion.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", title: "Ask", icon: MessageCircle, body: '"I just arrived." "I need a place to live." "I got a letter from AMS."', accent: "bg-primary-soft text-primary" },
            { n: "2", title: "AI Understands", icon: Bot, body: "Our AI analyzes your situation, language, and entitlements.", accent: "bg-accent-soft text-accent" },
            { n: "3", title: "Get Help", icon: Sparkles, body: "Receive personalized guidance, locations, checklists, and next steps.", accent: "bg-success-soft text-success" },
          ].map((s) => (
            <div key={s.n} className="group relative rounded-3xl border bg-card p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${s.accent}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div className="mt-6 text-sm font-semibold text-muted-foreground">Step {s.n}</div>
              <h3 className="mt-1 text-2xl font-bold">{s.title}</h3>
              <p className="mt-3 text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-bold md:text-5xl">Everything you need, in one place</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {services.map((s) => (
              <Link key={s.label} href="/app" className="group rounded-3xl border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div className="mt-5 text-lg font-semibold">{s.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl border bg-card p-10 shadow-soft md:p-16" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <h2 className="text-3xl font-bold md:text-4xl">A friendly Austrian social worker, lawyer & translator — in one app.</h2>
          <p className="mt-4 text-muted-foreground">We built Ankommen AI to reduce fear, confusion, and bureaucracy for people starting a new life in Austria.</p>
          <Link href="/app/onboarding" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft">
            Try as guest <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
