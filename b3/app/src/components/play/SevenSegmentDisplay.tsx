/** Seven-segment style digit for culture well countdown. */

const SEGMENTS: Record<number, number[]> = {
  0: [1, 1, 1, 1, 1, 1, 0],
  1: [0, 1, 1, 0, 0, 0, 0],
  2: [1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 1, 0, 0, 1],
  4: [0, 1, 1, 0, 0, 1, 1],
  5: [1, 0, 1, 1, 0, 1, 1],
  6: [1, 0, 1, 1, 1, 1, 1],
  7: [1, 1, 1, 0, 0, 0, 0],
  8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1],
};

function Digit({ value, active }: { value: number; active: boolean }) {
  const segs = SEGMENTS[value] ?? SEGMENTS[8]!;
  const on = active ? "bg-[#C5FF41] shadow-[0_0_12px_rgb(197_255_65/0.8)]" : "bg-[#C5FF41]/15";

  return (
    <div className="relative h-24 w-14 sm:h-28 sm:w-16" aria-hidden>
      <div
        className={`absolute left-1 right-1 top-0 h-2 rounded-sm ${segs[0] ? on : "bg-zinc-800/80"}`}
      />
      <div
        className={`absolute left-0 top-1 h-[calc(50%-6px)] w-2 rounded-sm ${segs[1] ? on : "bg-zinc-800/80"}`}
      />
      <div
        className={`absolute right-0 top-1 h-[calc(50%-6px)] w-2 rounded-sm ${segs[2] ? on : "bg-zinc-800/80"}`}
      />
      <div
        className={`absolute left-1 right-1 top-1/2 h-2 -translate-y-1/2 rounded-sm ${segs[3] ? on : "bg-zinc-800/80"}`}
      />
      <div
        className={`absolute bottom-1 left-0 h-[calc(50%-6px)] w-2 rounded-sm ${segs[4] ? on : "bg-zinc-800/80"}`}
      />
      <div
        className={`absolute bottom-1 right-0 h-[calc(50%-6px)] w-2 rounded-sm ${segs[5] ? on : "bg-zinc-800/80"}`}
      />
      <div
        className={`absolute bottom-0 left-1 right-1 h-2 rounded-sm ${segs[6] ? on : "bg-zinc-800/80"}`}
      />
    </div>
  );
}

type Props = {
  value: number;
  className?: string;
};

export function SevenSegmentDisplay({ value, className = "" }: Props) {
  const clamped = Math.max(0, Math.min(33, Math.floor(value)));
  const tens = Math.floor(clamped / 10);
  const ones = clamped % 10;
  const showTens = clamped >= 10;

  return (
    <div
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C5FF41]/25 bg-black/60 px-4 py-3 ${className}`}
      aria-label={`Countdown ${clamped}`}
    >
      {showTens ? <Digit value={tens} active /> : null}
      <Digit value={ones} active />
    </div>
  );
}
