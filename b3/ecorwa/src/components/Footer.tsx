import { Link } from "react-router-dom";
import { buildchainAppUrl, communityXUrl, contactMailto } from "@/lib/site-urls";

export const Footer = () => {
  const mail = contactMailto();
  return (
    <footer className="border-t border-border/60 py-10 relative">
      <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-primary pulse-dot" />
            <span className="relative rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
            Building<span className="text-muted-foreground mx-1">·</span>
            <span className="text-acid">Culture</span>
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground max-w-sm leading-relaxed">
          Revive places with the people who live them. Vienna · 2026
        </p>
        <div className="flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <a href="#two-futures" className="hover:text-primary transition-colors">
            futures
          </a>
          <a href="#project" className="hover:text-primary transition-colors">
            proof
          </a>
          <a
            href={buildchainAppUrl()}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-primary transition-colors"
          >
            marketplace ↗
          </a>
          {mail ? (
            <a href={mail} className="hover:text-primary transition-colors">
              contact
            </a>
          ) : null}
          <a href={communityXUrl()} target="_blank" rel="noreferrer noopener" className="hover:text-primary transition-colors">
            x ↗
          </a>
          <Link to="/legal/terms" className="hover:text-primary transition-colors">
            terms
          </Link>
          <Link to="/legal/privacy" className="hover:text-primary transition-colors">
            privacy
          </Link>
          <Link to="/legal/cookies" className="hover:text-primary transition-colors">
            cookies
          </Link>
          <Link to="/legal/imprint" className="hover:text-primary transition-colors">
            imprint
          </Link>
          <a
            href={`${buildchainAppUrl().replace(/\/$/, "")}/team`}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-primary transition-colors"
          >
            team ↗
          </a>
          <Link to="/legal/disclaimer" className="hover:text-primary transition-colors">
            disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
};
