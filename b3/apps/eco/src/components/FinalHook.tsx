import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { buildchainAppUrl } from "@/lib/site-urls";
import { media } from "@/lib/media";
import { useReveal } from "@/hooks/use-reveal";
import { useParallaxLayer } from "@/hooks/use-parallax-layer";
import { cn } from "@/lib/utils";

export const FinalHook = () => {
  const ref = useReveal();
  const parallaxImg = useParallaxLayer(0.14);
  const [headlineInView, setHeadlineInView] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHeadlineInView(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeadlineInView(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return (
    <section
      id="join"
      ref={ref}
      className={cn(
        "final-hook relative min-h-[75vh] flex items-center overflow-hidden py-16 md:py-20",
        headlineInView && "final-hook--active",
      )}
    >
      <div ref={parallaxImg} className="parallax-layer pointer-events-none absolute inset-0 will-change-transform scale-[1.06]">
        <img
          src={media.community}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover brightness-[0.82] contrast-[1.06] saturate-[1.12]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/45 via-transparent to-background/40" />
      <div className="pointer-events-none absolute inset-0 bg-black/[0.12]" aria-hidden />

      <div className="container relative z-10 px-4 py-12">
        <div className="max-w-4xl">
          <div className="headline-stack relative pb-2">
            <p className="final-hook__line1 font-bold uppercase leading-[0.88] tracking-tight text-balance text-white">
              this building was waiting to die.
            </p>
            <h2 className="final-hook__line2 headline-stack__neon font-bold uppercase leading-[0.92] tracking-tight text-balance text-acid text-glow">
              now it’s waiting for us.
            </h2>
          </div>

          <div
            className={cn(
              "mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center transition-all duration-700 ease-out",
              headlineInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
            style={{ transitionDelay: headlineInView ? "220ms" : "0ms" }}
          >
            <a href="#builders" className="btn-acid inline-flex justify-center items-center gap-2 shrink-0">
              join the revival <ArrowRight size={16} />
            </a>
            <a
              href={buildchainAppUrl()}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost-acid inline-flex justify-center !py-4 shrink-0"
            >
              open marketplace
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
