import {
  Banknote,
  Boxes,
  Package,
  PiggyBank,
  Receipt,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import { useDashboardData } from "./useDashboardData";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard } from "@/components/ChartCard";
import { RevenueTrendChart } from "./components/RevenueTrendChart";
import { CategoryValueChart } from "./components/CategoryValueChart";
import { DistributionDonut } from "./components/DistributionDonut";
import { TopProductsList } from "./components/TopProductsList";
import { RecentChangesList } from "./components/RecentChangesList";
import { LowStockList } from "./components/LowStockList";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const currency = useCurrency();
  const { data, isLoading, isError } = useDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live overview of your crochet business — updates automatically with your inventory."
      />

      {isLoading || !data ? (
        isError ? (
          <ErrorState />
        ) : (
          <DashboardSkeleton />
        )
      ) : (
        <div className="flex flex-col gap-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              index={0}
              title="Total Revenue"
              value={formatCurrency(data.totalRevenue, currency)}
              icon={Banknote}
              tone="positive"
              sub="All-time sales"
              info={
                <>
                  Total money earned from all recorded sales.
                  <br />
                  <span className="font-semibold">
                    Revenue = Σ units sold × selling price
                  </span>
                  <br />
                  Every time stock goes down as a sale, that sale is logged at
                  the product&apos;s selling price at the time.
                </>
              }
            />
            <KpiCard
              index={1}
              title="Gross Profit"
              value={formatCurrency(data.grossProfit, currency)}
              icon={TrendingUp}
              tone="positive"
              sub="Revenue − cost of goods"
              info={
                <>
                  What you make on sales before expenses.
                  <br />
                  <span className="font-semibold">
                    Gross Profit = Revenue − Cost of Goods Sold
                  </span>
                  <br />
                  where COGS = units sold × cost price. Example: sell 2 items
                  at ₹100 that cost ₹70 to make → (2×100) − (2×70) = ₹60.
                </>
              }
            />
            <KpiCard
              index={2}
              title="Net Profit"
              value={formatCurrency(data.netProfit, currency)}
              icon={PiggyBank}
              tone={data.netProfit >= 0 ? "positive" : "negative"}
              sub="After expenses"
              info={
                <>
                  What your business actually keeps.
                  <br />
                  <span className="font-semibold">
                    Net Profit = Gross Profit − Total Expenses
                  </span>
                  <br />
                  Expenses include yarn, packaging, fees — everything on the
                  Expenses page.
                </>
              }
            />
            <KpiCard
              index={3}
              title="Inventory Value"
              value={formatCurrency(data.inventoryValue, currency)}
              icon={Wallet}
              sub="At cost price"
            />
            <KpiCard
              index={4}
              title="Total Products"
              value={formatNumber(data.totalProducts)}
              icon={Package}
            />
            <KpiCard
              index={5}
              title="Total Stock Units"
              value={formatNumber(data.totalStockUnits)}
              icon={Boxes}
            />
            <KpiCard
              index={6}
              title="Low Stock Items"
              value={formatNumber(data.lowStockCount)}
              icon={TriangleAlert}
              tone={data.lowStockCount > 0 ? "warning" : "default"}
              sub={data.lowStockCount > 0 ? "Needs attention" : "All healthy"}
              info={
                <>
                  Products that need restocking soon: anything at or below its
                  minimum stock level, including items that are fully out of
                  stock. Set each product&apos;s minimum in the Inventory
                  table&apos;s “Min” column.
                </>
              }
            />
            <KpiCard
              index={7}
              title="Total Expenses"
              value={formatCurrency(data.totalExpenses, currency)}
              icon={Receipt}
              tone="negative"
            />
          </div>

          {/* Trend + category value */}
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Revenue Trend"
              description="Monthly revenue and gross profit, last 12 months"
              className="lg:col-span-2"
              delay={0.05}
            >
              <RevenueTrendChart data={data.revenueTrend} />
            </ChartCard>
            <ChartCard
              title="Inventory Value by Category"
              description="Cost value of stock on hand"
              delay={0.1}
            >
              <CategoryValueChart data={data.valueByCategory} />
            </ChartCard>
          </div>

          {/* Distribution, top sellers, expenses */}
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Product Distribution"
              description="Products per category"
              delay={0.12}
            >
              <DistributionDonut
                data={data.productDistribution}
                format={(v) => `${v}`}
                centerValue={formatNumber(data.totalProducts)}
                centerLabel="products"
              />
            </ChartCard>
            <ChartCard
              title="Top Selling Products"
              description="By all-time revenue"
              delay={0.16}
            >
              <TopProductsList data={data.topProducts} />
            </ChartCard>
            <ChartCard
              title="Expenses Breakdown"
              description="Where the money goes"
              delay={0.2}
            >
              <DistributionDonut
                data={data.expensesByCategory}
                format={(v) => formatCurrency(v, currency)}
                centerValue={formatCurrency(data.totalExpenses, currency)}
                centerLabel="total"
              />
            </ChartCard>
          </div>

          {/* Activity + low stock */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Recent Inventory Changes"
              description="Latest sales, restocks and adjustments"
              delay={0.24}
            >
              <RecentChangesList data={data.recentChanges} />
            </ChartCard>
            <ChartCard
              title="Low Stock Products"
              description="At or below their minimum level"
              delay={0.28}
            >
              <LowStockList data={data.lowStockProducts} />
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
}
