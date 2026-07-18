import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Category } from "@/types";
import { useSettings } from "@/features/settings/hooks";
import { useCreateProduct } from "../hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddProductDialogProps {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY = {
  name: "",
  sku: "",
  category_id: null as string | null,
  cost_price: "",
  selling_price: "",
  current_stock: "0",
  min_stock: "3",
};

export function AddProductDialog({
  categories,
  open,
  onOpenChange,
}: AddProductDialogProps) {
  const createProduct = useCreateProduct();
  const { data: settings } = useSettings();
  const [form, setForm] = useState(EMPTY);

  // Suggest the configured low-stock threshold as the default minimum.
  useEffect(() => {
    if (open && settings) {
      setForm((f) =>
        f === EMPTY
          ? { ...EMPTY, min_stock: String(settings.low_stock_threshold) }
          : f,
      );
    }
  }, [open, settings]);
  const set = (key: keyof typeof EMPTY, value: string | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSubmit = form.name.trim() !== "" && form.sku.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createProduct.mutate(
      {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        category_id: form.category_id,
        description: "",
        notes: "",
        cost_price: Number(form.cost_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        current_stock: Math.max(0, Math.round(Number(form.current_stock) || 0)),
        min_stock: Math.max(0, Math.round(Number(form.min_stock) || 0)),
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          onOpenChange(false);
        },
      },
    );
  };

  const field = "flex flex-col gap-1.5";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
          <DialogDescription>
            You can edit everything inline later — just the basics for now.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className={field}>
            <Label htmlFor="new-name">Product name</Label>
            <Input
              id="new-name"
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Clover the Bunny"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={field}>
              <Label htmlFor="new-sku">SKU</Label>
              <Input
                id="new-sku"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="AMI-017"
                className="font-mono text-xs"
              />
            </div>
            <div className={field}>
              <Label>Category</Label>
              <Select
                value={form.category_id ?? "none"}
                onValueChange={(v) =>
                  set("category_id", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="none">No category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={field}>
              <Label htmlFor="new-cost">Cost price</Label>
              <Input
                id="new-cost"
                type="number"
                min={0}
                step="any"
                value={form.cost_price}
                onChange={(e) => set("cost_price", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={field}>
              <Label htmlFor="new-price">Selling price</Label>
              <Input
                id="new-price"
                type="number"
                min={0}
                step="any"
                value={form.selling_price}
                onChange={(e) => set("selling_price", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={field}>
              <Label htmlFor="new-stock">Current stock</Label>
              <Input
                id="new-stock"
                type="number"
                min={0}
                step={1}
                value={form.current_stock}
                onChange={(e) => set("current_stock", e.target.value)}
              />
            </div>
            <div className={field}>
              <Label htmlFor="new-min">Minimum stock</Label>
              <Input
                id="new-min"
                type="number"
                min={0}
                step={1}
                value={form.min_stock}
                onChange={(e) => set("min_stock", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createProduct.isPending}>
              <Plus /> Add product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
