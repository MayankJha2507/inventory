import {
  ArrowDownRight,
  ArrowUpRight,
  History,
  PackagePlus,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { formatRelativeTime } from "@/lib/format";
import type { HistoryEntry, HistoryType } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  HistoryType,
  { label: string; icon: LucideIcon; className: string }
> = {
  sale: { label: "Sale", icon: ArrowDownRight, className: "bg-primary-soft text-primary" },
  restock: { label: "Restock", icon: ArrowUpRight, className: "bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400" },
  adjustment: { label: "Adjusted", icon: SlidersHorizontal, className: "bg-muted text-muted-foreground" },
  created: { label: "Added", icon: PackagePlus, className: "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400" },
};

export function RecentChangesList({
  data,
}: {
  data: Array<HistoryEntry & { productName: string }>;
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Stock changes will show up here."
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {data.map((entry) => {
        const meta = TYPE_META[entry.type];
        return (
          <li
            key={entry.id}
            className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-b-0 last:pb-0 first:pt-0"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg",
                meta.className,
              )}
            >
              <meta.icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-medium">{entry.productName}</span>{" "}
                <span className="text-muted-foreground">
                  · {meta.label.toLowerCase()}
                </span>
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                entry.quantity_change < 0 ? "text-foreground" : "text-primary-hover",
              )}
            >
              {entry.quantity_change > 0 ? "+" : ""}
              {entry.quantity_change}
            </span>
            <span className="w-16 shrink-0 text-right text-[11px] text-subtle">
              {formatRelativeTime(entry.created_at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
