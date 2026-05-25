import { AlertTriangle, ArrowRight, Building2, CheckCircle2, HeartHandshake, Stamp, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const bankBullets = ["collateral first", "risk-averse", "slow yes", "deny by default"];
const communityBullets = ["shared stake", "aligned wins", "fast capital", "place first"];

const bankFailures = [
  { title: "collateral gap", detail: "Historic fabric ≠ balance-sheet asset — loan dies at appraisal." },
  { title: "slow yes", detail: "Months of underwriting while vacancy compounds." },
  { title: "deny by default", detail: "One risk flag retires the whole street." },
];

const communityAnswers = [
  { title: "crowd meets brick", detail: "Small tickets pool into renovation — gift or stake, your intent." },
  { title: "proof on-site", detail: "Fiber, desks, kitchen — revenue you can walk through." },
  { title: "place-first loop", detail: "Spend stays near spenders — café, stays, events reinvest locally." },
];

export const BankVsCommunity = () => {
  const ref = useReveal();
  const [mode, setMode] = useState<"bank" | "community">("bank");
  const bank = mode === "bank";

  return (
    <section id="bank-vs-community" ref={ref} className="relative overflow-hidden py-12 md:py-16">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-700",
          bank ? "bg-[radial-gradient(ellipse_at_50%_0%,hsl(215_40%_12%/0.28),transparent_55%)]" : "bg-[radial-gradient(ellipse_at_50%_0%,hsl(75_55%_42%/0.14),transparent_60%)]",
        )}
      />

      <div className="container relative z-10 px-4">
        <p className="reveal-glow mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">/ financing</p>
        <h2 className="reveal-glow font-bold uppercase tracking-tight mb-8 max-w-2xl" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
          same building. <span className="text-acid">different rulebook.</span>
        </h2>

        <div className="mb-8 flex flex-wrap items-center gap-3" role="tablist" aria-label="Financing model">
          <div className="inline-flex rounded-full p-0.5 bg-background/90 backdrop-blur-sm ring-1 ring-border/80">
            <button
              type="button"
              role="tab"
              aria-selected={bank}
              className={cn(
                "rounded-full px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300",
                bank ? "bg-[hsl(215_22%_24%)] text-foreground shadow-inner" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setMode("bank")}
            >
              bank
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!bank}
              className={cn(
                "rounded-full px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300",
                !bank
                  ? "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.45)] ring-1 ring-primary/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setMode("community")}
            >
              community
            </button>
          </div>
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border px-6 py-8 md:px-10 md:py-10 transition-all duration-700",
            bank
              ? "border-border/60 bg-gradient-to-br from-[hsl(215_25%_10%)] to-background shadow-[inset_0_1px_0_hsl(215_30%_25%/0.2)]"
              : "border-primary/35 bg-gradient-to-br from-[hsl(75_35%_14%/0.55)] via-[hsl(0_0%_10%)] to-[hsl(75_25%_12%/0.4)] shadow-[0_0_40px_hsl(var(--primary)/0.12),inset_0_1px_0_hsl(75_60%_50%/0.15)]",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              {bank ? (
                <Building2 className="h-7 w-7 text-[hsl(215_25%_55%)]" strokeWidth={1.2} />
              ) : (
                <HeartHandshake className="h-7 w-7 text-primary" strokeWidth={1.2} />
              )}
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">model</p>
                <p className="text-lg font-bold uppercase tracking-wide">{bank ? "bank system" : "community owned"}</p>
              </div>
            </div>

            {bank && (
              <div className="flex items-center gap-2 rounded border-2 border-destructive/60 px-2.5 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.15em] text-destructive motion-safe:animate-shake-subtle">
                <Stamp className="h-4 w-4" strokeWidth={2} aria-hidden />
                denied
              </div>
            )}
            {!bank && (
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-primary/20 ring-2 ring-background"
                  >
                    <Users className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {(bank ? bankBullets : communityBullets).map((b) => (
              <li
                key={b}
                className={cn(
                  "font-mono text-[13px] uppercase tracking-wide",
                  bank ? "text-foreground/90" : "text-foreground",
                )}
              >
                {bank ? "· " : "✓ "}
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-2 max-w-md">
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              <span>funding clarity</span>
              <span className={bank ? "text-muted-foreground" : "text-acid"}>{bank ? "~30%" : "68%"}</span>
            </div>
            <Progress
              value={bank ? 30 : 68}
              className={cn(
                "h-2 bg-secondary/80 transition-all [&>div]:duration-500",
                bank ? "[&>div]:bg-muted-foreground/60" : "[&>div]:bg-primary [&>div]:shadow-[0_0_14px_hsl(var(--primary)/0.7)]",
              )}
            />
          </div>

          {bank && (
            <div className="mt-10 grid gap-3 border-t border-border/50 pt-8 md:grid-cols-3">
              {bankFailures.map((f) => (
                <div key={f.title} className="rounded-xl bg-background/50 p-4 ring-1 ring-destructive/20">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive">
                    <XCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    {f.title}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
                </div>
              ))}
            </div>
          )}

          {!bank && (
            <div className="mt-10 space-y-6 border-t border-primary/25 pt-8">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                failures vs fixes
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-black/25 p-5 ring-1 ring-border/60 backdrop-blur-sm">
                  <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-amber-500/90" strokeWidth={1.5} aria-hidden />
                    where banks stall
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {bankFailures.map((f) => (
                      <li key={f.title} className="border-l-2 border-destructive/40 pl-3">
                        <span className="font-semibold text-foreground/90">{f.title}</span>
                        <span className="mt-0.5 block text-xs leading-snug">{f.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-primary/10 p-5 ring-1 ring-primary/35 backdrop-blur-sm">
                  <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    how community funds move
                  </p>
                  <ul className="space-y-3 text-sm text-foreground/95">
                    {communityAnswers.map((a) => (
                      <li key={a.title} className="border-l-2 border-primary/50 pl-3">
                        <span className="font-semibold text-primary">{a.title}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{a.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
