import { useMemo } from "react";
import type { Category, Expense, HistoryEntry, Product } from "@/types";
import { getInventoryValue, getStockStatus } from "@/lib/inventory";
import { useCategories, useHistory, useProducts } from "@/features/inventory/hooks";
import { useExpenses } from "@/features/expenses/hooks";

export interface MonthPoint {
  label: string;
  revenue: number;
  profit: number;
}

export interface NamedValue {
  name: string;
  value: number;
  color?: string;
}

export interface TopProduct {
  product: Product;
  unitsSold: number;
  revenue: number;
}

export interface DashboardData {
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  inventoryValue: number;
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  totalExpenses: number;
  revenueTrend: MonthPoint[];
  valueByCategory: NamedValue[];
  productDistribution: NamedValue[];
  topProducts: TopProduct[];
  expensesByCategory: NamedValue[];
  recentChanges: Array<HistoryEntry & { productName: string }>;
  lowStockProducts: Product[];
}

export function computeDashboard(
  products: Product[],
  categories: Category[],
  expenses: Expense[],
  history: HistoryEntry[],
): DashboardData {
  const sales = history.filter((h) => h.type === "sale");

  const totalRevenue = sales.reduce(
    (sum, s) => sum + Math.abs(s.quantity_change) * s.unit_price,
    0,
  );
  const totalCogs = sales.reduce(
    (sum, s) => sum + Math.abs(s.quantity_change) * s.unit_cost,
    0,
  );
  const grossProfit = totalRevenue - totalCogs;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const inventoryValue = products.reduce((sum, p) => sum + getInventoryValue(p), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.current_stock, 0);
  const lowStockProducts = products
    .filter((p) => getStockStatus(p) !== "healthy")
    .sort((a, b) => a.current_stock - b.current_stock);

  // Last 12 calendar months of revenue & gross profit.
  const months: MonthPoint[] = [];
  const bucket = new Map<string, MonthPoint>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point: MonthPoint = {
      label: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
      profit: 0,
    };
    bucket.set(key, point);
    months.push(point);
  }
  for (const s of sales) {
    const key = s.created_at.slice(0, 7);
    const point = bucket.get(key);
    if (!point) continue;
    const qty = Math.abs(s.quantity_change);
    point.revenue += qty * s.unit_price;
    point.profit += qty * (s.unit_price - s.unit_cost);
  }
  for (const p of months) {
    p.revenue = Math.round(p.revenue);
    p.profit = Math.round(p.profit);
  }

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const catColor = (id: string | null) =>
    categories.find((c) => c.id === id)?.color ?? "#94a3b8";

  const groupBy = (
    items: Product[],
    value: (p: Product) => number,
  ): NamedValue[] => {
    const map = new Map<string, NamedValue>();
    for (const p of items) {
      const name = catName(p.category_id);
      const entry = map.get(name) ?? {
        name,
        value: 0,
        color: catColor(p.category_id),
      };
      entry.value += value(p);
      map.set(name, entry);
    }
    return [...map.values()].sort((a, b) => b.value - a.value);
  };

  const valueByCategory = groupBy(products, (p) => getInventoryValue(p)).map(
    (e) => ({ ...e, value: Math.round(e.value) }),
  );
  const productDistribution = groupBy(products, () => 1);

  const salesByProduct = new Map<string, { unitsSold: number; revenue: number }>();
  for (const s of sales) {
    const qty = Math.abs(s.quantity_change);
    const entry = salesByProduct.get(s.product_id) ?? { unitsSold: 0, revenue: 0 };
    entry.unitsSold += qty;
    entry.revenue += qty * s.unit_price;
    salesByProduct.set(s.product_id, entry);
  }
  const topProducts: TopProduct[] = products
    .map((product) => ({
      product,
      unitsSold: salesByProduct.get(product.id)?.unitsSold ?? 0,
      revenue: salesByProduct.get(product.id)?.revenue ?? 0,
    }))
    .filter((t) => t.unitsSold > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const expenseMap = new Map<string, number>();
  for (const e of expenses) {
    expenseMap.set(e.category, (expenseMap.get(e.category) ?? 0) + e.amount);
  }
  const EXPENSE_COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#f43f5e", "#64748b"];
  const expensesByCategory = [...expenseMap.entries()]
    .map(([name, value], i) => ({
      name,
      value: Math.round(value),
      color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? "Deleted product";
  const recentChanges = history.slice(0, 8).map((h) => ({
    ...h,
    productName: productName(h.product_id),
  }));

  return {
    totalRevenue,
    grossProfit,
    netProfit,
    inventoryValue,
    totalProducts: products.length,
    totalStockUnits,
    lowStockCount: lowStockProducts.length,
    totalExpenses,
    revenueTrend: months,
    valueByCategory,
    productDistribution,
    topProducts,
    expensesByCategory,
    recentChanges,
    lowStockProducts,
  };
}

export function useDashboardData() {
  const products = useProducts();
  const categories = useCategories();
  const expenses = useExpenses();
  const history = useHistory();

  const isLoading =
    products.isLoading || categories.isLoading || expenses.isLoading || history.isLoading;
  const isError =
    products.isError || categories.isError || expenses.isError || history.isError;

  const data = useMemo(() => {
    if (!products.data || !categories.data || !expenses.data || !history.data) {
      return null;
    }
    return computeDashboard(
      products.data,
      categories.data,
      expenses.data,
      history.data,
    );
  }, [products.data, categories.data, expenses.data, history.data]);

  return { data, isLoading, isError };
}
