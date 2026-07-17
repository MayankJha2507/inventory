import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Settings, SettingsPatch } from "@/types";
import { getAdapter } from "@/data/adapter";
import { qk } from "@/data/keys";

export function useSettings() {
  return useQuery({
    queryKey: qk.settings,
    queryFn: async () => (await getAdapter()).getSettings(),
    staleTime: Infinity,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: SettingsPatch) =>
      (await getAdapter()).updateSettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: qk.settings });
      const previous = queryClient.getQueryData<Settings>(qk.settings);
      if (previous) {
        queryClient.setQueryData<Settings>(qk.settings, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.settings, context.previous);
      }
      toast.error("Couldn't save settings");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.settings });
    },
  });
}

/** Convenience hook — the active currency code with a sensible fallback. */
export function useCurrency(): string {
  const { data } = useSettings();
  return data?.currency ?? "USD";
}
