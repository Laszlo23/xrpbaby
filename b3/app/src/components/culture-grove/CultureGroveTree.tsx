import { motion } from "framer-motion";

import { dnaGlow, dnaGradient } from "@/lib/culture-grove/dna";
import type { GroveTreeNode } from "@/lib/culture-grove/types";

type BubbleSize = "lg" | "md" | "sm" | "xs";

function GroveBubble({
  node,
  size,
  pulse,
}: {
  node: GroveTreeNode;
  size: BubbleSize;
  pulse?: boolean;
}) {
  const dim =
    size === "lg"
      ? "h-24 w-24 text-[11px]"
      : size === "md"
        ? "h-16 w-16 text-[10px]"
        : size === "sm"
          ? "h-12 w-12 text-[9px]"
          : "h-9 w-9 text-[8px]";
  const empty = node.isEmptySlot;

  return (
    <motion.div
      className={`relative flex shrink-0 flex-col items-center justify-center rounded-full border text-center font-medium ${dim} ${
        empty
          ? "border-dashed border-zinc-600 bg-zinc-900/40 text-zinc-500"
          : "border-white/20 text-white"
      } ${node.isYou ? "ring-2 ring-[#C5FF41]/50" : ""}`}
      style={
        empty
          ? undefined
          : {
              background: dnaGradient(node.hue, node.isYou ? 0.7 : 0.5),
              boxShadow: pulse ? dnaGlow(node.hue) : undefined,
            }
      }
      animate={pulse ? { scale: [1, 1.06, 1] } : undefined}
      transition={pulse ? { repeat: Infinity, duration: 2.2 } : undefined}
      title={node.label}
    >
      <span className="max-w-[90%] truncate px-1 leading-tight">{empty ? "+" : node.label}</span>
      {!empty ? (
        <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider opacity-70">
          {node.forestStage}
        </span>
      ) : null}
    </motion.div>
  );
}

function depthSize(depth: number): BubbleSize {
  if (depth === 0) return "lg";
  if (depth === 1) return "md";
  if (depth === 2) return "sm";
  return "xs";
}

function TreeBranch({
  node,
  depth,
  pulse,
}: {
  node: GroveTreeNode;
  depth: number;
  pulse?: boolean;
}) {
  const size = depthSize(depth);
  const childDepth = depth + 1;

  return (
    <div className="flex flex-col items-center gap-2">
      <GroveBubble node={node} size={size} pulse={pulse && !node.isEmptySlot} />
      {node.children.length > 0 ? (
        <div
          className={`flex flex-wrap justify-center gap-2 border-t border-white/10 pt-2 ${
            childDepth >= 3 ? "max-w-full overflow-x-auto" : ""
          }`}
        >
          {node.children.map((child) => (
            <TreeBranch key={child.id} node={child} depth={childDepth} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CultureGroveTree({
  root,
  twinBloomUnlocked,
}: {
  root: GroveTreeNode;
  twinBloomUnlocked: boolean;
}) {
  const directs = root.children.slice(0, 2);

  return (
    <div className="relative mx-auto max-w-2xl py-4">
      <div className="flex flex-col items-center gap-6">
        <GroveBubble node={root} size="lg" pulse={twinBloomUnlocked} />
        <div className="h-8 w-px bg-gradient-to-b from-[#C5FF41]/40 to-transparent" aria-hidden />
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {directs.map((child, i) => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={1}
              pulse={twinBloomUnlocked && i === 0}
            />
          ))}
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        Culture DNA · redacted connections · depth 3
      </p>
    </div>
  );
}
