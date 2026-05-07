import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Single proof link for hub storylines (`/land`, `/city`, `/water`) — no other property text in global footer. */
export function PropertyStripFooter() {
  return (
    <section aria-label="Proof property" className="border-t border-border/40 bg-muted/5 py-8">
      <div className="container flex justify-center px-4">
        <Link
          to="/property/landmark-bernhardsthal"
          className="btn-ghost-acid !inline-flex !items-center !gap-2 !py-3 !px-5 !text-[10px] font-mono uppercase tracking-widest"
        >
          Explore the proof property <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
