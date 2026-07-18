import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
  X,
} from "lucide-react";
import type { Category, Product, StockStatus } from "@/types";
import {
  getInventoryValue,
  getProfitPerUnit,
  getStockStatus,
} from "@/lib/inventory";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import { useUpdateProduct } from "../hooks";
import { EditableCell } from "@/components/EditableCell";
import { StatusBadge } from "./StatusBadge";
import { CategoryCell } from "./CategoryCell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Product>();

interface InventoryTableProps {
  products: Product[];
  categories: Category[];
  onRowClick: (product: Product) => void;
}

export function InventoryTable({
  products,
  categories,
  onRowClick,
}: InventoryTableProps) {
  const currency = useCurrency();
  const updateProduct = useUpdateProduct();

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const money = (v: string | number) => formatCurrency(Number(v), currency);

  const save = (id: string, patch: Parameters<typeof updateProduct.mutate>[0]["patch"]) =>
    updateProduct.mutate({ id, patch });

  const columns = useMemo(
    () => [
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <EditableCell
            value={info.getValue()}
            onSave={(v) => save(info.row.original.id, { sku: String(v) })}
            className="font-mono text-xs tracking-tight text-muted-foreground"
          />
        ),
      }),
      columnHelper.accessor("name", {
        header: "Product",
        cell: (info) => (
          <EditableCell
            value={info.getValue()}
            onSave={(v) => save(info.row.original.id, { name: String(v) })}
            className="font-medium"
          />
        ),
      }),
      columnHelper.accessor("category_id", {
        header: "Category",
        filterFn: "equals",
        cell: (info) => (
          <CategoryCell
            categoryId={info.getValue()}
            categories={categories}
            onChange={(categoryId) =>
              save(info.row.original.id, { category_id: categoryId })
            }
          />
        ),
      }),
      columnHelper.accessor("cost_price", {
        header: "Cost",
        cell: (info) => (
          <EditableCell
            type="number"
            align="right"
            value={info.getValue()}
            display={money}
            onSave={(v) => save(info.row.original.id, { cost_price: Number(v) })}
          />
        ),
      }),
      columnHelper.accessor("selling_price", {
        header: "Price",
        cell: (info) => (
          <EditableCell
            type="number"
            align="right"
            value={info.getValue()}
            display={money}
            onSave={(v) =>
              save(info.row.original.id, { selling_price: Number(v) })
            }
          />
        ),
      }),
      columnHelper.accessor("current_stock", {
        header: "Stock",
        cell: (info) => (
          <EditableCell
            type="number"
            step={1}
            align="right"
            value={info.getValue()}
            onSave={(v) =>
              save(info.row.original.id, { current_stock: Number(v) })
            }
          />
        ),
      }),
      columnHelper.accessor("min_stock", {
        header: "Min",
        cell: (info) => (
          <EditableCell
            type="number"
            step={1}
            align="right"
            value={info.getValue()}
            onSave={(v) => save(info.row.original.id, { min_stock: Number(v) })}
          />
        ),
      }),
      columnHelper.accessor((row) => getInventoryValue(row), {
        id: "inventory_value",
        header: "Value",
        cell: (info) => (
          <span className="block px-2 text-right text-sm tabular-nums text-muted-foreground">
            {formatCurrency(info.getValue(), currency)}
          </span>
        ),
      }),
      columnHelper.accessor((row) => getProfitPerUnit(row), {
        id: "profit_per_unit",
        header: "Profit/unit",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span
              className={cn(
                "block px-2 text-right text-sm font-medium tabular-nums",
                v >= 0 ? "text-primary-hover" : "text-danger",
              )}
            >
              {formatCurrency(v, currency)}
            </span>
          );
        },
      }),
      columnHelper.accessor((row) => getStockStatus(row), {
        id: "status",
        header: "Status",
        filterFn: "equals",
        cell: (info) => (
          <div className="px-2">
            <StatusBadge status={info.getValue() as StockStatus} />
          </div>
        ),
      }),
      columnHelper.accessor("updated_at", {
        header: "Updated",
        cell: (info) => (
          <span className="block whitespace-nowrap px-2 text-xs text-subtle">
            {formatRelativeTime(info.getValue())}
          </span>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, currency],
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter, columnFilters, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(q) ||
        row.original.sku.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const categoryFilter =
    (table.getColumn("category_id")?.getFilterValue() as string | undefined) ??
    "all";
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string | undefined) ?? "all";
  const rows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const hasFilters =
    globalFilter !== "" || categoryFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search products or SKUs…"
            className="pl-9"
            data-search-input
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) =>
            table
              .getColumn("category_id")
              ?.setFilterValue(v === "all" ? undefined : v)
          }
        >
          <SelectTrigger className="w-auto min-w-36 sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            table.getColumn("status")?.setFilterValue(v === "all" ? undefined : v)
          }
        >
          <SelectTrigger className="w-auto min-w-32 sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGlobalFilter("");
              setColumnFilters([]);
            }}
          >
            <X /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="max-h-[62vh] overflow-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {table.getFlatHeaders().map((header, i) => (
                  <th
                    key={header.id}
                    className={cn(
                      "sticky top-0 z-10 whitespace-nowrap border-b border-border bg-slate-50/95 px-3 py-2.5 text-left text-xs font-medium text-muted-foreground backdrop-blur first:pl-4 last:pr-4",
                      i === 0 && "left-0 z-20",
                      header.column.getCanSort() && "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="size-3 text-primary" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="size-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="size-3 text-subtle/50" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon={PackageSearch}
                      title={
                        hasFilters ? "No matching products" : "No products yet"
                      }
                      description={
                        hasFilters
                          ? "Try adjusting your search or filters."
                          : "Add your first product to start tracking inventory."
                      }
                    />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick(row.original)}
                    className="group cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    {row.getVisibleCells().map((cell, i) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "border-b border-border/60 px-1.5 py-1.5 first:pl-2.5 last:pr-4 group-last:border-b-0",
                          i === 0 &&
                            "sticky left-0 z-[5] bg-surface group-hover:bg-[#f6f8f9]",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {filteredCount === 0
              ? "0 products"
              : `${pageIndex * pageSize + 1}–${Math.min(
                  (pageIndex + 1) * pageSize,
                  filteredCount,
                )} of ${filteredCount} products`}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-auto gap-1 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="icon-sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
