import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Globe,
  ScrollText,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import { useWalletIdentities } from "@/hooks/useWalletIdentities";
import { BrandLogo } from "@/components/BrandLogo";

const iconProps = { size: 14, strokeWidth: 1.75, "aria-hidden": true as const };

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 transition hover:text-foreground"
    >
      {icon}
      {children}
    </a>
  );
}

function NavRouterLink({
  to,
  hash,
  icon,
  children,
}: {
  to: string;
  hash?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      hash={hash}
      className="flex items-center gap-1.5 transition hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}

function hasBrowserWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const { isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { data: walletIds } = useWalletIdentities();

  const primary = walletIds?.primary;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="glass-strong flex w-full max-w-6xl items-center justify-between rounded-full px-5 py-2.5">
        <BrandLogo imageClassName="h-8 w-8 object-contain" />

        <motion.div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {isHome ? (
            <>
              <NavLink href="#identity" icon={<Fingerprint {...iconProps} />}>
                Identity
              </NavLink>
              <NavLink href="#why" icon={<ScrollText {...iconProps} />}>
                Manifesto
              </NavLink>
              <NavLink href="#ecosystem" icon={<Globe {...iconProps} />}>
                Ecosystem
              </NavLink>
              <NavLink href="#founders" icon={<Users {...iconProps} />}>
                Founders
              </NavLink>
            </>
          ) : (
            <>
              <NavRouterLink to="/" hash="identity" icon={<Fingerprint {...iconProps} />}>
                Identity
              </NavRouterLink>
              <NavRouterLink to="/" hash="why" icon={<ScrollText {...iconProps} />}>
                Manifesto
              </NavRouterLink>
              <NavRouterLink to="/" hash="ecosystem" icon={<Globe {...iconProps} />}>
                Ecosystem
              </NavRouterLink>
              <NavRouterLink to="/" hash="founders" icon={<Users {...iconProps} />}>
                Founders
              </NavRouterLink>
            </>
          )}

          {primary && (
            <Link
              to="/id/$name"
              params={{ name: primary.fullName }}
              className="flex items-center gap-1.5 font-medium text-primary transition hover:text-primary/80"
            >
              <User {...iconProps} />
              My profile
            </Link>
          )}
        </motion.div>

        <motion.div className="flex items-center gap-2">
          {!isConnected && hasBrowserWallet() && (
            <button
              type="button"
              disabled={isConnecting}
              onClick={() => {
                const injected = connectors.find((c) => c.id === "injected");
                if (injected) connect({ connector: injected });
              }}
              className="hidden rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground md:inline-flex"
            >
              {isConnecting ? "Connecting…" : "Connect"}
            </button>
          )}

          {isHome ? (
            <a
              href="#claim"
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-border-strong bg-foreground px-4 py-1.5 text-xs font-medium text-background transition hover:bg-foreground/90"
            >
              <Sparkles size={13} strokeWidth={1.75} aria-hidden />
              Claim name
            </a>
          ) : (
            <Link
              to="/"
              hash="claim"
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-border-strong bg-foreground px-4 py-1.5 text-xs font-medium text-background transition hover:bg-foreground/90"
            >
              <Sparkles size={13} strokeWidth={1.75} aria-hidden />
              Claim name
            </Link>
          )}
        </motion.div>
      </nav>
    </motion.header>
  );
}
