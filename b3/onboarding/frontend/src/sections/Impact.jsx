import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { MEDIA } from "../lib/media";

const STORIES = [
  {
    title: "Community Spaces",
    location: "Vienna, AT",
    desc: "Reactivating dormant ground floors into shared workshops, kitchens and gathering rooms.",
    metric: "12 spaces",
  },
  {
    title: "Housing Initiatives",
    location: "Lower Austria",
    desc: "Tokenized co-living pilots that make ownership accessible to a new generation.",
    metric: "47 homes",
  },
  {
    title: "Revitalized Properties",
    location: "Burgenland",
    desc: "Heritage buildings restored with community capital and local craft.",
    metric: "8 restorations",
  },
  {
    title: "Local Projects",
    location: "Pan-European",
    desc: "Cultural events, art residencies and small businesses funded by the network.",
    metric: "120+ events",
  },
];

export const Impact = () => {
  return (
    <section
      id="impact"
      data-testid="impact-section"
      className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <p className="mono-label">REAL WORLD IMPACT</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 font-display text-[40px] sm:text-7xl font-bold tracking-tight text-white leading-[1]"
              data-testid="impact-headline"
            >
              Not another token. <br />
              Not another app. <br />
              <span className="bc-text-gradient">Real places. Real people.</span>
            </motion.h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-zinc-400 text-base sm:text-lg">
              We measure success in homes restored, neighborhoods reopened and people who finally have a stake
              in the place they call home.
            </p>
          </div>
        </div>

        {/* Asymmetric bento */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Big visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/5 min-h-[420px]"
          >
            <img
              src={MEDIA.impact}
              alt="Thriving community"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10">
              <p className="mono-label !text-[#C5FF41]">CHAPTER 02 · THE RETURN</p>
              <h3 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-white leading-tight max-w-md">
                A place is alive when its people return to it.
              </h3>
            </div>
          </motion.div>

          {/* Stats column */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-5">
            {STORIES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className={`bc-glass rounded-3xl p-6 flex flex-col justify-between min-h-[200px] ${
                  i === 0 ? "col-span-2" : ""
                }`}
                data-testid={`impact-card-${i}`}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-zinc-500">
                    <MapPin size={12} />
                    <span className="font-mono text-[10px] uppercase tracking-widest">{s.location}</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-[#00E5FF]">{s.metric}</span>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-white">{s.title}</p>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
