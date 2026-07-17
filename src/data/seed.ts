import type {
  Category,
  Expense,
  HistoryEntry,
  Product,
  Settings,
} from "@/types";

export interface Database {
  products: Product[];
  categories: Category[];
  expenses: Expense[];
  history: HistoryEntry[];
  settings: Settings;
}

/** Deterministic PRNG so the demo data is stable across reloads. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260717);

function daysAgo(n: number, hourJitter = true): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  if (hourJitter) {
    d.setHours(9 + Math.floor(rand() * 10), Math.floor(rand() * 60), 0, 0);
  }
  return d.toISOString();
}

function isoDateDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

let idCounter = 0;
const uid = (prefix: string) => `${prefix}_${(++idCounter).toString(36).padStart(6, "0")}`;

const CATEGORY_DEFS = [
  { name: "Amigurumi", color: "#10b981" },
  { name: "Wearables", color: "#8b5cf6" },
  { name: "Home Decor", color: "#f59e0b" },
  { name: "Bags & Accessories", color: "#0ea5e9" },
  { name: "Baby", color: "#f43f5e" },
];

interface ProductDef {
  sku: string;
  name: string;
  category: string;
  description: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  /** Relative sales popularity 0..1 — drives generated history. */
  popularity: number;
  notes?: string;
}

const PRODUCT_DEFS: ProductDef[] = [
  { sku: "AMI-001", name: "Mochi the Cat", category: "Amigurumi", description: "Chubby amigurumi cat in cream cotton yarn with embroidered whiskers.", cost: 6.5, price: 28, stock: 14, minStock: 5, popularity: 0.9 },
  { sku: "AMI-002", name: "Sunny the Octopus", category: "Amigurumi", description: "Eight-legged cuddle buddy in mustard yellow, safety eyes.", cost: 5.8, price: 24, stock: 4, minStock: 5, popularity: 0.8, notes: "Restock before the weekend market." },
  { sku: "AMI-003", name: "Barnaby Bear", category: "Amigurumi", description: "Classic teddy in taupe chenille with a stitched nose.", cost: 8.2, price: 34, stock: 9, minStock: 4, popularity: 0.7 },
  { sku: "AMI-004", name: "Pip the Dinosaur", category: "Amigurumi", description: "Small green dino with felt spikes — a kids' favourite.", cost: 5.2, price: 22, stock: 0, minStock: 4, popularity: 0.85, notes: "Sold out at the spring fair. High demand." },
  { sku: "WEA-001", name: "Cloud Beanie", category: "Wearables", description: "Slouchy ribbed beanie in soft merino blend, one size.", cost: 7.4, price: 26, stock: 18, minStock: 6, popularity: 0.75 },
  { sku: "WEA-002", name: "Granny Square Cardigan", category: "Wearables", description: "Statement cardigan of hand-joined granny squares, size M.", cost: 26, price: 95, stock: 3, minStock: 2, popularity: 0.4 },
  { sku: "WEA-003", name: "Meadow Shawl", category: "Wearables", description: "Lightweight triangular shawl in sage gradient yarn.", cost: 12.5, price: 48, stock: 7, minStock: 3, popularity: 0.5 },
  { sku: "WEA-004", name: "Chunky Scarf — Oat", category: "Wearables", description: "Extra-chunky knit-look scarf in oatmeal.", cost: 9.8, price: 38, stock: 11, minStock: 4, popularity: 0.55 },
  { sku: "HOM-001", name: "Boho Plant Hanger", category: "Home Decor", description: "Macramé-style crochet plant hanger, fits 6\" pots.", cost: 3.6, price: 18, stock: 22, minStock: 8, popularity: 0.65 },
  { sku: "HOM-002", name: "Mandala Cushion Cover", category: "Home Decor", description: "16\" cushion cover with mandala front in jewel tones.", cost: 8.9, price: 36, stock: 6, minStock: 4, popularity: 0.45 },
  { sku: "HOM-003", name: "Coaster Set (4)", category: "Home Decor", description: "Set of four cotton coasters in earthy tones.", cost: 2.8, price: 14, stock: 30, minStock: 10, popularity: 0.95 },
  { sku: "BAG-001", name: "Market Tote — Sand", category: "Bags & Accessories", description: "Sturdy mesh market tote in sand cotton, long handles.", cost: 6.2, price: 32, stock: 12, minStock: 5, popularity: 0.7 },
  { sku: "BAG-002", name: "Shell Stitch Clutch", category: "Bags & Accessories", description: "Evening clutch in blush shell stitch with magnetic snap.", cost: 5.4, price: 27, stock: 2, minStock: 4, popularity: 0.5 },
  { sku: "BAG-003", name: "Bucket Hat — Ecru", category: "Bags & Accessories", description: "Trendy crochet bucket hat in ecru raffia yarn.", cost: 6.8, price: 30, stock: 8, minStock: 4, popularity: 0.8 },
  { sku: "BAB-001", name: "Baby Blanket — Peach", category: "Baby", description: "30×36\" heirloom baby blanket in peach velvet yarn.", cost: 14.2, price: 58, stock: 5, minStock: 3, popularity: 0.6 },
  { sku: "BAB-002", name: "Newborn Booties", category: "Baby", description: "Pair of soft newborn booties, 0–3 months.", cost: 3.1, price: 15, stock: 16, minStock: 6, popularity: 0.75 },
];

