import { useMemo, useState } from "react";
import { Calendar, Plus, Receipt, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { KpiCard } from "@/components/KpiCard";
import { formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import { useExpenses } from "./hooks";
import { ExpensesTable } from "./components/ExpensesTable";
import { AddExpenseDialog } from "./components/AddExpenseDialog";

export function ExpensesPage() {
  const currency = useCurrency();
  const expenses = useExpenses();
  const [addOpen, setAddOpen] = useState(false);

  const stats = useMemo(() => {
    const data = expenses.data ?? [];
    const total = data.reduce((sum, e) => sum + e.amount, 0);
    const thisMonthKey = new Date().toISOString().slice(0, 7);
    const thisMonth = data
      .filter((e) => e.date.startsWith(thisMonthKey))
      .reduce((sum, e) => sum + e.amount, 0);
    const months = new Set(data.map((e) => e.date.slice(0, 7))).size || 1;
    return { total, thisMonth, avgPerMonth: total / months };
  }, [expenses.data]);

  const categorySuggestions = useMemo(
    () => [...new Set((expenses.data ?? []).map((e) => e.category))].sort(),
    [expenses.data],
  );

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track costs to see your true profit — the dashboard updates automatically."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Add expense
          </Button>
        }
      />

      {expenses.isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[104px] rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[480px] rounded-2xl" />
        </div>
      ) : expenses.isError ? (
        <ErrorState onRetry={() => expenses.refetch()} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              index={0}
              title="Total Expenses"
              value={formatCurrency(stats.total, currency)}
              icon={Receipt}
              tone="negative"
              sub="All time"
            />
            <KpiCard
              index={1}
              title="This Month"
              value={formatCurrency(stats.thisMonth, currency)}
              icon={Calendar}
            />
            <KpiCard
              index={2}
              title="Average / Month"
              value={formatCurrency(stats.avgPerMonth, currency)}
              icon={TrendingDown}
            />
          </div>
          <ExpensesTable expenses={expenses.data ?? []} />
        </div>
      )}

      <AddExpenseDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categorySuggestions={categorySuggestions}
      />
    </>
  );
}
