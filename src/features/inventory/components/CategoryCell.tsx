import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryCellProps {
  categoryId: string | null;
  categories: Category[];
  onChange: (categoryId: string | null) => void;
}

export function CategoryCell({ categoryId, categories, onChange }: CategoryCellProps) {
  const current = categories.find((c) => c.id === categoryId);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select
        value={categoryId ?? "none"}
        onValueChange={(v) => onChange(v === "none" ? null : v)}
      >
        <SelectTrigger
          className={cn(
            "h-7 w-auto min-w-0 gap-1.5 border-transparent bg-transparent px-2 shadow-none hover:bg-muted/80 hover:ring-1 hover:ring-border focus:ring-0",
          )}
        >
          <span className="flex items-center gap-1.5 truncate text-sm">
            {current && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: current.color }}
              />
            )}
            {current?.name ?? <span className="text-subtle">No category</span>}
          </span>
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </span>
            </SelectItem>
          ))}
          <SelectItem value="none">No category</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
