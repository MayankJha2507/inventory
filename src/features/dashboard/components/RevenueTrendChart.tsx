import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_STYLE, ChartTooltip, GRID_STROKE } from "@/components/charts";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import type { MonthPoint } from "../useDashboardData";

export function RevenueTrendChart({ data }: { data: MonthPoint[] }) {
  const currency = useCurrency();
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => formatCompactCurrency(v, currency)}
          />
          <Tooltip
            content={
              <ChartTooltip format={(v) => formatCurrency(v, currency)} />
            }
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#revFill)"
            animationDuration={700}
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Gross profit"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#profitFill)"
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
