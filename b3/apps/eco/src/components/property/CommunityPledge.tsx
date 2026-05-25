import type { PropertyRecord } from "@/lib/properties";

type CommunityPledgeProps = {
  property: PropertyRecord;
};

export function CommunityPledge({ property }: CommunityPledgeProps) {
  const body = property.whyItMatters ?? property.thesis;

  return (
    <section className="relative border-t border-border/50 py-16 md:py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold uppercase tracking-tight mb-8" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            Build this place with us.
          </h2>
          <div className="space-y-6 text-left text-sm text-muted-foreground leading-relaxed md:text-base">
            {body.split("\n\n").map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#join" className="btn-acid !py-3 !px-6 !text-xs">
              Join the loop
            </a>
            <a href="#docs" className="btn-ghost-acid !py-3 !px-6 !text-xs">
              Read the docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
