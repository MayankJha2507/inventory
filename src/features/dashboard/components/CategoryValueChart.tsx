import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_STYLE, ChartTooltip, GRID_STROKE } from "@/components/charts";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import type { NamedValue } from "../useDashboardData";

export function CategoryValueChart({ data }: { data: NamedValue[] }) {
  const currency = useCurrency();
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCompactCurrency(v, currency)}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={104}
          />
          <Tooltip
            content={<ChartTooltip format={(v) => formatCurrency(v, currency)} />}
            cursor={{ fill: "#f1f5f9" }}
          />
          <Bar
            dataKey="value"
            name="Inventory value"
            radius={[0, 6, 6, 0]}
            barSize={18}
            animationDuration={700}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color ?? "#10b981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
