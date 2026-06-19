import { Link } from "@tanstack/react-router";
import { motion } from "@/components/landing/motion";
import { ArrowUpRight } from "lucide-react";

import { FOUNDER_SHOWCASE_NAME, LASZLO_SHOWCASE } from "@/lib/profile/founder-showcase";

const EXAMPLE_CREDENTIALS = ["Builder", "Community Leader", "Trusted Agent"] as const;

const EXAMPLE_UNLOCKS = ["Campaigns", "Grants", "Marketplace", "Community access"] as const;

/** Static Culture ID explainer — one card, one example (laszlo.culture). */
export function LandingCultureIdExample() {
  const handle = FOUNDER_SHOWCASE_NAME;
  const reputationLabel = LASZLO_SHOWCASE.cultureScoreRank.label;

  return (
    <section
      id="culture-id-example"
      className="relative w-full overflow-hidden border-t border-white/5 bg-[#050505] py-20 sm:py-28"
    >
      <div className="absolute inset-0 bc-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mono-label">WHAT IS A CULTURE ID?</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What is a Culture ID?
            </h2>
            <p className="mt-4 max-w-lg text-base text-zinc-400">
              One name. Verifiable proof. Portable reputation. Your onchain anchor on Base — a{" "}
              <code className="text-zinc-300">.culture</code> name that holds credentials,
              reputation, and earned access.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/pass"
                className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-5 py-2.5 text-sm font-semibold text-black hover:bg-white"
              >
                Claim yours
                <ArrowUpRight size={14} aria-hidden />
              </Link>
              <Link
                to={`/id/${handle}` as "/id/$name"}
                params={{ name: handle }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:border-[#00E5FF]/60"
              >
                View example profile
                <ArrowUpRight size={14} aria-hidden />
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-[#C5FF41]/25 bg-gradient-to-br from-[#C5FF41]/10 via-white/[0.03] to-transparent p-6 sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-[#C5FF41]">Example</p>
            <p className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{handle}</p>

            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Credentials
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {EXAMPLE_CREDENTIALS.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-zinc-200"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Reputation
                </p>
                <p className="mt-2 font-mono text-lg text-white">{reputationLabel}</p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Unlocked
                </p>
                <ul className="mt-2 space-y-1.5 text-zinc-300">
                  {EXAMPLE_UNLOCKS.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#C5FF41]" aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
