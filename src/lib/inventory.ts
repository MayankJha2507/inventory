import type { Product, StockStatus } from "@/types";

export function getStockStatus(product: Product): StockStatus {
  if (product.current_stock <= 0) return "out_of_stock";
  if (product.current_stock <= product.min_stock) return "low_stock";
  return "healthy";
}

export function getInventoryValue(product: Product): number {
  return product.cost_price * product.current_stock;
}

export function getProfitPerUnit(product: Product): number {
  return product.selling_price - product.cost_price;
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  out_of_stock: "Out of Stock",
  low_stock: "Low Stock",
  healthy: "Healthy",
};
