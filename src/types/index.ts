export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string | null;
  description: string;
  notes: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductPatch = Partial<NewProduct>;

export type StockStatus = "out_of_stock" | "low_stock" | "healthy";

export interface Expense {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  category: string;
  amount: number;
  description: string;
  created_at: string;
}

export type NewExpense = Omit<Expense, "id" | "created_at">;
export type ExpensePatch = Partial<NewExpense>;

export type HistoryType =
  | "sale"
  | "restock"
  | "adjustment"
  | "created"
  | "defective"
  | "lost"
  | "recount";

/** Stock changes that reduce inventory without being a sale. */
export const ADJUSTMENT_REASONS = [
  { type: "restock", label: "Restock", direction: "add" },
  { type: "recount", label: "Recount", direction: "set" },
  { type: "defective", label: "Defective", direction: "remove" },
  { type: "lost", label: "Lost / other", direction: "remove" },
] as const;

export interface HistoryEntry {
  id: string;
  product_id: string;
  type: HistoryType;
  /** Signed stock delta — negative for sales. */
  quantity_change: number;
  /** Selling price per unit at the time of the event. */
  unit_price: number;
  /** Cost price per unit at the time of the event. */
  unit_cost: number;
  created_at: string;
}

export type NewHistoryEntry = Omit<HistoryEntry, "id" | "created_at"> & {
  created_at?: string;
};

export interface Settings {
  id: string;
  business_name: string;
  currency: string;
  low_stock_threshold: number;
  theme: "light";
}

export type SettingsPatch = Partial<Omit<Settings, "id">>;
