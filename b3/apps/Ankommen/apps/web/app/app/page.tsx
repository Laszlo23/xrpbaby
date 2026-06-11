import Link from "next/link";
import {
  Home, Wallet, FileText, HeartPulse, Briefcase, GraduationCap,
  Languages, MapPin, Send, Sparkles, ArrowRight, Bell, Clock,
} from "lucide-react";

const suggestions = [
  "I need a place to live.",
  "What financial support can I get?",
  "I received this government letter.",
  "How do I register my address?",
  "Where can I find German classes?",
];

const tiles = [
  { href: "/app/housing", icon: Home, label: "Housing", desc: "Find apartments & rooms", bg: "bg-primary-soft", color: "text-primary" },
  { href: "/app/benefits", icon: Wallet, label: "Money & Benefits", desc: "AMS, Familienbeihilfe…", bg: "bg-success-soft", color: "text-success" },
  { href: "/app/documents", icon: FileText, label: "Documents", desc: "Understand letters", bg: "bg-accent-soft", color: "text-accent" },
  { href: "/app/healthcare", icon: HeartPulse, label: "Healthcare", desc: "Doctors & e-card", bg: "bg-accent-soft", color: "text-accent" },
  { href: "/app/jobs", icon: Briefcase, label: "Jobs", desc: "AMS & openings", bg: "bg-primary-soft", color: "text-primary" },
  { href: "/app/schools", icon: GraduationCap, label: "Schools", desc: "Kindergarten & schools", bg: "bg-warning-soft", color: "text-warning-foreground" },
  { href: "/app/translate", icon: Languages, label: "Translation", desc: "14 languages", bg: "bg-primary-soft", color: "text-primary" },
  { href: "/app/services", icon: MapPin, label: "Nearby Services", desc: "Map of help centers", bg: "bg-success-soft", color: "text-success" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold md:text-4xl">Hello 👋</h1>
        <p className="mt-2 text-muted-foreground">What would you like help with today?</p>
      </header>

      <div className="rounded-3xl border bg-card p-2 shadow-soft">
        <div className="flex items-end gap-2 rounded-2xl bg-secondary/50 p-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <textarea rows={2} placeholder="Ask anything about living in Austria…" className="w-full resize-none border-0 bg-transparent text-base outline-none placeholder:text-muted-foreground" readOnly />
          <Link href="/app/assistant" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Send className="h-4 w-4" /> Ask
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 p-3 pt-2">
          {suggestions.map((s) => (
            <Link key={s} href="/app/assistant" className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">{s}</Link>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Jump back in</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <Link key={t.href} href={t.href} className="group rounded-3xl border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${t.bg}`}>
                <t.icon className={`h-5 w-5 ${t.color}`} />
              </div>
              <div className="mt-4 font-semibold">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-primary" /> Action items</div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-warning-foreground" /> Respond to AMS letter — 14 days left</li>
            <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-muted-foreground" /> Complete Meldezettel registration</li>
            <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-muted-foreground" /> Book German course at VHS</li>
          </ul>
        </div>
        <Link href="/app/benefits" className="rounded-3xl border bg-card p-6 shadow-soft transition hover:shadow-glow" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="text-sm text-muted-foreground">Possible support</div>
          <div className="mt-1 text-3xl font-extrabold gradient-text">Check benefits</div>
          <p className="mt-2 text-sm text-muted-foreground">Run the wizard to see what you may qualify for.</p>
        </Link>
      </section>
    </div>
  );
}
