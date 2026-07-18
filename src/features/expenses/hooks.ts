import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Expense, ExpensePatch, NewExpense } from "@/types";
import { getAdapter } from "@/data/adapter";
import { qk } from "@/data/keys";

export function useExpenses() {
  return useQuery({
    queryKey: qk.expenses,
    queryFn: async () => (await getAdapter()).listExpenses(),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewExpense) =>
      (await getAdapter()).createExpense(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.expenses });
      toast.success("Expense added");
    },
    onError: () => toast.error("Couldn't add expense"),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: ExpensePatch }) =>
      (await getAdapter()).updateExpense(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: qk.expenses });
      const previous = queryClient.getQueryData<Expense[]>(qk.expenses);
      queryClient.setQueryData<Expense[]>(qk.expenses, (old) =>
        old?.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.expenses, context.previous);
      }
      toast.error("Couldn't save expense");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.expenses });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await getAdapter()).deleteExpense(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.expenses });
      const previous = queryClient.getQueryData<Expense[]>(qk.expenses);
      queryClient.setQueryData<Expense[]>(qk.expenses, (old) =>
        old?.filter((e) => e.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.expenses, context.previous);
      }
      toast.error("Couldn't delete expense");
    },
    onSuccess: () => toast.success("Expense deleted"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.expenses });
    },
  });
}
