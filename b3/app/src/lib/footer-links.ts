import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import {
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Compass,
  Cookie,
  Fingerprint,
  FileText,
  Flag,
  Gamepad2,
  Globe,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Layers,
  Mail,
  Map as MapIcon,
  MapPin,
  MessageSquareQuote,
  Palette,
  PieChart,
  Rocket,
  Shield,
  Sparkles,
  Trophy,
  UserCircle,
  Users,
  Zap,
  Gem,
} from "lucide-react";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiFarcaster } from "react-icons/si";
import {
  communityTelegramUrl,
  communityXUrl,
  farcasterFollowProfileUrl,
} from "@/lib/community-links";
import { LANDING_SOCIAL } from "@/lib/landing-media";

export type InternalFooterLink =
  | {
      to: string;
      label: string;
      icon: LucideIcon;
      hash?: "drops" | "community" | "vision" | "investors" | "future" | "ecosystem";
    }
  | {
      to: string;
      label: string;
      icon: LucideIcon;
      hash?: undefined;
    };

export type ExternalFooterLink = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string; size?: number }>;
};

export const footerProductLinks: InternalFooterLink[] = [
  { to: "/", label: "Story", icon: Home },
  { to: "/play", label: "Play", icon: Zap },
  { to: "/join", label: "Join", icon: Fingerprint },
  { to: "/pass", label: "Claim your .tld", icon: Fingerprint },
  { to: "/forest", label: "Community hub", icon: Rocket },
  { to: "/voice", label: "Builder Voice", icon: MessageSquareQuote },
  { to: "/marketplace", label: "Marketplace", icon: Building2 },
  { to: "/collections", label: "Collections", icon: Layers },
  { to: "/campaign", label: "Campaign", icon: Rocket },
  { to: "/elias", label: "Elias", icon: Gem },
];

export const footerEcosystemLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Capital", href: "https://app.buildingcultureid.space", icon: Compass },
  { label: "App", href: "/play", icon: Layers },
  { label: "Home", href: "https://home.buildingcultureid.space", icon: Home },
  { label: "Art", href: "/drops/art", icon: Palette },
  { label: "WohnAI", href: "https://wohnai.buildingcultureid.space", icon: Bot },
  { label: "BCDAI", href: "https://bcdai.buildingcultureid.space", icon: Zap },
  { label: "Game", href: "https://game.buildingcultureid.space", icon: Gamepad2 },
  { label: "Ankommen AI", href: "https://ankommen.buildingcultureid.space", icon: Globe },
  { label: "KinderStimme", href: "https://forkids.buildingcultureid.space", icon: Shield },
];

export const footerLayerLinks: InternalFooterLink[] = [
  { to: "/signal", label: "Culture Pulse", icon: Sparkles },
  { to: "/earth", label: "Earth lane", icon: Globe },
  { to: "/drops/art", label: "Art drops", icon: Palette },
  { to: "/0g/agentid", label: "0G Agent ID (hackathon)", icon: Bot },
  { to: "/trading-agent", label: "Trading agent (x402)", icon: Zap },
];

export const footerCompanyLinks: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/guide", label: "Sites guide", icon: Compass },
  { to: "/about", label: "About", icon: Info },
  { to: "/team", label: "Team", icon: Users },
  { to: "/mission", label: "Mission (BCC)", icon: Flag },
  { to: "/story", label: "Builder chronicle", icon: BookOpen },
  { to: "/liquidity", label: "BCC liquidity", icon: PieChart },
  { to: "/investors", label: "Investors", icon: PieChart },
  { to: "/roadmap", label: "Roadmap", icon: MapPin },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/blog", label: "Blog", icon: BookOpen },
];

export const footerStoryHashLinks: { label: string; hash: string; icon: LucideIcon }[] = [
  { label: "Vision", hash: "vision", icon: Sparkles },
  { label: "Investors", hash: "investors", icon: Briefcase },
  { label: "Roadmap", hash: "future", icon: MapIcon },
];

export const footerLegalLinks: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/legal/terms", label: "Terms", icon: FileText },
  { to: "/legal/privacy", label: "Privacy", icon: Shield },
  { to: "/legal/imprint", label: "Imprint", icon: Landmark },
  { to: "/legal/cookies", label: "Cookies", icon: Cookie },
];

export const footerCommunityLinks: InternalFooterLink[] = [
  { to: "/forest", label: "Community hub", icon: Users },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/mission", label: "Mission", icon: Rocket },
  { to: "/genesis-district", label: "Genesis District", icon: Gem },
];

export function footerSocialLinks(): ExternalFooterLink[] {
  const discord = import.meta.env.VITE_COMMUNITY_DISCORD_URL as string | undefined;
  const out: ExternalFooterLink[] = [
    { href: LANDING_SOCIAL.x, label: "X", Icon: FaXTwitter },
    { href: LANDING_SOCIAL.telegram, label: "Telegram", Icon: FaTelegram },
    { href: LANDING_SOCIAL.discord, label: "Discord", Icon: FaDiscord },
    { href: communityXUrl(), label: "X — @buildingcultu3", Icon: FaXTwitter },
    { href: communityTelegramUrl(), label: "Telegram", Icon: FaTelegram },
    { href: farcasterFollowProfileUrl(), label: "Farcaster", Icon: SiFarcaster },
  ];
  if (discord?.trim()) {
    out.unshift({ href: discord.trim(), label: "Discord (env)", Icon: FaDiscord });
  }
  return out;
}

export const footerContactMailto = "mailto:hello@buildingcultureid.space";

/** Flat href + icon row for story landing footer columns. */
export type FooterHrefLink = { label: string; href: string; icon: LucideIcon };

function ecosystemByLabel(labels: string[]): FooterHrefLink[] {
  const byLabel = new Map(footerEcosystemLinks.map((l) => [l.label, l]));
  return labels.flatMap((label) => {
    const link = byLabel.get(label);
    return link ? [link] : [];
  });
}

/** Story landing footer — Ecosystem column (canonical URLs from footerEcosystemLinks). */
export const landingFooterEcosystemColumn: FooterHrefLink[] = [
  ...ecosystemByLabel(["Capital", "App"]),
  { label: "Invest", href: "/places", icon: Briefcase },
  ...ecosystemByLabel(["Home"]),
  { label: "ID", href: "/join", icon: Fingerprint },
];

/** Story landing footer — Layers column. */
export const landingFooterLayersColumn: FooterHrefLink[] = [
  ...ecosystemByLabel(["Art", "WohnAI", "BCDAI", "Game", "Ankommen AI", "KinderStimme"]),
  { label: "Community", href: "/forest", icon: Rocket },
];

/** Story landing footer — Company column (hash anchors + legal + contact). */
export const landingFooterCompanyColumn: FooterHrefLink[] = [
  { label: "Vision", href: "#vision", icon: Sparkles },
  { label: "Investors", href: "#investors", icon: Briefcase },
  { label: "Roadmap", href: "#future", icon: MapIcon },
  { label: "Grant proof", href: "/grant-proof", icon: Shield },
  { label: "Terms", href: "/legal/terms", icon: FileText },
  { label: "Privacy", href: "/legal/privacy", icon: Shield },
  { label: "Imprint", href: "/legal/imprint", icon: Landmark },
  { label: "Contact", href: footerContactMailto, icon: Mail },
];
