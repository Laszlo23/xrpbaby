"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getPublicOrigin } from "@/lib/site-url";

type PropertyShareButtonProps = {
  propertyId: string;
  /** Short title for share text (e.g. property headline) */
  title: string;
  variant?: "default" | "compact";
  /** Called after a successful native or social share (for community tasks). */
  onShareSuccess?: () => void;
};

function encodeParams(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

export function PropertyShareButton({
  propertyId,
  title,
  variant = "default",
  onShareSuccess,
}: PropertyShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOrigin(getPublicOrigin());
  }, []);

  const url = useMemo(() => {
    if (!origin) return "";
    return `${origin}/properties/${propertyId}`;
  }, [origin, propertyId]);

  const body = useMemo(
    () => `Invest in fractional real estate: ${title}. Building Culture — see Legal for disclosures.`,
    [title],
  );

  const updateMenuPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const menuWidth = 220;
    setMenuPos({
      top: r.bottom + 8,
      left: Math.max(8, r.right - menuWidth),
      width: menuWidth,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPos();
    const onScroll = () => updateMenuPos();
    const onResize = () => updateMenuPos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, updateMenuPos]);

  const shareNative = useCallback(async () => {
    if (!url) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: body, url });
        setOpen(false);
        onShareSuccess?.();
      } catch {
        /* user cancelled or share failed */
      }
    }
  }, [body, title, url, onShareSuccess]);

  const copyLink = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShareSuccess?.();
    } catch {
      /* ignore */
    }
  }, [url, onShareSuccess]);

  const social = useMemo(() => {
    if (!url) return null;
    return {
      x: `https://twitter.com/intent/tweet?${encodeParams({ text: body, url })}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?${encodeParams({ url })}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?${encodeParams({ u: url })}`,
    };
  }, [body, url]);

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const menu =
    open && menuPos && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[100] cursor-default bg-black/40"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div
              role="menu"
              className="fixed z-[110] max-h-[min(320px,calc(100vh-24px))] overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/98 py-2 shadow-xl backdrop-blur-md"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
                maxWidth: "calc(100vw - 16px)",
              }}
            >
              {canNativeShare && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void shareNative()}
                  className="flex w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-white/[0.06]"
                >
                  Share via…
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => void copyLink()}
                className="flex w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-white/[0.06]"
              >
                {copied ? "Copied link" : "Copy link"}
              </button>
              {social && (
                <>
                  <a
                    role="menuitem"
                    href={social.x}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-full px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.06]"
                    onClick={() => {
                      setOpen(false);
                      onShareSuccess?.();
                    }}
                  >
                    Post on X
                  </a>
                  <a
                    role="menuitem"
                    href={social.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-full px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.06]"
                    onClick={() => {
                      setOpen(false);
                      onShareSuccess?.();
                    }}
                  >
                    Share on LinkedIn
                  </a>
                  <a
                    role="menuitem"
                    href={social.facebook}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-full px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.06]"
                    onClick={() => {
                      setOpen(false);
                      onShareSuccess?.();
                    }}
                  >
                    Share on Facebook
                  </a>
                </>
              )}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          variant === "compact"
            ? "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-brand/40 hover:text-white"
            : "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:border-brand/40 hover:bg-white/[0.08]"
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <ShareIcon className="h-3.5 w-3.5 text-brand" aria-hidden />
        Share
      </button>

      {menu}
    </div>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" />
      <path d="M16 6l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v13" strokeLinecap="round" />
    </svg>
  );
}
