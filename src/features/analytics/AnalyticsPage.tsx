import { useState } from "react";
import { Banknote, Boxes, Tag, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard } from "@/components/ChartCard";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import { TopProductsList } from "@/features/dashboard/components/TopProductsList";
import { useAnalyticsData, type RangeKey } from "./useAnalyticsData";
import { RangePicker } from "./components/RangePicker";
import {
  CategoryPerformanceChart,
  InventoryGrowthChart,
  LowStockTrendChart,
  RevenueProfitChart,
} from "./components/AnalyticsCharts";
import { useProducts } from "@/features/inventory/hooks";

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("30d");
  const currency = useCurrency();
  const { data, isLoading, isError } = useAnalyticsData(range);
  const products = useProducts();

  const topProductsForList =
    data && products.data
      ? data.topProducts
          .map((t) => {
            const product = products.data.find((p) => p.name === t.name);
            return product
              ? { product, unitsSold: t.unitsSold, revenue: t.revenue }
              : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)
      : [];

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Trends and performance across your business."
        actions={<RangePicker value={range} onChange={setRange} />}
      />

      {isError ? (
        <ErrorState />
      ) : isLoading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <div className="flex flex-col gap-6" key={range}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              index={0}
              title="Revenue"
              value={formatCurrency(data.revenue, currency)}
              icon={Banknote}
              tone="positive"
            />
            <KpiCard
              index={1}
              title="Profit"
              value={formatCurrency(data.profit, currency)}
              icon={TrendingUp}
              tone={data.profit >= 0 ? "positive" : "negative"}
            />
            <KpiCard
              index={2}
              title="Units Sold"
              value={formatNumber(data.unitsSold)}
              icon={Boxes}
            />
            <KpiCard
              index={3}
              title="Avg Selling Price"
              value={formatCurrency(data.avgSellingPrice, currency)}
              icon={Tag}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Revenue & Profit"
              description="Over the selected period"
              className="lg:col-span-2"
              delay={0.05}
            >
              <RevenueProfitChart data={data.series} />
            </ChartCard>
            <ChartCard
              title="Category Performance"
              description="Revenue by category"
              delay={0.1}
            >
              <CategoryPerformanceChart data={data.categoryPerformance} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Inventory Growth"
              description="Total stock units over time"
              delay={0.14}
            >
              <InventoryGrowthChart data={data.series} />
            </ChartCard>
            <ChartCard
              title="Low Stock Trend"
              description="Products at or below minimum"
              delay={0.18}
            >
              <LowStockTrendChart data={data.series} />
            </ChartCard>
            <ChartCard
              title="Top Products"
              description="Best sellers in this period"
              delay={0.22}
            >
              <TopProductsList data={topProductsForList} />
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
}
