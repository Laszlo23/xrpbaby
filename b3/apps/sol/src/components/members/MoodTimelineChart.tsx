"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_LINE_META, type MoodTimelinePoint } from "@/lib/mood-data";

type MoodTimelineChartProps = {
  points: MoodTimelinePoint[];
  compact?: boolean;
};

type ChartRow = {
  day: string;
  energy: number | null;
  inner: number | null;
  momentum: number | null;
  energyEmoji: string | null;
  innerEmoji: string | null;
  momentumEmoji: string | null;
  energyLabel: string | null;
  innerLabel: string | null;
  momentumLabel: string | null;
};

function toChartData(points: MoodTimelinePoint[]): ChartRow[] {
  return points.map((p) => ({
    day: `D${p.programDay}`,
    energy: p.energyScore,
    inner: p.innerScore,
    momentum: p.momentumScore,
    energyEmoji: p.energyEmoji,
    innerEmoji: p.innerEmoji,
    momentumEmoji: p.momentumEmoji,
    energyLabel: p.energyLabel,
    innerLabel: p.innerLabel,
    momentumLabel: p.momentumLabel,
  }));
}

const chartConfig = {
  energy: { label: CHART_LINE_META.energy.label, color: CHART_LINE_META.energy.color },
  inner: { label: CHART_LINE_META.inner.label, color: CHART_LINE_META.inner.color },
  momentum: { label: CHART_LINE_META.momentum.label, color: CHART_LINE_META.momentum.color },
};

export function MoodTimelineChart({ points, compact = false }: MoodTimelineChartProps) {
  const data = toChartData(points);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center border border-border bg-surface text-sm text-muted-foreground ${compact ? "h-40" : "h-64"}`}
      >
        Log your first mood check-in to start your timeline.
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={compact ? "h-48 w-full" : "h-80 w-full"}
    >
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis
          domain={[1, 9]}
          ticks={[1, 3, 5, 7, 9]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          width={28}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => {
                const row = item.payload as ChartRow;
                const emoji =
                  name === "energy"
                    ? row.energyEmoji
                    : name === "inner"
                      ? row.innerEmoji
                      : row.momentumEmoji;
                const label =
                  name === "energy"
                    ? row.energyLabel
                    : name === "inner"
                      ? row.innerLabel
                      : row.momentumLabel;
                return (
                  <span className="flex items-center gap-2">
                    {emoji && <span>{emoji}</span>}
                    <span>
                      {label ?? name}: {value}
                    </span>
                  </span>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="energy"
          stroke="var(--color-energy)"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="inner"
          stroke="var(--color-inner)"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="momentum"
          stroke="var(--color-momentum)"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
