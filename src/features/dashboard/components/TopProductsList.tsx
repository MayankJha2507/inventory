import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import type { TopProduct } from "../useDashboardData";

export function TopProductsList({ data }: { data: TopProduct[] }) {
  const currency = useCurrency();
  const maxRevenue = Math.max(...data.map((t) => t.revenue), 1);

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No sales yet"
        description="Top sellers will appear here once you record sales."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((t, i) => (
        <li key={t.product.id} className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium">{t.product.name}</p>
              <p className="shrink-0 text-sm font-semibold tabular-nums">
                {formatCurrency(t.revenue, currency)}
              </p>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(t.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] text-subtle tabular-nums">
                {t.unitsSold} sold
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
