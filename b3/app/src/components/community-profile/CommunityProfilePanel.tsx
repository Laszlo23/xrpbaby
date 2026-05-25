import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWalletClient } from "wagmi";
import { toast } from "sonner";
import type { CommunityProfile, SocialPlatform } from "@/lib/community-profile/types";
import {
  createMyProfile,
  fetchMyProfile,
  linkExtraWallet,
  requestWalletNonce,
  updateMyProfile,
  verifyWalletSignature,
} from "@/lib/community-profile/api";
import { getProfileJwt, setProfileJwt } from "@/lib/community-profile/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { signSolanaLinkMessage } from "@/lib/solana-wallet-link";
import { signSuiLinkMessage } from "@/lib/sui-wallet-link";
import { SOCIAL_PLATFORM_LABEL } from "@/lib/community-profile/social-labels";
import { SiweMessage } from "siwe";

const PLATFORMS: SocialPlatform[] = [
  "twitter",
  "linkedin",
  "github",
  "discord",
  "telegram",
  "instagram",
  "youtube",
  "farcaster",
  "website",
  "other",
];

export function CommunityProfilePanel({ evmAddress }: { evmAddress: `0x${string}` }) {
  const { data: walletClient } = useWalletClient();
  const [jwt, setJwtState] = useState<string | null>(null);
  const [remote, setRemote] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [focusTags, setFocusTags] = useState("");
  const [showWallets, setShowWallets] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showSocialLinks, setShowSocialLinks] = useState(true);
  const [socialRows, setSocialRows] = useState<{ platform: SocialPlatform; url: string }[]>([
    { platform: "website", url: "" },
  ]);

  const [contactEnabled, setContactEnabled] = useState(false);
  const [contactPriceEth, setContactPriceEth] = useState("");
  const [contactDestinationUrl, setContactDestinationUrl] = useState("");
  const [contactIntro, setContactIntro] = useState("");

  const [btcInput, setBtcInput] = useState("");

  const refreshRemote = useCallback(async () => {
    const token = getProfileJwt();
    setJwtState(token);
    if (!token) {
      setRemote(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMyProfile();
      setRemote(me);
      if (me) {
        setSlug(me.slug);
        setDisplayName(me.displayName);
        setHeadline(me.headline ?? "");
        setBio(me.bio ?? "");
        setFocusTags(me.focusTags ?? "");
        setShowWallets(me.visibility?.showWallets !== false);
        setShowActivity(me.visibility?.showActivity !== false);
        setShowSocialLinks(me.visibility?.showSocialLinks !== false);
        setContactEnabled(!!me.contactEnabled);
        setContactPriceEth(me.contactPriceEth ?? "");
        setContactDestinationUrl(me.contactDestinationUrl ?? "");
        setContactIntro(me.contactIntro ?? "");
        if (me.socialLinks?.length) {
          setSocialRows(
            me.socialLinks.map((s) => ({
              platform: s.platform,
              url: s.url,
            })),
          );
        }
      }
    } catch (e) {
      setRemote(null);
      const msg = e instanceof Error ? e.message : "unknown error";
      toast.error(
        `Could not reach Strapi (${msg}). Set STRAPI_URL / VITE_STRAPI_URL on the server and ensure Strapi allows the proxy.`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setJwtState(getProfileJwt());
  }, []);

  useEffect(() => {
    void refreshRemote();
  }, [refreshRemote]);

  async function signIn() {
    if (!walletClient) {
      toast.error("Wallet not ready");
      return;
    }
    try {
      const { nonce, statement } = await requestWalletNonce(evmAddress);
      const chainId = await walletClient.getChainId();
      const siwe = new SiweMessage({
        domain: window.location.host,
        address: evmAddress,
        statement,
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
      const message = siwe.prepareMessage();
      const signature = await walletClient.signMessage({ message });
      const token = await verifyWalletSignature(message, signature);
      setProfileJwt(token);
      setJwtState(token);
      toast.success("Signed in");
      await refreshRemote();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    }
  }

  function signOutProfile() {
    setProfileJwt(null);
    setJwtState(null);
    setRemote(null);
    toast.message("Profile session cleared");
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const socialLinks = socialRows
        .filter((r) => r.url.trim())
        .map((r) => ({
          platform: r.platform,
          url: r.url.trim(),
        }));
      const created = await createMyProfile({
        slug: slug.trim().toLowerCase(),
        displayName: displayName.trim(),
        headline: headline.trim(),
        bio,
        focusTags,
        socialLinks,
        visibility: { showWallets, showActivity, showSocialLinks },
        contactEnabled,
        contactPriceEth: contactPriceEth.trim(),
        contactDestinationUrl: contactDestinationUrl.trim(),
        contactIntro: contactIntro.trim(),
      });
      setRemote(created);
      toast.success("Profile created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const socialLinks = socialRows
        .filter((r) => r.url.trim())
        .map((r) => ({
          platform: r.platform,
          url: r.url.trim(),
        }));
      const updated = await updateMyProfile({
        slug: slug.trim().toLowerCase(),
        displayName: displayName.trim(),
        headline: headline.trim(),
        bio,
        focusTags,
        socialLinks,
        visibility: { showWallets, showActivity, showSocialLinks },
        contactEnabled,
        contactPriceEth: contactPriceEth.trim(),
        contactDestinationUrl: contactDestinationUrl.trim(),
        contactIntro: contactIntro.trim(),
      });
      setRemote(updated);
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function linkSolana() {
    const msg = [
      "BUILDCHAIN profile — link Solana wallet",
      `EVM owner: ${evmAddress}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n");
    try {
      const { address, signature, message } = await signSolanaLinkMessage(msg);
      await linkExtraWallet({
        chain: "solana",
        address,
        message,
        signature,
      });
      toast.success("Solana wallet linked");
      await refreshRemote();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Solana link failed");
    }
  }

  async function linkSui() {
    const msg = [
      "BUILDCHAIN profile — link Sui wallet",
      `EVM owner: ${evmAddress}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n");
    try {
      const { address, signature, message } = await signSuiLinkMessage(msg);
      await linkExtraWallet({
        chain: "sui",
        address,
        message,
        signature,
      });
      toast.success("Sui wallet linked");
      await refreshRemote();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sui link failed");
    }
  }

  async function linkBitcoin() {
    const addr = btcInput.trim();
    if (!addr) {
      toast.error("Paste a Bitcoin address");
      return;
    }
    try {
      await linkExtraWallet({
        chain: "bitcoin",
        address: addr,
      });
      toast.success("Bitcoin address added (unverified)");
      setBtcInput("");
      await refreshRemote();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bitcoin link failed");
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-3xl border border-white/[0.06] p-6 text-sm text-zinc-500">
        Loading community profile…
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl border border-white/[0.06] p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
            Community profile
          </p>
          <h2 className="font-heading text-lg font-semibold text-white">Universal profile</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Stored in Strapi — sign in with your EVM wallet to edit. Set{" "}
            <span className="font-mono">STRAPI_URL</span> (server) and{" "}
            <span className="font-mono">VITE_STRAPI_URL</span> (build) to your API base; requests
            are proxied same-origin from the app.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!jwt ? (
            <Button
              type="button"
              className="rounded-full bg-[var(--b3-purple)] text-white hover:bg-[var(--base-blue-hover)]"
              onClick={() => void signIn()}
            >
              Sign in to edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={signOutProfile}
              >
                Sign out
              </Button>
              {remote?.slug ? (
                <Button type="button" variant="secondary" className="rounded-full" asChild>
                  <Link to="/p/$slug" params={{ slug: remote.slug }}>
                    View public page
                  </Link>
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {!jwt ? (
        <p className="text-sm text-zinc-500">
          Sign a message once to get a session token. Your keys never leave your wallet.
        </p>
      ) : !remote ? (
        <form className="space-y-4" onSubmit={onCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="handle">Public handle</Label>
              <Input
                id="handle"
                className="font-mono"
                placeholder="your-handle"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dname">Display name</Label>
              <Input
                id="dname"
                placeholder="Alex Builder"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="Short tagline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">About</Label>
            <textarea
              id="bio"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              placeholder="Bio, roles, interests…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Focus tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="design, solidity, hiking"
              value={focusTags}
              onChange={(e) => setFocusTags(e.target.value)}
            />
          </div>
          <SocialEditor rows={socialRows} setRows={setSocialRows} />
          <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ss">Show social links publicly</Label>
              <Switch id="ss" checked={showSocialLinks} onCheckedChange={setShowSocialLinks} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="sw">Show wallets on public profile</Label>
              <Switch id="sw" checked={showWallets} onCheckedChange={setShowWallets} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="sa">Show on-chain snapshot</Label>
              <Switch id="sa" checked={showActivity} onCheckedChange={setShowActivity} />
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
              Contact gateway
            </p>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ce">Enable contact button</Label>
              <Switch id="ce" checked={contactEnabled} onCheckedChange={setContactEnabled} />
            </div>
            {contactEnabled ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="cprice">Your price (ETH)</Label>
                  <Input
                    id="cprice"
                    className="font-mono"
                    placeholder="0 = free, or e.g. 0.02"
                    value={contactPriceEth}
                    onChange={(e) => setContactPriceEth(e.target.value)}
                  />
                  <p className="text-[11px] text-zinc-500">
                    Empty or 0 lets anyone open your link. Higher price = stronger filter for
                    inbound messages.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curl">Contact destination URL</Label>
                  <Input
                    id="curl"
                    placeholder="https://warpcast.com/..., mailto:..., t.me/..., cal.com/..."
                    value={contactDestinationUrl}
                    onChange={(e) => setContactDestinationUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cintro">Note to visitors</Label>
                  <textarea
                    id="cintro"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    placeholder="How you prefer to be contacted (Farcaster DMs, email, etc.)"
                    value={contactIntro}
                    onChange={(e) => setContactIntro(e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-[var(--b3-purple)] text-white hover:bg-[var(--base-blue-hover)]"
          >
            Create profile
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={onSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="handle2">Public handle</Label>
              <Input
                id="handle2"
                className="font-mono"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dname2">Display name</Label>
              <Input
                id="dname2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline2">Headline</Label>
            <Input id="headline2" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio2">About</Label>
            <textarea
              id="bio2"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags2">Focus tags</Label>
            <Input id="tags2" value={focusTags} onChange={(e) => setFocusTags(e.target.value)} />
          </div>
          <SocialEditor rows={socialRows} setRows={setSocialRows} />
          <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ss2">Show social links publicly</Label>
              <Switch id="ss2" checked={showSocialLinks} onCheckedChange={setShowSocialLinks} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="sw2">Show wallets</Label>
              <Switch id="sw2" checked={showWallets} onCheckedChange={setShowWallets} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="sa2">Show on-chain snapshot</Label>
              <Switch id="sa2" checked={showActivity} onCheckedChange={setShowActivity} />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
              Contact gateway
            </p>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ce2">Enable contact button</Label>
              <Switch id="ce2" checked={contactEnabled} onCheckedChange={setContactEnabled} />
            </div>
            {contactEnabled ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="cprice2">Your price (ETH)</Label>
                  <Input
                    id="cprice2"
                    className="font-mono"
                    placeholder="0 = free, or e.g. 0.02"
                    value={contactPriceEth}
                    onChange={(e) => setContactPriceEth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curl2">Contact destination URL</Label>
                  <Input
                    id="curl2"
                    placeholder="https://warpcast.com/..., mailto:..., t.me/..."
                    value={contactDestinationUrl}
                    onChange={(e) => setContactDestinationUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cintro2">Note to visitors</Label>
                  <textarea
                    id="cintro2"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    placeholder="How you prefer to be contacted"
                    value={contactIntro}
                    onChange={(e) => setContactIntro(e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
              Link more wallets
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                onClick={() => void linkSolana()}
              >
                Solana (sign)
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                onClick={() => void linkSui()}
              >
                Sui (sign)
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="grow space-y-2">
                <Label htmlFor="btc">Bitcoin address (display-only)</Label>
                <Input
                  id="btc"
                  className="font-mono text-xs"
                  placeholder="bc1…"
                  value={btcInput}
                  onChange={(e) => setBtcInput(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => void linkBitcoin()}
              >
                Add BTC
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-[var(--b3-purple)] text-white hover:bg-[var(--base-blue-hover)]"
          >
            Save changes
          </Button>
        </form>
      )}
    </div>
  );
}

function SocialEditor({
  rows,
  setRows,
}: {
  rows: { platform: SocialPlatform; url: string }[];
  setRows: (r: { platform: SocialPlatform; url: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>Social & links</Label>
        <p className="mt-1 text-[11px] text-zinc-500">
          Add X, LinkedIn, GitHub,{" "}
          <span className="font-medium text-zinc-400">Farcaster (Warpcast URL)</span>, etc.
        </p>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <select
              className="border-input bg-background h-10 rounded-xl border px-3 text-sm sm:w-40"
              value={row.platform}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, platform: e.target.value as SocialPlatform };
                setRows(next);
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {SOCIAL_PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
            <Input
              placeholder="https://… (Warpcast, X, site…)"
              value={row.url}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, url: e.target.value };
                setRows(next);
              }}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full text-xs"
        onClick={() => setRows([...rows, { platform: "website", url: "" }])}
      >
        + Add link
      </Button>
    </div>
  );
}
