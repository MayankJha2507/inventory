import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_STYLE,
  ChartTooltip,
  CURSOR_FILL,
  CURSOR_LINE,
  GRID_STROKE,
} from "@/components/charts";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import type { CategoryPerf, TimePoint } from "../useAnalyticsData";

export function RevenueProfitChart({ data }: { data: TimePoint[] }) {
  const currency = useCurrency();
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            dy={6}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => formatCompactCurrency(v, currency)}
          />
          <Tooltip
            content={<ChartTooltip format={(v) => formatCurrency(v, currency)} />}
            cursor={CURSOR_LINE}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#aRev)"
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="transparent"
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InventoryGrowthChart({ data }: { data: TimePoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="aStock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            dy={6}
            minTickGap={24}
          />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            content={<ChartTooltip format={(v) => `${v} units`} />}
            cursor={CURSOR_LINE}
          />
          <Area
            type="monotone"
            dataKey="stockUnits"
            name="Stock units"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#aStock)"
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LowStockTrendChart({ data }: { data: TimePoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            dy={6}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={36}
            allowDecimals={false}
          />
          <Tooltip
            content={<ChartTooltip format={(v) => `${v} products`} />}
            cursor={CURSOR_LINE}
          />
          <Line
            type="stepAfter"
            dataKey="lowStock"
            name="Low stock items"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPerformanceChart({ data }: { data: CategoryPerf[] }) {
  const currency = useCurrency();
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="name"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            dy={6}
            interval={0}
            tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)}
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => formatCompactCurrency(v, currency)}
          />
          <Tooltip
            content={<ChartTooltip format={(v) => formatCurrency(v, currency)} />}
            cursor={CURSOR_FILL}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            radius={[6, 6, 0, 0]}
            barSize={36}
            animationDuration={600}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
