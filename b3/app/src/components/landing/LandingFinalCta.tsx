import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Layers, UserPlus } from "lucide-react";

import { joinLandingWaitlist, trackLandingEvent } from "@/lib/landing-api";
import { LANDING_MEDIA } from "@/lib/landing-media";

export function LandingFinalCta() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await joinLandingWaitlist({ email, source: "final_cta" });
      void trackLandingEvent("waitlist_join", "final_cta", {});
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="join" className="relative w-full overflow-hidden bg-black py-28 sm:py-40">
      <div className="absolute inset-0">
        <img
          src={LANDING_MEDIA.building1}
          alt="A thriving community"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <motion.div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
        <div className="absolute inset-0 bc-spotlight" />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <p className="mono-label">JOIN BUILDING CULTURE</p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 font-display text-[44px] leading-[0.96] font-bold tracking-[-0.04em] text-white sm:text-7xl lg:text-[96px]"
        >
          The future isn&apos;t built <br />
          by <span className="text-zinc-500">institutions.</span> <br />
          It&apos;s built by <span className="bc-text-gradient">people.</span>
        </motion.h2>
        <p className="mx-auto mt-8 max-w-xl text-lg text-zinc-300/90">
          Create your pass in one step — then grow with the community.
        </p>

        <Link
          to="/join"
          onClick={() => void trackLandingEvent("start_growing", "final_cta")}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-8 py-4 text-[15px] font-semibold text-black transition-colors hover:bg-white"
        >
          Start growing
          <ArrowUpRight size={16} aria-hidden />
        </Link>

        <div className="mx-auto mt-10 max-w-lg">
          {!done ? (
            <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-full bc-glass-strong px-6 py-4 text-[15px] text-white placeholder:text-zinc-500 focus:border-[#00E5FF]/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-7 py-4 text-[14px] font-semibold text-black transition-colors hover:bg-white disabled:opacity-50"
              >
                {loading ? "Saving…" : "Email updates (optional)"}
                <ArrowUpRight size={16} />
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 rounded-full bc-glass-strong px-6 py-4 text-white"
            >
              <CheckCircle2 size={18} className="text-[#C5FF41]" />
              <span className="text-sm">
                You&apos;re in. We&apos;ll be in touch with what&apos;s next.
              </span>
            </motion.div>
          )}
          {error ? <p className="mt-3 text-sm text-[#C47C59]">{error}</p> : null}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/join"
            onClick={() => void trackLandingEvent("final_cta_join", "final_cta")}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[14px] font-semibold text-black transition-colors hover:bg-[#C5FF41]"
          >
            <UserPlus size={16} aria-hidden />
            Join the community
            <ArrowUpRight size={16} aria-hidden />
          </Link>
          <a
            href="#ecosystem"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[14px] font-semibold text-white hover:border-[#00E5FF]/60"
          >
            <Layers size={16} aria-hidden />
            Explore The Ecosystem
          </a>
        </div>
      </div>
    </section>
  );
}
