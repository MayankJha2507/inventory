import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/inventory";
import type { StockStatus } from "@/types";
import { cn } from "@/lib/utils";

const VARIANT: Record<StockStatus, "default" | "warning" | "danger"> = {
  healthy: "default",
  low_stock: "warning",
  out_of_stock: "danger",
};

const DOT: Record<StockStatus, string> = {
  healthy: "bg-primary",
  low_stock: "bg-warning",
  out_of_stock: "bg-danger",
};

export function StatusBadge({ status }: { status: StockStatus }) {
  return (
    <Badge variant={VARIANT[status]}>
      <span className={cn("size-1.5 rounded-full", DOT[status])} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
