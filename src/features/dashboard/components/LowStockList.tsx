import { Link } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/features/inventory/components/StatusBadge";
import { getStockStatus } from "@/lib/inventory";
import type { Product } from "@/types";

export function LowStockList({ data }: { data: Product[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={PackageCheck}
        title="All stocked up"
        description="No products are below their minimum stock level."
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {data.slice(0, 6).map((product) => (
        <li
          key={product.id}
          className="flex items-center gap-3 border-b border-border/60 py-2.5 first:pt-0 last:border-b-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-[11px] text-subtle">
              {product.current_stock} in stock · min {product.min_stock}
            </p>
          </div>
          <StatusBadge status={getStockStatus(product)} />
        </li>
      ))}
      {data.length > 6 && (
        <li className="pt-3">
          <Link
            to="/inventory"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all {data.length} items →
          </Link>
        </li>
      )}
    </ul>
  );
}
