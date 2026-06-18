import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import {
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Coins,
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
  { to: "/products", label: "Products", icon: Layers },
  { to: "/products/culture-id", label: "Building Culture ID", icon: Fingerprint },
  { to: "/products/campaign-hub", label: "Campaign Hub", icon: Zap },
  { to: "/products/ai-agents", label: "AI Agents", icon: Bot },
  { to: "/products/grant-proof", label: "Grant Proof", icon: Shield },
  { to: "/play", label: "Campaign Hub app", icon: Zap },
  { to: "/join", label: "Join", icon: Fingerprint },
  { to: "/pass", label: "Claim your .culture name", icon: Fingerprint },
  { to: "/forest", label: "Community hub", icon: Rocket },
  { to: "/voice", label: "Builder Voice", icon: MessageSquareQuote },
  { to: "/marketplace", label: "Marketplace", icon: Building2 },
  { to: "/explorer", label: "Explorer for humans", icon: Compass },
  { to: "/collections", label: "Collections", icon: Layers },
  { to: "/campaign", label: "Agent shares", icon: Rocket },
  { to: "/elias", label: "Elias", icon: Gem },
  { to: "/creators", label: "Creators", icon: Palette },
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
  {
    label: "Culture Atlas",
    href: "https://buildingcultureid.space/demo/atlas/",
    icon: Globe,
  },
];

export const footerLayerLinks: InternalFooterLink[] = [
  { to: "/signal", label: "Culture Pulse", icon: Sparkles },
  { to: "/earth", label: "Earth lane", icon: Globe },
  { to: "/drops/art", label: "Art drops", icon: Palette },
  { to: "/agent-os", label: "Agent OS", icon: Bot },
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

/** Focused landing footer — Product column. */
export const landingFooterProductColumn: FooterHrefLink[] = [
  { label: "Culture ID", href: "/pass", icon: Fingerprint },
  { label: "Credentials", href: "/credentials", icon: Shield },
  { label: "Reputation", href: "/credentials/leaderboard", icon: Trophy },
  { label: "Agent OS", href: "/agent-os", icon: Bot },
];

/** Focused landing footer — Community column. */
export const landingFooterCommunityColumn: FooterHrefLink[] = [
  { label: "Mission", href: "/mission", icon: Flag },
  { label: "Story", href: "/story", icon: BookOpen },
  { label: "Team", href: "/team", icon: Users },
];

/** Focused landing footer — Ecosystem column. */
export const landingFooterEcosystemColumn: FooterHrefLink[] = [
  { label: "Ecosystem Hub", href: "/ecosystem", icon: Layers },
  { label: "Places", href: "/places", icon: Briefcase },
  { label: "Art", href: "/drops/art", icon: Palette },
  { label: "AI Apps", href: "/ecosystem#ai-apps", icon: Bot },
];

/** Focused landing footer — Capital column. */
export const landingFooterCapitalColumn: FooterHrefLink[] = [
  { label: "BCC", href: "/bcc/dashboard", icon: Coins },
  { label: "Investors", href: "/investors", icon: PieChart },
  { label: "Roadmap", href: "/roadmap", icon: MapPin },
];

/** Landing footer legal + contact (bottom bar extras). */
export const landingFooterLegalColumn: FooterHrefLink[] = [
  { label: "Terms", href: "/legal/terms", icon: FileText },
  { label: "Privacy", href: "/legal/privacy", icon: Shield },
  { label: "Imprint", href: "/legal/imprint", icon: Landmark },
  { label: "Contact", href: footerContactMailto, icon: Mail },
];

/** @deprecated Use landingFooterLayersColumn on /ecosystem full directory only */
export const landingFooterLayersColumn: FooterHrefLink[] = [
  ...ecosystemByLabel([
    "Art",
    "Culture Atlas",
    "WohnAI",
    "BCDAI",
    "Game",
    "Ankommen AI",
    "KinderStimme",
  ]),
  { label: "Community", href: "/forest", icon: Rocket },
];

/** @deprecated Use landingFooterLegalColumn */
export const landingFooterCompanyColumn: FooterHrefLink[] = landingFooterLegalColumn;

/** Focused product footer columns (AppFooter focused variant). */
export const focusedFooterProductColumn: FooterHrefLink[] = landingFooterProductColumn;
export const focusedFooterCommunityColumn: FooterHrefLink[] = landingFooterCommunityColumn;
export const focusedFooterEcosystemColumn: FooterHrefLink[] = landingFooterEcosystemColumn;
export const focusedFooterCapitalColumn: FooterHrefLink[] = landingFooterCapitalColumn;
