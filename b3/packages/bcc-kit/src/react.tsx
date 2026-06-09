/**
 * Self-contained "Buy BCC" modal + button for any React-DOM app.
 *
 * Uses inline styles only (no Tailwind/shadcn dependency) so it can be dropped
 * into apps with different styling systems. Button-only trigger (no auto-popup).
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  BCC_ADDRESS,
  BCC_DISCOUNT_LABEL,
  BCC_SYMBOL,
  BCC_UNISWAP_URL,
  buildJumperSolToBccUrl,
  buildSolanaToBccRoutes,
} from "./index.js";

const ACCENT = "#C5FF41";
const ACCENT_2 = "#00E5FF";

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.78)",
  backdropFilter: "blur(4px)",
  padding: 16,
};

const cardStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 420,
  borderRadius: 24,
  border: "1px solid rgba(197,255,65,0.35)",
  background: "linear-gradient(160deg, rgba(20,22,16,0.98), rgba(10,12,16,0.98))",
  color: "#f4f4f5",
  padding: 24,
  boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
};

export type BuyBccModalProps = {
  open: boolean;
  onClose: () => void;
  /** Optional extra copy line (e.g. context about the discount on this surface). */
  note?: ReactNode;
  /**
   * When set (e.g. `https://app.example.com/swap`), the On Base tab links to the
   * main app's in-app Uniswap swap instead of only external Uniswap.
   */
  swapAppUrl?: string;
};

/** Controlled modal: render it and drive `open`/`onClose` yourself. */
export function BuyBccModal({ open, onClose, note, swapAppUrl }: BuyBccModalProps) {
  const [tab, setTab] = useState<"base" | "solana">("base");
  const solanaRoutes = buildSolanaToBccRoutes();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-label={`Buy ${BCC_SYMBOL}`}
      onClick={onClose}
    >
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.08)",
            color: "#d4d4d8",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: "28px",
          }}
        >
          ×
        </button>

        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: ACCENT,
          }}
        >
          Building Culture
        </div>
        <h2 style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800 }}>
          Get {BCC_SYMBOL}
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#a1a1aa", lineHeight: 1.5 }}>
          {BCC_SYMBOL} is our market token on Base, currently in fair launch. Pay with{" "}
          {BCC_SYMBOL} to get <strong style={{ color: ACCENT }}>{BCC_DISCOUNT_LABEL}</strong> on
          identity mints, art tickets, and Places.
        </p>
        {note ? (
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#c4f0ff" }}>{note}</p>
        ) : null}

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {(["base", "solana"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                borderRadius: 9999,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                border: tab === id ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.12)",
                background: tab === id ? "rgba(197,255,65,0.12)" : "rgba(0,0,0,0.35)",
                color: tab === id ? ACCENT : "#a1a1aa",
                cursor: "pointer",
              }}
            >
              {id === "base" ? "On Base" : "From Solana"}
            </button>
          ))}
        </div>

        {tab === "base" ? (
          <div style={{ marginTop: 16 }}>
            {swapAppUrl ? (
              <a
                href={swapAppUrl}
                style={{
                  display: "block",
                  textAlign: "center",
                  borderRadius: 9999,
                  padding: "13px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0a0a0a",
                  textDecoration: "none",
                  background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
                }}
              >
                Swap for {BCC_SYMBOL} in-app →
              </a>
            ) : null}
            <a
              href={BCC_UNISWAP_URL}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: "block",
                marginTop: swapAppUrl ? 10 : 0,
                textAlign: "center",
                borderRadius: 9999,
                padding: "13px 20px",
                fontSize: 14,
                fontWeight: 700,
                color: swapAppUrl ? ACCENT : "#0a0a0a",
                textDecoration: "none",
                background: swapAppUrl
                  ? "rgba(0,0,0,0.35)"
                  : `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
                border: swapAppUrl ? `1px solid ${ACCENT}55` : "none",
              }}
            >
              {swapAppUrl ? "Open Uniswap instead →" : `Buy ${BCC_SYMBOL} on Uniswap →`}
            </a>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>
              Bridge or swap from Solana to {BCC_SYMBOL} on Base (Phantom, etc.).
            </p>
            <a
              href={buildJumperSolToBccUrl("SOL")}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: "block",
                textAlign: "center",
                borderRadius: 9999,
                padding: "13px 20px",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
                background: "linear-gradient(90deg, #9945FF, #00E5FF)",
              }}
            >
              Jumper: SOL → {BCC_SYMBOL} →
            </a>
            <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", fontSize: 12 }}>
              {solanaRoutes.slice(1, 4).map((r) => (
                <li key={r.id} style={{ marginTop: 8 }}>
                  <a href={r.primaryHref} target="_blank" rel="noreferrer noopener" style={{ color: ACCENT }}>
                    {r.label}
                  </a>
                  <span style={{ color: "#71717a" }}> — {r.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            fontSize: 12,
            color: "#71717a",
          }}
        >
          <span>Base · {BCC_SYMBOL}</span>
          <CopyAddress />
        </div>
      </div>
    </div>
  );
}

function CopyAddress() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(BCC_ADDRESS).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      style={{
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(0,0,0,0.3)",
        color: "#d4d4d8",
        borderRadius: 9999,
        padding: "4px 10px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        cursor: "pointer",
      }}
      aria-label="Copy BCC contract address"
    >
      {copied ? "Copied!" : shortAddress(BCC_ADDRESS)}
    </button>
  );
}

export type BuyBccButtonProps = {
  /** "floating" pins a pill bottom-right; "inline" renders a normal button. */
  variant?: "floating" | "inline";
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/** Drop-in button that opens the BuyBccModal. Button-only trigger. */
export function BuyBccButton({
  variant = "floating",
  label = `Buy ${BCC_SYMBOL}`,
  className,
  style,
}: BuyBccButtonProps) {
  const [open, setOpen] = useState(false);

  const floatingStyle: CSSProperties = {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 2147482000,
    borderRadius: 9999,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: "#0a0a0a",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
  };

  const inlineStyle: CSSProperties = {
    borderRadius: 9999,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: "#0a0a0a",
    border: "none",
    cursor: "pointer",
    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
  };

  return (
    <>
      <button
        type="button"
        className={className}
        style={{ ...(variant === "floating" ? floatingStyle : inlineStyle), ...style }}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <BuyBccModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
