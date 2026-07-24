import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudOff, Monitor, Moon, Plus, Store, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSupabaseEnabled } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { CHART_PALETTE } from "@/components/charts";

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useProducts,
} from "@/features/inventory/hooks";
import { useSettings, useUpdateSettings } from "./hooks";

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
];

function SectionCard({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function SettingsPage() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const categories = useCategories();
  const products = useProducts();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const { preference, resolved, setPreference } = useTheme();

  const [businessName, setBusinessName] = useState("");
  const [threshold, setThreshold] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newColor, setNewColor] = useState(CHART_PALETTE[0]);

  useEffect(() => {
    if (settings.data) {
      setBusinessName(settings.data.business_name);
      setThreshold(String(settings.data.low_stock_threshold));
    }
  }, [settings.data]);

  if (settings.isLoading || !settings.data) {
    return (
      <>
        <PageHeader title="Settings" description="Configure your business preferences." />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </>
    );
  }

  const saveBusinessName = () => {
    const name = businessName.trim();
    if (name && name !== settings.data?.business_name) {
      updateSettings.mutate(
        { business_name: name },
        { onSuccess: () => toast.success("Business name saved") },
      );
    }
  };

  const saveThreshold = () => {
    const value = Math.max(0, Math.round(Number(threshold) || 0));
    if (value !== settings.data?.low_stock_threshold) {
      updateSettings.mutate(
        { low_stock_threshold: value },
        { onSuccess: () => toast.success("Low stock threshold saved") },
      );
    }
  };

  const productCount = (categoryId: string) =>
    (products.data ?? []).filter((p) => p.category_id === categoryId).length;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    if (categories.data?.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("That category already exists");
      return;
    }
    createCategory.mutate(
      { name, color: newColor },
      { onSuccess: () => setNewCategory("") },
    );
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure your business preferences."
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <SectionCard
          title="Business"
          description="How your studio shows up across the app"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-name">Business name</Label>
            <Input
              id="s-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onBlur={saveBusinessName}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Currency</Label>
            <Select
              value={settings.data.currency}
              onValueChange={(currency) =>
                updateSettings.mutate(
                  { currency },
                  { onSuccess: () => toast.success("Currency updated") },
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-threshold">Default low stock threshold</Label>
            <Input
              id="s-threshold"
              type="number"
              min={0}
              step={1}
              className="w-32"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              onBlur={saveThreshold}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
            <p className="text-[11px] text-subtle">
              Used as the suggested minimum stock for new products. Each product
              can override it.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Categories"
          description="Organize your product catalog"
          delay={0.05}
        >
          <ul className="flex flex-col">
            {(categories.data ?? []).map((category) => (
              <li
                key={category.id}
                className="group flex items-center gap-3 border-b border-border/60 py-2 first:pt-0 last:border-b-0"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
                <Badge variant="slate" className="ml-auto">
                  {productCount(category.id)} products
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-subtle opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                  onClick={() => deleteCategory.mutate(category.id)}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddCategory} className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border p-1">
              {CHART_PALETTE.slice(0, 5).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className="flex size-6 items-center justify-center rounded-lg transition-transform hover:scale-110"
                  aria-label={`Use color ${color}`}
                >
                  <span
                    className="size-3.5 rounded-full transition-shadow"
                    style={{
                      backgroundColor: color,
                      boxShadow: newColor === color ? `0 0 0 2px white, 0 0 0 3.5px ${color}` : undefined,
                    }}
                  />
                </button>
              ))}
            </div>
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category…"
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newCategory.trim()} aria-label="Add category">
              <Plus />
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Appearance"
          description="Choose how Loopstitch looks on this device"
          delay={0.1}
        >
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((option) => {
              const active = preference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreference(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/60 bg-primary-soft text-primary-hover ring-1 ring-primary/30"
                      : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <option.icon className="size-5" />
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-subtle">
            {preference === "system"
              ? `Following your device settings — currently ${resolved}.`
              : `Using the ${preference} theme on this device.`}
          </p>
        </SectionCard>

        <SectionCard
          title="Data & Integrations"
          description="Where your inventory lives"
          delay={0.15}
        >
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                {isSupabaseEnabled ? (
                  <Cloud className="size-4 text-primary" />
                ) : (
                  <CloudOff className="size-4 text-muted-foreground" />
                )}
              </span>
              <div>
                <p className="text-sm font-medium">Supabase</p>
                <p className="text-[11px] text-subtle">
                  {isSupabaseEnabled
                    ? "Connected — data syncs to your Postgres database"
                    : "Not configured — data is stored in this browser"}
                </p>
              </div>
            </div>
            <Badge variant={isSupabaseEnabled ? "default" : "slate"}>
              {isSupabaseEnabled ? "Connected" : "Local mode"}
            </Badge>
          </div>
          {!isSupabaseEnabled && (
            <p className="text-[11px] leading-relaxed text-subtle">
              To sync across devices: create a Supabase project, run{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">
                supabase/schema.sql
              </code>{" "}
              in its SQL editor, then set{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">
                VITE_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">
                VITE_SUPABASE_ANON_KEY
              </code>{" "}
              in your environment.
            </p>
          )}
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Store className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">Etsy & Shopify sync</p>
                <p className="text-[11px] text-subtle">
                  Automatic stock sync with your shops
                </p>
              </div>
            </div>
            <Badge variant="outline">Coming soon</Badge>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
