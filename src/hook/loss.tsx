import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createLossEntry,
  deleteLossEntry,
  getLossEntries,
  updateLossEntry,
  type LossEntry,
} from "@/api/loss";

export function useLossEntries() {
  const queryClient = useQueryClient();
  const queryKey = ["loss-entries"];
  const lossQuery = useQuery({
    queryKey,
    queryFn: getLossEntries,
  });

  const saveMutation = useMutation({
    mutationFn: (entry: LossEntry) =>
      entry.id === undefined ? createLossEntry(entry) : updateLossEntry(entry),
    onSuccess: (savedEntry) => {
      queryClient.setQueryData<LossEntry[]>(queryKey, (currentEntries) => {
        const entries = currentEntries ?? [];

        if (savedEntry.id === undefined) return [savedEntry, ...entries];

        const exists = entries.some((entry) => entry.id === savedEntry.id);

        return exists
          ? entries.map((entry) =>
              entry.id === savedEntry.id ? savedEntry : entry
            )
          : [savedEntry, ...entries];
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLossEntry,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<LossEntry[]>(queryKey, (currentEntries) =>
        (currentEntries ?? []).filter((entry) => entry.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    lossEntries: lossQuery.data ?? [],
    isLoading: lossQuery.isLoading,
    error: lossQuery.error,
    saveLoss: saveMutation.mutateAsync,
    deleteLoss: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
