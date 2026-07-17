import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { useCategories, useProducts } from "./hooks";
import { InventoryTable } from "./components/InventoryTable";
import { ProductDrawer } from "./components/ProductDrawer";
import { AddProductDialog } from "./components/AddProductDialog";

export function InventoryPage() {
  const products = useProducts();
  const categories = useCategories();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const selectedProduct = useMemo(
    () => products.data?.find((p) => p.id === selectedId) ?? null,
    [products.data, selectedId],
  );

  return (
    <>
      <PageHeader
        title="Inventory"
        description={
          products.data
            ? `${products.data.length} products · click any cell to edit, changes save automatically`
            : "Manage your products, stock and pricing."
        }
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Add product
          </Button>
        }
      />

      {products.isLoading || categories.isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-40" />
          </div>
          <Skeleton className="h-[480px] w-full rounded-2xl" />
        </div>
      ) : products.isError || categories.isError ? (
        <ErrorState onRetry={() => products.refetch()} />
      ) : (
        <InventoryTable
          products={products.data ?? []}
          categories={categories.data ?? []}
          onRowClick={(product) => {
            setSelectedId(product.id);
            setDrawerOpen(true);
          }}
        />
      )}

      <ProductDrawer
        product={selectedProduct}
        categories={categories.data ?? []}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <AddProductDialog
        categories={categories.data ?? []}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </>
  );
}
