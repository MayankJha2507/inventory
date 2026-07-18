import { useMemo } from "react";
import type { Category, HistoryEntry, Product } from "@/types";
import { getInventoryValue } from "@/lib/inventory";
import {
  useCategories,
  useHistory,
  useProducts,
} from "@/features/inventory/hooks";

export type RangeKey = "today" | "7d" | "30d" | "3m" | "1y";

export const RANGES: Array<{ key: RangeKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "3m", label: "3 Months" },
  { key: "1y", label: "1 Year" },
];

interface Bucket {
  label: string;
  start: number;
  end: number;
}

export interface TimePoint {
  label: string;
  revenue: number;
  profit: number;
  stockUnits: number;
  lowStock: number;
}

export interface CategoryPerf {
  name: string;
  color: string;
  revenue: number;
  unitsSold: number;
}

export interface AnalyticsData {
  revenue: number;
  profit: number;
  unitsSold: number;
  avgSellingPrice: number;
  inventoryValue: number;
  series: TimePoint[];
  categoryPerformance: CategoryPerf[];
  topProducts: Array<{ name: string; revenue: number; unitsSold: number }>;
}

function buildBuckets(range: RangeKey): Bucket[] {
  const now = new Date();
  const buckets: Bucket[] = [];

  if (range === "today") {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    for (let h = 0; h <= now.getHours(); h += 3) {
      const start = new Date(dayStart);
      start.setHours(h);
      const end = new Date(dayStart);
      end.setHours(h + 3);
      buckets.push({
        label: start.toLocaleTimeString("en-US", { hour: "numeric" }),
        start: start.getTime(),
        end: Math.min(end.getTime(), Date.now()),
      });
    }
    return buckets;
  }

  const config: Record<Exclude<RangeKey, "today">, { count: number; stepDays: number; label: (d: Date) => string }> = {
    "7d": { count: 7, stepDays: 1, label: (d) => d.toLocaleDateString("en-US", { weekday: "short" }) },
    "30d": { count: 30, stepDays: 1, label: (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
    "3m": { count: 13, stepDays: 7, label: (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
    "1y": { count: 12, stepDays: 30, label: (d) => d.toLocaleDateString("en-US", { month: "short" }) },
  };
  const { count, stepDays, label } = config[range];

  for (let i = count - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - i * stepDays);
    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (stepDays - 1));
    buckets.push({
      label: label(start),
      start: start.getTime(),
      end: end.getTime(),
    });
  }
  return buckets;
}

export function computeAnalytics(
  range: RangeKey,
  products: Product[],
  categories: Category[],
  history: HistoryEntry[],
): AnalyticsData {
  const buckets = buildBuckets(range);
  const rangeStart = buckets[0]?.start ?? 0;

  const inRange = (h: HistoryEntry) => new Date(h.created_at).getTime() >= rangeStart;
  const sales = history.filter((h) => h.type === "sale" && inRange(h));

  const revenue = sales.reduce((s, h) => s + Math.abs(h.quantity_change) * h.unit_price, 0);
  const cogs = sales.reduce((s, h) => s + Math.abs(h.quantity_change) * h.unit_cost, 0);
  const unitsSold = sales.reduce((s, h) => s + Math.abs(h.quantity_change), 0);
  const profit = revenue - cogs;
  const avgSellingPrice = unitsSold > 0 ? revenue / unitsSold : 0;
  const inventoryValue = products.reduce((s, p) => s + getInventoryValue(p), 0);

  // Per-product stock reconstruction: stock at time t equals current stock
  // minus all recorded changes after t.
  const changesByProduct = new Map<string, Array<{ time: number; delta: number }>>();
  for (const h of history) {
    const list = changesByProduct.get(h.product_id) ?? [];
    list.push({ time: new Date(h.created_at).getTime(), delta: h.quantity_change });
    changesByProduct.set(h.product_id, list);
  }
  const stockAt = (p: Product, t: number) => {
    const changes = changesByProduct.get(p.id) ?? [];
    let stock = p.current_stock;
    for (const c of changes) {
      if (c.time > t) stock -= c.delta;
    }
    return stock;
  };

  const series: TimePoint[] = buckets.map((b) => {
    let bRevenue = 0;
    let bProfit = 0;
    for (const s of sales) {
      const t = new Date(s.created_at).getTime();
      if (t >= b.start && t <= b.end) {
        const qty = Math.abs(s.quantity_change);
        bRevenue += qty * s.unit_price;
        bProfit += qty * (s.unit_price - s.unit_cost);
      }
    }
    let stockUnits = 0;
    let lowStock = 0;
    for (const p of products) {
      const st = Math.max(0, stockAt(p, b.end));
      stockUnits += st;
      if (st <= p.min_stock) lowStock += 1;
    }
    return {
      label: b.label,
      revenue: Math.round(bRevenue * 100) / 100,
      profit: Math.round(bProfit * 100) / 100,
      stockUnits,
      lowStock,
    };
  });

  // Category performance within range.
  const productById = new Map(products.map((p) => [p.id, p]));
  const perfMap = new Map<string, CategoryPerf>();
  for (const s of sales) {
    const product = productById.get(s.product_id);
    const category = categories.find((c) => c.id === product?.category_id);
    const name = category?.name ?? "Uncategorized";
    const entry = perfMap.get(name) ?? {
      name,
      color: category?.color ?? "#94a3b8",
      revenue: 0,
      unitsSold: 0,
    };
    const qty = Math.abs(s.quantity_change);
    entry.revenue += qty * s.unit_price;
    entry.unitsSold += qty;
    perfMap.set(name, entry);
  }
  const categoryPerformance = [...perfMap.values()]
    .map((e) => ({ ...e, revenue: Math.round(e.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);

  // Top products within range.
  const topMap = new Map<string, { name: string; revenue: number; unitsSold: number }>();
  for (const s of sales) {
    const product = productById.get(s.product_id);
    if (!product) continue;
    const entry = topMap.get(product.id) ?? {
      name: product.name,
      revenue: 0,
      unitsSold: 0,
    };
    const qty = Math.abs(s.quantity_change);
    entry.revenue += qty * s.unit_price;
    entry.unitsSold += qty;
    topMap.set(product.id, entry);
  }
  const topProducts = [...topMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return {
    revenue,
    profit,
    unitsSold,
    avgSellingPrice,
    inventoryValue,
    series,
    categoryPerformance,
    topProducts,
  };
}

export function useAnalyticsData(range: RangeKey) {
  const products = useProducts();
  const categories = useCategories();
  const history = useHistory();

  const isLoading = products.isLoading || categories.isLoading || history.isLoading;
  const isError = products.isError || categories.isError || history.isError;

  const data = useMemo(() => {
    if (!products.data || !categories.data || !history.data) return null;
    return computeAnalytics(range, products.data, categories.data, history.data);
  }, [range, products.data, categories.data, history.data]);

  return { data, isLoading, isError };
}
