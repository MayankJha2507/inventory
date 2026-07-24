export const CHART_PALETTE = [
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#64748b",
];

export const AXIS_STYLE = {
  fontSize: 11,
  fill: "var(--color-muted-foreground)",
} as const;

export const GRID_STROKE = "var(--chart-grid)";

/** Recharts cursor styles that adapt to the active theme. */
export const CURSOR_LINE = {
  stroke: "var(--chart-cursor)",
  strokeDasharray: "3 3",
} as const;
export const CURSOR_FILL = { fill: "var(--chart-cursor-fill)" } as const;

interface TooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: { fill?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  format?: (value: number) => string;
}

/** Consistent card-styled tooltip for all Recharts charts. */
export function ChartTooltip({ active, payload, label, format }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 shadow-pop">
      {label !== undefined && (
        <p className="mb-1 text-[11px] font-medium text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey ?? entry.name)}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
            />
            <span className="capitalize text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums">
              {format ? format(Number(entry.value)) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