const EXPENSE_DEFS: Array<{ category: string; description: string; min: number; max: number; monthly: boolean }> = [
  { category: "Materials", description: "Yarn restock — cotton & merino", min: 60, max: 140, monthly: true },
  { category: "Materials", description: "Safety eyes, stuffing & notions", min: 15, max: 40, monthly: true },
  { category: "Packaging", description: "Boxes, tissue paper & thank-you cards", min: 12, max: 30, monthly: true },
  { category: "Fees", description: "Etsy listing & transaction fees", min: 18, max: 55, monthly: true },
  { category: "Marketing", description: "Instagram promotion", min: 10, max: 35, monthly: true },
];

export function createSeedDatabase(): Database {
  idCounter = 0;

  const now = new Date().toISOString();
  const categories: Category[] = CATEGORY_DEFS.map((c) => ({
    id: uid("cat"),
    name: c.name,
    color: c.color,
    created_at: daysAgo(400),
  }));
  const catByName = new Map(categories.map((c) => [c.name, c.id]));

  const products: Product[] = [];
  const history: HistoryEntry[] = [];

  for (const def of PRODUCT_DEFS) {
    const createdDaysAgo = 300 + Math.floor(rand() * 80);
    const product: Product = {
      id: uid("prd"),
      sku: def.sku,
      name: def.name,
      category_id: catByName.get(def.category) ?? null,
      description: def.description,
      notes: def.notes ?? "",
      cost_price: def.cost,
      selling_price: def.price,
      current_stock: def.stock,
      min_stock: def.minStock,
      created_at: daysAgo(createdDaysAgo),
      updated_at: daysAgo(Math.floor(rand() * 10)),
    };
    products.push(product);

    history.push({
      id: uid("his"),
      product_id: product.id,
      type: "created",
      quantity_change: def.minStock * 2,
      unit_price: def.price,
      unit_cost: def.cost,
      created_at: product.created_at,
    });

    // Generate ~12 months of sales & restocks weighted by popularity, with a
    // gentle upward trend toward the present.
    for (let day = createdDaysAgo - 1; day >= 0; day--) {
      const recency = 1 - day / createdDaysAgo; // 0 → oldest, 1 → today
      const dailyChance = def.popularity * (0.09 + 0.13 * recency);
      if (rand() < dailyChance) {
        const qty = 1 + (rand() < 0.22 ? 1 : 0) + (rand() < 0.06 ? 1 : 0);
        history.push({
          id: uid("his"),
          product_id: product.id,
          type: "sale",
          quantity_change: -qty,
          unit_price: def.price,
          unit_cost: def.cost,
          created_at: daysAgo(day),
        });
      }
      if (rand() < dailyChance / 6) {
        history.push({
          id: uid("his"),
          product_id: product.id,
          type: "restock",
          quantity_change: 3 + Math.floor(rand() * 6),
          unit_price: def.price,
          unit_cost: def.cost,
          created_at: daysAgo(day),
        });
      }
    }
  }

  history.sort((a, b) => a.created_at.localeCompare(b.created_at));

  const expenses: Expense[] = [];
  for (let month = 11; month >= 0; month--) {
    for (const def of EXPENSE_DEFS) {
      if (!def.monthly) continue;
      const day = month * 30 + Math.floor(rand() * 26);
      expenses.push({
        id: uid("exp"),
        date: isoDateDaysAgo(day),
        category: def.category,
        amount: Math.round((def.min + rand() * (def.max - def.min)) * 100) / 100,
        description: def.description,
        created_at: daysAgo(day),
      });
    }
  }
  // A few one-off expenses for texture.
  expenses.push(
    { id: uid("exp"), date: isoDateDaysAgo(160), category: "Equipment", amount: 89.99, description: "Ergonomic hook set & blocking mats", created_at: daysAgo(160) },
    { id: uid("exp"), date: isoDateDaysAgo(75), category: "Fees", amount: 120, description: "Spring craft fair booth", created_at: daysAgo(75) },
    { id: uid("exp"), date: isoDateDaysAgo(12), category: "Equipment", amount: 45.5, description: "Product photography light box", created_at: daysAgo(12) },
  );
  expenses.sort((a, b) => b.date.localeCompare(a.date));

  const settings: Settings = {
    id: "default",
    business_name: "Loopstitch",
    currency: "USD",
    low_stock_threshold: 5,
    theme: "light",
  };

  void now;
  return { products, categories, expenses, history, settings };
}
