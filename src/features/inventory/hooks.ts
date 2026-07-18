import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  HistoryType,
  NewProduct,
  Product,
  ProductPatch,
} from "@/types";
import { getAdapter } from "@/data/adapter";
import { qk } from "@/data/keys";

export function useProducts() {
  return useQuery({
    queryKey: qk.products,
    queryFn: async () => (await getAdapter()).listProducts(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: async () => (await getAdapter()).listCategories(),
    staleTime: Infinity,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: qk.history,
    queryFn: async () => (await getAdapter()).listHistory(),
  });
}

interface UpdateProductInput {
  id: string;
  patch: ProductPatch;
  /**
   * How a stock change should be logged in inventory history.
   * Defaults to inferring: decrease → sale, increase → restock.
   */
  stockChangeType?: HistoryType;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch, stockChangeType }: UpdateProductInput) => {
      const adapter = await getAdapter();
      const previous = queryClient
        .getQueryData<Product[]>(qk.products)
        ?.find((p) => p.id === id);
      const updated = await adapter.updateProduct(id, patch);

      // Log stock movements so revenue/history stay accurate.
      if (
        previous &&
        patch.current_stock !== undefined &&
        patch.current_stock !== previous.current_stock
      ) {
        const delta = patch.current_stock - previous.current_stock;
        const type: HistoryType =
          stockChangeType ?? (delta < 0 ? "sale" : "restock");
        await adapter.recordHistory({
          product_id: id,
          type,
          quantity_change: delta,
          unit_price: updated.selling_price,
          unit_cost: updated.cost_price,
        });
        queryClient.invalidateQueries({ queryKey: qk.history });
      }
      return updated;
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: qk.products });
      const previous = queryClient.getQueryData<Product[]>(qk.products);
      queryClient.setQueryData<Product[]>(qk.products, (old) =>
        old?.map((p) =>
          p.id === id
            ? { ...p, ...patch, updated_at: new Date().toISOString() }
            : p,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.products, context.previous);
      }
      toast.error("Couldn't save changes");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.products });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewProduct) => {
      const adapter = await getAdapter();
      const product = await adapter.createProduct(input);
      await adapter.recordHistory({
        product_id: product.id,
        type: "created",
        quantity_change: product.current_stock,
        unit_price: product.selling_price,
        unit_cost: product.cost_price,
      });
      return product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: qk.products });
      queryClient.invalidateQueries({ queryKey: qk.history });
      toast.success(`Added “${product.name}”`);
    },
    onError: () => toast.error("Couldn't add product"),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await getAdapter()).deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.products });
      const previous = queryClient.getQueryData<Product[]>(qk.products);
      queryClient.setQueryData<Product[]>(qk.products, (old) =>
        old?.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.products, context.previous);
      }
      toast.error("Couldn't delete product");
    },
    onSuccess: () => toast.success("Product deleted"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.products });
      queryClient.invalidateQueries({ queryKey: qk.history });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) =>
      (await getAdapter()).createCategory(name, color),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: qk.categories });
      toast.success(`Category “${category.name}” added`);
    },
    onError: () => toast.error("Couldn't add category"),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await getAdapter()).deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.categories });
      queryClient.invalidateQueries({ queryKey: qk.products });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Couldn't delete category"),
  });
}
