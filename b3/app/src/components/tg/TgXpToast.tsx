import { useEffect } from "react";

export function TgXpToast({
  message,
  onDone,
}: {
  message: string | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
      <div className="animate-bounce rounded-2xl border border-[#C5FF41]/40 bg-[#1a1f12] px-5 py-3 text-center shadow-lg">
        <p className="text-lg font-bold text-[#C5FF41]">{message}</p>
      </div>
    </div>
  );
}
