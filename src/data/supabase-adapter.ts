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
import type { DataAdapter } from "./adapter";
import { supabase } from "@/lib/supabase";

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("No data returned");
  return result.data;
}

export class SupabaseAdapter implements DataAdapter {
  // ---- Products ----
  async listProducts(): Promise<Product[]> {
    return unwrap(await client().from("products").select("*").order("sku"));
  }

  async createProduct(input: NewProduct): Promise<Product> {
    return unwrap(
      await client().from("products").insert(input).select().single(),
    );
  }

  async updateProduct(id: string, patch: ProductPatch): Promise<Product> {
    return unwrap(
      await client()
        .from("products")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single(),
    );
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await client().from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ---- Categories ----
  async listCategories(): Promise<Category[]> {
    return unwrap(await client().from("categories").select("*").order("name"));
  }

  async createCategory(name: string, color: string): Promise<Category> {
    return unwrap(
      await client().from("categories").insert({ name, color }).select().single(),
    );
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await client().from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ---- Expenses ----
  async listExpenses(): Promise<Expense[]> {
    return unwrap(
      await client().from("expenses").select("*").order("date", { ascending: false }),
    );
  }

  async createExpense(input: NewExpense): Promise<Expense> {
    return unwrap(
      await client().from("expenses").insert(input).select().single(),
    );
  }

  async updateExpense(id: string, patch: ExpensePatch): Promise<Expense> {
    return unwrap(
      await client().from("expenses").update(patch).eq("id", id).select().single(),
    );
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await client().from("expenses").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ---- History ----
  async listHistory(): Promise<HistoryEntry[]> {
    return unwrap(
      await client()
        .from("inventory_history")
        .select("*")
        .order("created_at", { ascending: false }),
    );
  }

  async recordHistory(entry: NewHistoryEntry): Promise<HistoryEntry> {
    return unwrap(
      await client().from("inventory_history").insert(entry).select().single(),
    );
  }

  // ---- Settings ----
  async getSettings(): Promise<Settings> {
    const { data, error } = await client()
      .from("settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return data as Settings;
    // First run — create the default row.
    return unwrap(
      await client()
        .from("settings")
        .insert({
          id: "default",
          business_name: "Loopstitch",
          currency: "USD",
          low_stock_threshold: 5,
          theme: "light",
        })
        .select()
        .single(),
    );
  }

  async updateSettings(patch: SettingsPatch): Promise<Settings> {
    return unwrap(
      await client()
        .from("settings")
        .update(patch)
        .eq("id", "default")
        .select()
        .single(),
    );
  }
}
