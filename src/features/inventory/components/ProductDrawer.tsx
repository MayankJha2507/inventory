import { useEffect, useState } from "react";
import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category, Product } from "@/types";
import {
  getInventoryValue,
  getProfitPerUnit,
  getStockStatus,
} from "@/lib/inventory";
import { formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import { useDeleteProduct, useUpdateProduct } from "../hooks";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";

interface ProductDrawerProps {
  product: Product | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DraftState {
  name: string;
  sku: string;
  category_id: string | null;
  description: string;
  notes: string;
  cost_price: string;
  selling_price: string;
  current_stock: string;
  min_stock: string;
}

function toDraft(p: Product): DraftState {
  return {
    name: p.name,
    sku: p.sku,
    category_id: p.category_id,
    description: p.description,
    notes: p.notes,
    cost_price: String(p.cost_price),
    selling_price: String(p.selling_price),
    current_stock: String(p.current_stock),
    min_stock: String(p.min_stock),
  };
}

export function ProductDrawer({
  product,
  categories,
  open,
  onOpenChange,
}: ProductDrawerProps) {
  const currency = useCurrency();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open && product) setDraft(toDraft(product));
  }, [open, product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return null;
  const d = draft ?? toDraft(product);
  const set = <K extends keyof DraftState>(key: K, value: DraftState[K]) =>
    setDraft({ ...d, [key]: value });

  const preview: Product = {
    ...product,
    cost_price: Number(d.cost_price) || 0,
    selling_price: Number(d.selling_price) || 0,
    current_stock: Math.max(0, Math.round(Number(d.current_stock) || 0)),
    min_stock: Math.max(0, Math.round(Number(d.min_stock) || 0)),
  };

  const handleSave = () => {
    updateProduct.mutate(
      {
        id: product.id,
        patch: {
          name: d.name.trim() || product.name,
          sku: d.sku.trim() || product.sku,
          category_id: d.category_id,
          description: d.description,
          notes: d.notes,
          cost_price: preview.cost_price,
          selling_price: preview.selling_price,
          current_stock: preview.current_stock,
          min_stock: preview.min_stock,
        },
        stockChangeType: "adjustment",
      },
      { onSuccess: () => toast.success("Product saved") },
    );
    onOpenChange(false);
  };

  const quickStock = (delta: number) => {
    const next = Math.max(0, product.current_stock + delta);
    if (next === product.current_stock) return;
    updateProduct.mutate({
      id: product.id,
      patch: { current_stock: next },
      stockChangeType: delta < 0 ? "sale" : "restock",
    });
    set("current_stock", String(next));
  };

  const field = "flex flex-col gap-1.5";

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={product.name}
        description={
          <span className="font-mono text-[11px]">{product.sku}</span>
        }
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 /> Delete
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateProduct.isPending}>
                Save changes
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Image placeholder — upload coming later */}
          <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
            <div className="flex flex-col items-center gap-1.5 text-subtle">
              <ImageIcon className="size-6" />
              <span className="text-xs">Product photo coming soon</span>
            </div>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-muted/60 px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground">Value</p>
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(getInventoryValue(preview), currency)}
              </p>
            </div>
            <div className="rounded-xl bg-primary-soft px-3 py-2.5">
              <p className="text-[11px] text-primary-hover/80">Profit/unit</p>
              <p className="text-sm font-semibold tabular-nums text-primary-hover">
                {formatCurrency(getProfitPerUnit(preview), currency)}
              </p>
            </div>
            <div className="flex items-center justify-center rounded-xl bg-muted/60 px-2">
              <StatusBadge status={getStockStatus(preview)} />
            </div>
          </div>

          {/* Quick stock actions */}
          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <div>
              <p className="text-xs font-medium">Quick stock</p>
              <p className="text-[11px] text-muted-foreground">
                Logs a sale or restock in history
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={() => quickStock(-1)}
                disabled={product.current_stock === 0}
                aria-label="Record sale of one unit"
              >
                <Minus />
              </Button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">
                {product.current_stock}
              </span>
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={() => quickStock(1)}
                aria-label="Restock one unit"
              >
                <Plus />
              </Button>
            </div>
          </div>

          <Separator />

          <div className={field}>
            <Label htmlFor="p-name">Product name</Label>
            <Input
              id="p-name"
              value={d.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={field}>
              <Label htmlFor="p-sku">SKU</Label>
              <Input
                id="p-sku"
                value={d.sku}
                onChange={(e) => set("sku", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className={field}>
              <Label>Category</Label>
              <Select
                value={d.category_id ?? "none"}
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
          </div>

          <div className={field}>
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={d.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What makes this piece special?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={field}>
              <Label htmlFor="p-cost">Cost price</Label>
              <Input
                id="p-cost"
                type="number"
                min={0}
                step="any"
                value={d.cost_price}
                onChange={(e) => set("cost_price", e.target.value)}
              />
            </div>
            <div className={field}>
              <Label htmlFor="p-price">Selling price</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                step="any"
                value={d.selling_price}
                onChange={(e) => set("selling_price", e.target.value)}
              />
            </div>
            <div className={field}>
              <Label htmlFor="p-stock">Current stock</Label>
              <Input
                id="p-stock"
                type="number"
                min={0}
                step={1}
                value={d.current_stock}
                onChange={(e) => set("current_stock", e.target.value)}
              />
            </div>
            <div className={field}>
              <Label htmlFor="p-min">Minimum stock</Label>
              <Input
                id="p-min"
                type="number"
                min={0}
                step={1}
                value={d.min_stock}
                onChange={(e) => set("min_stock", e.target.value)}
              />
            </div>
          </div>

          <div className={field}>
            <Label htmlFor="p-notes">Notes</Label>
            <Textarea
              id="p-notes"
              value={d.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Private notes — restock reminders, yarn dye lots…"
            />
          </div>
        </div>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{product.name}”?</DialogTitle>
            <DialogDescription>
              This removes the product and its inventory history. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteProduct.mutate(product.id);
                setConfirmDelete(false);
                onOpenChange(false);
              }}
            >
              <Trash2 /> Delete product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
