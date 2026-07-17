import type {
  Category,
  Expense,
  ExpensePatch,
  HistoryEntry,
  NewExpense,
  NewHistoryEntry,
  NewProduct,
  Product,
  ProductPatch,
  Settings,
  SettingsPatch,
} from "@/types";
import { isSupabaseEnabled } from "@/lib/supabase";

/**
 * Storage abstraction. Two implementations:
 *  - SupabaseAdapter — used automatically when env credentials are present.
 *  - LocalAdapter — localStorage-backed, seeded with demo data, used otherwise.
 */
export interface DataAdapter {
  listProducts(): Promise<Product[]>;
  createProduct(input: NewProduct): Promise<Product>;
  updateProduct(id: string, patch: ProductPatch): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  listCategories(): Promise<Category[]>;
  createCategory(name: string, color: string): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  listExpenses(): Promise<Expense[]>;
  createExpense(input: NewExpense): Promise<Expense>;
  updateExpense(id: string, patch: ExpensePatch): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  listHistory(): Promise<HistoryEntry[]>;
  recordHistory(entry: NewHistoryEntry): Promise<HistoryEntry>;

  getSettings(): Promise<Settings>;
  updateSettings(patch: SettingsPatch): Promise<Settings>;
}

let adapter: DataAdapter | null = null;

export async function getAdapter(): Promise<DataAdapter> {
  if (adapter) return adapter;
  if (isSupabaseEnabled) {
    const { SupabaseAdapter } = await import("./supabase-adapter");
    adapter = new SupabaseAdapter();
  } else {
    const { LocalAdapter } = await import("./local");
    adapter = new LocalAdapter();
  }
  return adapter;
}
