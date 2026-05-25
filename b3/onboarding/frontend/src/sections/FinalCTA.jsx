import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Layers, UserPlus } from "lucide-react";
import { MEDIA, ECOSYSTEM_EXTERNAL_CTA } from "../lib/media";
import { JOIN_URL } from "../lib/platform";
import { joinWaitlist, trackEvent } from "../lib/bcApi";

export const FinalCTA = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await joinWaitlist({ email, source: "final_cta" });
      trackEvent("waitlist_join", "final_cta", {});
      setDone(true);
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="join"
      data-testid="final-cta-section"
      className="relative w-full overflow-hidden bg-black py-28 sm:py-40"
    >
      <div className="absolute inset-0">
        <img
          src={MEDIA.building1}
          alt="A thriving community"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
        <div className="absolute inset-0 bc-spotlight" />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center">
        <p className="mono-label">JOIN BUILDING CULTURE</p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 font-display text-[44px] sm:text-7xl lg:text-[96px] font-bold tracking-[-0.04em] text-white leading-[0.96]"
          data-testid="final-cta-headline"
        >
          The future isn't built <br />
          by <span className="text-zinc-500">institutions.</span> <br />
          It's built by <span className="bc-text-gradient">people.</span>
        </motion.h2>
        <p className="mt-8 max-w-xl mx-auto text-zinc-300/90 text-lg">
          Create your pass in one step — then grow the forest with us.
        </p>

        <a
          href={JOIN_URL}
          onClick={() => trackEvent("start_growing", "final_cta")}
          data-testid="final-cta-start-growing"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-8 py-4 text-[15px] font-semibold text-black hover:bg-white transition-colors"
        >
          Start growing
          <ArrowUpRight size={16} aria-hidden />
        </a>

        {/* Optional email updates */}
        <div className="mt-10 max-w-lg mx-auto" data-testid="waitlist-block">
          {!done ? (
            <form
              onSubmit={submit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                data-testid="waitlist-email-input"
                className="flex-1 rounded-full bc-glass-strong px-6 py-4 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00E5FF]/50"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="waitlist-submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-7 py-4 text-[14px] font-semibold text-black hover:bg-white transition-colors disabled:opacity-50"
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
              data-testid="waitlist-success"
            >
              <CheckCircle2 size={18} className="text-[#C5FF41]" />
              <span className="text-sm">You're in. We'll be in touch with what's next.</span>
            </motion.div>
          )}
          {error && (
            <p className="mt-3 text-sm text-[#C47C59]" data-testid="waitlist-error">
              {error}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={ECOSYSTEM_EXTERNAL_CTA}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("final_cta_join", "final_cta")}
            data-testid="final-cta-join"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[14px] font-semibold text-black hover:bg-[#C5FF41] transition-colors"
          >
            <UserPlus size={16} aria-hidden />
            Start growing
            <ArrowUpRight size={16} aria-hidden />
          </a>
          <a
            href="#ecosystem"
            data-testid="final-cta-explore"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[14px] font-semibold text-white hover:border-[#00E5FF]/60"
          >
            <Layers size={16} aria-hidden />
            Explore The Ecosystem
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
