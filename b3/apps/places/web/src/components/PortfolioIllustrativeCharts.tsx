"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  totalUsdEst: number;
};

export function PortfolioIllustrativeCharts({ totalUsdEst }: Props) {
  const data = useMemo(() => {
    const base = Math.max(totalUsdEst, 500);
    return Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      const drift = 0.88 + t * 0.14 + Math.sin(i * 0.7) * 0.04;
      return {
        label: `${i + 1}m`,
        value: Math.round(base * drift),
        yield: Math.round(base * 0.02 * (0.9 + t * 0.1)),
      };
    });
  }, [totalUsdEst]);

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-amber-200/80">
        Charts use <strong className="text-amber-100">reference</strong> series — not historical performance or indexer
        data.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs font-medium text-white">Portfolio value (ref.)</p>
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis dataKey="label" stroke="#52525b" fontSize={10} />
                <YAxis stroke="#52525b" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#9ca3af" }}
                />
                <Area type="monotone" dataKey="value" stroke="#C9A24A" fill="rgba(201,162,74,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs font-medium text-white">Yield earned (ref.)</p>
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis dataKey="label" stroke="#52525b" fontSize={10} />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="yield" stroke="#a3a3a3" fill="rgba(163,163,163,0.12)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
