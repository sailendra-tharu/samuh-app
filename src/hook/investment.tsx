import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  createInvestment,
  deleteInvestment,
  getInvestments,
  searchInvestments,
  updateInvestment,
  type Investment,
} from "@/api/investment";

export function useInvestments() {
  const queryClient = useQueryClient();
  const queryKey = ["investments"];
  const investmentsQuery = useQuery({
    queryKey,
    queryFn: getInvestments,
  });

  const createMutation = useMutation({
    mutationFn: createInvestment,
    onSuccess: (newInvestment) => {
      queryClient.setQueryData<Investment[]>(queryKey, (currentInvestments) => [
        newInvestment,
        ...(currentInvestments ?? []),
      ]);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateInvestment,
    onSuccess: (updatedInvestment) => {
      queryClient.setQueryData<Investment[]>(queryKey, (currentInvestments) =>
        (currentInvestments ?? []).map((investment) =>
          investment.id === updatedInvestment.id
            ? updatedInvestment
            : investment
        )
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvestment,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Investment[]>(queryKey, (currentInvestments) =>
        (currentInvestments ?? []).filter(
          (investment) => investment.id !== deletedId
        )
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    investments: investmentsQuery.data ?? [],
    isLoading: investmentsQuery.isLoading,
    error: investmentsQuery.error,
    createInvestment: createMutation.mutateAsync,
    updateInvestment: updateMutation.mutateAsync,
    deleteInvestment: deleteMutation.mutateAsync,
  };
}

export function useSearchInvestments(searchQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const investmentsQuery = useQuery({
    queryKey: ["investments", "search", debouncedQuery],
    queryFn: () => searchInvestments(debouncedQuery),
    enabled: Boolean(debouncedQuery.trim()),
  });

  return {
    investments: investmentsQuery.data ?? [],
    isLoading: investmentsQuery.isLoading,
    error: investmentsQuery.error,
  };
}
