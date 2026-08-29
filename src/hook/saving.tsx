import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  createSaving,
  deleteSaving,
  getSavings,
  searchSavings,
  updateSaving,
  type Saving,
} from "@/api/saving";

export function useSavings() {
  const queryClient = useQueryClient();

  const savingsQuery = useQuery({
    queryKey: ["savings"],
    queryFn: getSavings,
  });

  const createMutation = useMutation({
    mutationFn: createSaving,
    onSuccess: (newSaving) => {
      queryClient.setQueryData<Saving[]>(["savings"], (currentSavings) => [
        newSaving,
        ...(currentSavings ?? []),
      ]);
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSaving,
    onSuccess: (updatedSaving) => {
      queryClient.setQueryData<Saving[]>(["savings"], (currentSavings) =>
        (currentSavings ?? []).map((saving) =>
          saving.id === updatedSaving.id ? updatedSaving : saving
        )
      );
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSaving,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Saving[]>(["savings"], (currentSavings) =>
        (currentSavings ?? []).filter((saving) => saving.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
  });

  return {
    savings: savingsQuery.data ?? [],
    isLoading: savingsQuery.isLoading,
    createSaving: createMutation.mutateAsync,
    updateSaving: updateMutation.mutateAsync,
    deleteSaving: deleteMutation.mutate,
  };
}

export function useSearchSavings(searchQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const savingsQuery = useQuery({
    queryKey: ["savings", "search", debouncedQuery],
    queryFn: () => searchSavings(debouncedQuery),
    enabled: Boolean(debouncedQuery.trim()),
  });

  return {
    savings: savingsQuery.data ?? [],
    isLoading: savingsQuery.isLoading,
  };
}
