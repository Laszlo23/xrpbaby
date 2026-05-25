import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { profileFor } from "@/lib/identity";

export function DomainCard3D({
  name,
  tld,
  badges,
  variant = "primary",
}: {
  name: string;
  tld: string;
  badges: string[];
  variant?: "primary" | "gold";
}) {
  const full = `${name}.${tld}`;
  const profile = profileFor(full);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ y: -8, rotateY: 4, rotateX: 4 }}
      style={{ transformStyle: "preserve-3d", perspective: 1200 }}
      className="group relative"
    >
      <div
        className={`absolute -inset-px rounded-2xl opacity-50 blur-2xl transition group-hover:opacity-90 ${
          variant === "gold" ? "bg-gold/30" : "bg-primary/30"
        }`}
      />
      <Link
        to="/id/$name"
        params={{ name: full }}
        className="glass-strong relative block overflow-hidden rounded-2xl p-6"
      >
        <div className="grid-overlay absolute inset-0 opacity-50" />

        <div className="relative flex items-start justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            ERC-721 · transferable
          </span>
          <span
            className={`h-2 w-2 animate-pulse rounded-full ${
              variant === "gold" ? "bg-gold" : "bg-primary"
            }`}
          />
        </div>

        <div className="relative mt-10">
          <h3 className="font-display text-3xl font-medium leading-none tracking-tight sm:text-4xl">
            <span className="text-foreground">{name}</span>
            <span className={variant === "gold" ? "text-gradient-gold" : "text-primary"}>
              .{tld}
            </span>
          </h3>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            {profile.shortAddress}
          </p>
        </div>

        <div className="relative mt-8 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b}
              className="rounded-full border border-border-strong bg-surface-elevated/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {b}
            </span>
          ))}
        </div>

        <div className="relative mt-6 flex items-end justify-between border-t border-border pt-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              reputation
            </div>
            <div className="font-display text-lg font-medium">{profile.xp} XP</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              minted on
            </div>
            <div className="font-mono text-xs text-foreground">base</div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
