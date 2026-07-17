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
import { createSeedDatabase, type Database } from "./seed";

const STORAGE_KEY = "loopstitch:db:v1";

/** Tiny artificial latency so loading states are visible but the app stays snappy. */
const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms));

const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export class LocalAdapter implements DataAdapter {
  private db: Database;

  constructor() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.db = JSON.parse(raw) as Database;
      } catch {
        this.db = createSeedDatabase();
        this.persist();
      }
    } else {
      this.db = createSeedDatabase();
      this.persist();
    }
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  // ---- Products ----
  async listProducts(): Promise<Product[]> {
    await delay();
    return [...this.db.products].sort((a, b) => a.sku.localeCompare(b.sku));
  }

  async createProduct(input: NewProduct): Promise<Product> {
    await delay();
    const now = new Date().toISOString();
    const product: Product = { ...input, id: newId(), created_at: now, updated_at: now };
    this.db.products.push(product);
    this.persist();
    return product;
  }

  async updateProduct(id: string, patch: ProductPatch): Promise<Product> {
    await delay();
    const product = this.db.products.find((p) => p.id === id);
    if (!product) throw new Error("Product not found");
    Object.assign(product, patch, { updated_at: new Date().toISOString() });
    this.persist();
    return { ...product };
  }

  async deleteProduct(id: string): Promise<void> {
    await delay();
    this.db.products = this.db.products.filter((p) => p.id !== id);
    this.db.history = this.db.history.filter((h) => h.product_id !== id);
    this.persist();
  }

  // ---- Categories ----
  async listCategories(): Promise<Category[]> {
    await delay();
    return [...this.db.categories];
  }

  async createCategory(name: string, color: string): Promise<Category> {
    await delay();
    const category: Category = {
      id: newId(),
      name,
      color,
      created_at: new Date().toISOString(),
    };
    this.db.categories.push(category);
    this.persist();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await delay();
    this.db.categories = this.db.categories.filter((c) => c.id !== id);
    for (const p of this.db.products) {
      if (p.category_id === id) p.category_id = null;
    }
    this.persist();
  }

  // ---- Expenses ----
  async listExpenses(): Promise<Expense[]> {
    await delay();
    return [...this.db.expenses].sort((a, b) => b.date.localeCompare(a.date));
  }

  async createExpense(input: NewExpense): Promise<Expense> {
    await delay();
    const expense: Expense = {
      ...input,
      id: newId(),
      created_at: new Date().toISOString(),
    };
    this.db.expenses.push(expense);
    this.persist();
    return expense;
  }

  async updateExpense(id: string, patch: ExpensePatch): Promise<Expense> {
    await delay();
    const expense = this.db.expenses.find((e) => e.id === id);
    if (!expense) throw new Error("Expense not found");
    Object.assign(expense, patch);
    this.persist();
    return { ...expense };
  }

  async deleteExpense(id: string): Promise<void> {
    await delay();
    this.db.expenses = this.db.expenses.filter((e) => e.id !== id);
    this.persist();
  }

  // ---- History ----
  async listHistory(): Promise<HistoryEntry[]> {
    await delay();
    return [...this.db.history].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  }

  async recordHistory(entry: NewHistoryEntry): Promise<HistoryEntry> {
    await delay();
    const record: HistoryEntry = {
      ...entry,
      id: newId(),
      created_at: entry.created_at ?? new Date().toISOString(),
    };
    this.db.history.push(record);
    this.persist();
    return record;
  }

  // ---- Settings ----
  async getSettings(): Promise<Settings> {
    await delay();
    return { ...this.db.settings };
  }

  async updateSettings(patch: SettingsPatch): Promise<Settings> {
    await delay();
    Object.assign(this.db.settings, patch);
    this.persist();
    return { ...this.db.settings };
  }
}
