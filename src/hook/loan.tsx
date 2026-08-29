import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  createLoan,
  createLoanPayment,
  deleteLoan,
  getLoans,
  getLoanById,
  renewLoan,
  searchLoans,
  updateLoan,
  type Loan,
} from "@/api/loan";

export function useLoans() {
  const queryClient = useQueryClient();

  const loansQuery = useQuery({
    queryKey: ["loans"],
    queryFn: getLoans,
  });

  const createMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: (newLoan) => {
      queryClient.setQueryData<Loan[]>(["loans"], (currentLoans) => [
        newLoan,
        ...(currentLoans ?? []),
      ]);
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateLoan,
    onSuccess: (updatedLoan) => {
      queryClient.setQueryData<Loan[]>(["loans"], (currentLoans) =>
        (currentLoans ?? []).map((loan) =>
          loan.id === updatedLoan.id ? updatedLoan : loan
        )
      );
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLoan,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Loan[]>(["loans"], (currentLoans) =>
        (currentLoans ?? []).filter((loan) => loan.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: createLoanPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const renewalMutation = useMutation({
    mutationFn: renewLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  return {
    loans: loansQuery.data ?? [],
    isLoading: loansQuery.isLoading,
    error: loansQuery.error,
    createLoan: createMutation.mutateAsync,
    updateLoan: updateMutation.mutateAsync,
    deleteLoan: deleteMutation.mutateAsync,
    createLoanPayment: paymentMutation.mutateAsync,
    renewLoan: renewalMutation.mutateAsync,
    isRenewing: renewalMutation.isPending,
  };
}

export function useSearchLoans(searchQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loansQuery = useQuery({
    queryKey: ["loans", "search", debouncedQuery],
    queryFn: () => searchLoans(debouncedQuery),
    enabled: Boolean(debouncedQuery.trim()),
  });

  return {
    loans: loansQuery.data ?? [],
    isLoading: loansQuery.isLoading,
    error: loansQuery.error,
  };
}

export function useLoanDetails(loanId?: number) {
  const loanQuery = useQuery({
    queryKey: ["loans", "details", loanId],
    queryFn: () => getLoanById(loanId as number),
    enabled: loanId !== undefined,
  });

  return {
    loan: loanQuery.data ?? null,
    isLoading: loanQuery.isLoading,
    error: loanQuery.error,
  };
}

export function useRenewLoan() {
  const queryClient = useQueryClient();

  const renewalMutation = useMutation({
    mutationFn: renewLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  return {
    renewLoan: renewalMutation.mutateAsync,
    isRenewing: renewalMutation.isPending,
  };
}
