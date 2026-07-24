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
  ReceiptText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { Expense } from "@/types";
import { formatCurrency } from "@/lib/format";
import { useCurrency } from "@/features/settings/hooks";
import { useDeleteExpense, useUpdateExpense } from "../hooks";
import { EditableCell } from "@/components/EditableCell";
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

const columnHelper = createColumnHelper<Expense>();

function DateCell({
  value,
  onSave,
}: {
  value: string;
  onSave: (date: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => {
        if (e.target.value) onSave(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
      className="h-7 cursor-pointer rounded-lg bg-transparent px-2 text-sm tabular-nums transition-colors hover:bg-muted/80 hover:ring-1 hover:ring-border focus:outline-none focus:ring-2 focus:ring-ring/40"
    />
  );
}

export function ExpensesTable({ expenses }: { expenses: Expense[] }) {
  const currency = useCurrency();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const categories = useMemo(
    () => [...new Set(expenses.map((e) => e.category))].sort(),
    [expenses],
  );

  const save = (id: string, patch: Parameters<typeof updateExpense.mutate>[0]["patch"]) =>
    updateExpense.mutate({ id, patch });

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <DateCell
            value={info.getValue()}
            onSave={(date) => save(info.row.original.id, { date })}
          />
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        filterFn: "equals",
        cell: (info) => (
          <EditableCell
            value={info.getValue()}
            onSave={(v) => save(info.row.original.id, { category: String(v) })}
            className="font-medium"
          />
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => (
          <EditableCell
            type="number"
            align="right"
            value={info.getValue()}
            display={(v) => formatCurrency(Number(v), currency)}
            onSave={(v) => save(info.row.original.id, { amount: Number(v) })}
            className="font-medium tabular-nums"
          />
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <EditableCell
            value={info.getValue()}
            onSave={(v) => save(info.row.original.id, { description: String(v) })}
            placeholder="Add a description…"
            className="text-muted-foreground"
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex justify-end pr-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-subtle hover:bg-danger-soft hover:text-danger"
              onClick={(e) => {
                e.stopPropagation();
                deleteExpense.mutate(info.row.original.id);
              }}
              aria-label="Delete expense"
            >
              <Trash2 />
            </Button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency],
  );

  const table = useReactTable({
    data: expenses,
    columns,
    state: { globalFilter, columnFilters, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase();
      return (
        row.original.description.toLowerCase().includes(q) ||
        row.original.category.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  const categoryFilter =
    (table.getColumn("category")?.getFilterValue() as string | undefined) ?? "all";
  const rows = table.getRowModel().rows;
  const filteredRows = table.getFilteredRowModel().rows;
  const filteredTotal = filteredRows.reduce(
    (sum, r) => sum + r.original.amount,
    0,
  );
  const { pageIndex, pageSize } = table.getState().pagination;
  const hasFilters = globalFilter !== "" || categoryFilter !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search expenses…"
            className="pl-9"
            data-search-input
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) =>
            table.getColumn("category")?.setFilterValue(v === "all" ? undefined : v)
          }
        >
          <SelectTrigger className="w-auto min-w-36 sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
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
        <p className="ml-auto text-sm text-muted-foreground">
          Total{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {formatCurrency(filteredTotal, currency)}
          </span>
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="max-h-[62vh] overflow-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {table.getFlatHeaders().map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "sticky top-0 z-10 whitespace-nowrap border-b border-border bg-muted/95 px-3 py-2.5 text-left text-xs font-medium text-muted-foreground backdrop-blur first:pl-4 last:pr-4",
                      header.column.getCanSort() && "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() &&
                        (header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="size-3 text-primary" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="size-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="size-3 text-subtle/50" />
                        ))}
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
                      icon={ReceiptText}
                      title={hasFilters ? "No matching expenses" : "No expenses yet"}
                      description={
                        hasFilters
                          ? "Try adjusting your search or filters."
                          : "Track yarn, packaging and fees to see your true profit."
                      }
                    />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-muted/40">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-b border-border/60 px-1.5 py-1.5 first:pl-2.5 last:pr-2 group-last:border-b-0"
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
            {filteredRows.length === 0
              ? "0 expenses"
              : `${pageIndex * pageSize + 1}–${Math.min(
                  (pageIndex + 1) * pageSize,
                  filteredRows.length,
                )} of ${filteredRows.length} expenses`}
          </p>
          <div className="flex items-center gap-2">
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
