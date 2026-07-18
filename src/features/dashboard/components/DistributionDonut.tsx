import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_PALETTE, ChartTooltip } from "@/components/charts";
import type { NamedValue } from "../useDashboardData";

interface DistributionDonutProps {
  data: NamedValue[];
  /** Formats values in tooltip and legend (e.g. currency or unit count). */
  format: (value: number) => string;
  centerLabel?: string;
  centerValue?: string;
}

export function DistributionDonut({
  data,
  format,
  centerLabel,
  centerValue,
}: DistributionDonutProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip format={format} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
              animationDuration={700}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerValue && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold tabular-nums">{centerValue}</span>
            {centerLabel && (
              <span className="text-[10px] text-muted-foreground">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      <ul className="flex w-full flex-col gap-2">
        {data.map((entry, i) => (
          <li key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  entry.color ?? CHART_PALETTE[i % CHART_PALETTE.length],
              }}
            />
            <span className="truncate text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {format(entry.value)}
            </span>
            <span className="w-9 text-right text-subtle tabular-nums">
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
