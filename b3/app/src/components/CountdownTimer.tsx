import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
  /** Larger glowing digits for drop cards */
  variant?: "default" | "vault";
}

export function CountdownTimer({
  targetDate,
  className = "",
  variant = "default",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const vault = variant === "vault";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
      {(["days", "hours", "minutes", "seconds"] as const).map((unit, i) => (
        <div key={unit} className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`rounded-xl px-2 py-1.5 text-center min-w-[42px] ring-1 ring-inset sm:min-w-[48px] sm:px-2.5 sm:py-2 ${
              vault
                ? "border border-[rgb(212_175_55/0.35)] bg-black/55 shadow-[0_0_24px_-8px_rgb(212_175_55/35%)]"
                : "glass"
            }`}
          >
            <span
              className={`font-heading tabular-nums ${
                vault
                  ? "text-xl font-bold text-[var(--vault-gold)] sm:text-2xl"
                  : "text-lg font-bold text-neon text-glow-neon"
              }`}
            >
              {String(timeLeft[unit]).padStart(2, "0")}
            </span>
            <p className="mt-0.5 text-[7px] uppercase tracking-widest text-muted-foreground sm:text-[8px]">
              {unit.slice(0, 3)}
            </p>
          </div>
          {i < 3 && (
            <span
              className={`text-sm ${vault ? "text-[rgb(212_175_55/0.55)]" : "text-muted-foreground"} animate-pulse-glow`}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function getTimeLeft(targetDate: Date) {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
