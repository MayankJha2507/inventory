import { useState } from "react";
import { Plus } from "lucide-react";
import { useCreateExpense } from "../hooks";
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

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorySuggestions: string[];
}

const today = () => new Date().toISOString().slice(0, 10);

export function AddExpenseDialog({
  open,
  onOpenChange,
  categorySuggestions,
}: AddExpenseDialogProps) {
  const createExpense = useCreateExpense();
  const [form, setForm] = useState({
    date: today(),
    category: "",
    amount: "",
    description: "",
  });

  const canSubmit = form.category.trim() !== "" && Number(form.amount) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createExpense.mutate(
      {
        date: form.date,
        category: form.category.trim(),
        amount: Number(form.amount),
        description: form.description.trim(),
      },
      {
        onSuccess: () => {
          setForm({ date: today(), category: "", amount: "", description: "" });
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
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>
            Everything is editable inline afterwards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={field}>
              <Label htmlFor="e-date">Date</Label>
              <Input
                id="e-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className={field}>
              <Label htmlFor="e-amount">Amount</Label>
              <Input
                id="e-amount"
                type="number"
                min={0}
                step="any"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>
          <div className={field}>
            <Label htmlFor="e-category">Category</Label>
            <Input
              id="e-category"
              list="expense-categories"
              placeholder="e.g. Materials"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <datalist id="expense-categories">
              {categorySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className={field}>
            <Label htmlFor="e-desc">Description</Label>
            <Input
              id="e-desc"
              placeholder="What was this for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createExpense.isPending}>
              <Plus /> Add expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
