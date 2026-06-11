import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home, Wallet, FileText, HeartPulse, Briefcase, GraduationCap,
  Languages, MapPin, Send, Sparkles, ArrowRight, Bell, Clock,
} from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

const suggestions = [
  "I need a place to live.",
  "What financial support can I get?",
  "I received this government letter.",
  "How do I register my address?",
  "Where can I find German classes?",
];

const tiles = [
  { to: "/app/housing", icon: Home, label: "Housing", desc: "Find apartments & rooms", bg: "bg-primary-soft", color: "text-primary" },
  { to: "/app/benefits", icon: Wallet, label: "Money & Benefits", desc: "AMS, Familienbeihilfe…", bg: "bg-success-soft", color: "text-success" },
  { to: "/app/documents", icon: FileText, label: "Documents", desc: "Understand letters", bg: "bg-accent-soft", color: "text-accent" },
  { to: "/app/healthcare", icon: HeartPulse, label: "Healthcare", desc: "Doctors & e-card", bg: "bg-accent-soft", color: "text-accent" },
  { to: "/app/jobs", icon: Briefcase, label: "Jobs", desc: "AMS & openings", bg: "bg-primary-soft", color: "text-primary" },
  { to: "/app/schools", icon: GraduationCap, label: "Schools", desc: "Kindergarten & schools", bg: "bg-warning-soft", color: "text-warning-foreground" },
  { to: "/app/translate", icon: Languages, label: "Translation", desc: "11 languages", bg: "bg-primary-soft", color: "text-primary" },
  { to: "/app/services", icon: MapPin, label: "Nearby Services", desc: "Map of help centers", bg: "bg-success-soft", color: "text-success" },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold md:text-4xl">Hello, Laszlo 👋</h1>
        <p className="mt-2 text-muted-foreground">What would you like help with today?</p>
      </header>

      {/* AI Input */}
      <div className="rounded-3xl border bg-card p-2 shadow-soft">
        <div className="flex items-end gap-2 rounded-2xl bg-secondary/50 p-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <textarea
            rows={2}
            placeholder="Ask anything about living in Austria…"
            className="w-full resize-none border-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <Link to="/app/assistant" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Send className="h-4 w-4" /> Ask
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 p-3 pt-2">
          {suggestions.map((s) => (
            <Link key={s} to="/app/assistant" className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Tiles */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Jump back in</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <Link key={t.to} to={t.to} className="group rounded-3xl border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
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

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Your action items</h3>
            <span className="text-xs text-muted-foreground">3 pending</span>
          </div>
          <ul className="space-y-3">
            {[
              { title: "Reply to AMS letter", due: "Due in 4 days", tag: "Urgent", color: "bg-accent-soft text-accent" },
              { title: "Submit Meldezettel at MA35", due: "Due in 12 days", tag: "Action", color: "bg-warning-soft text-warning-foreground" },
              { title: "Book German course (A1)", due: "Recommended", tag: "Tip", color: "bg-success-soft text-success" },
            ].map((a) => (
              <li key={a.title} className="flex items-center justify-between rounded-2xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary"><Bell className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {a.due}</div>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${a.color}`}>{a.tag}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-soft" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="text-xs font-semibold text-primary">Estimated entitlements</div>
          <div className="mt-2 text-4xl font-extrabold gradient-text">€1,840 / mo</div>
          <p className="mt-1 text-sm text-muted-foreground">Based on your profile, you may qualify for 4 benefits.</p>
          <Link to="/app/benefits" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            See breakdown <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
