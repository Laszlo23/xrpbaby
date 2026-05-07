import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ParallaxProps {
  children: ReactNode;
  /** how far it shifts vertically (px). negative = moves slower / upward */
  offset?: number;
  className?: string;
}

/** Wraps children in a scroll-driven vertical translate for cinematic depth. */
export const Parallax = ({ children, offset = 80, className }: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, willChange: "transform" }}>{children}</motion.div>
    </div>
  );
};
