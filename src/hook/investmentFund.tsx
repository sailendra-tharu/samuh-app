import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInvestmentFundIssue,
  deleteInvestmentFundIssue,
  getInvestmentFundIssues,
  updateInvestmentFundIssue,
  type InvestmentFundIssue,
} from "@/api/investmentFund";

const queryKey = ["investment-fund-issues"];

export function useInvestmentFundIssues() {
  const queryClient = useQueryClient();
  const issuesQuery = useQuery({
    queryKey,
    queryFn: getInvestmentFundIssues,
  });

  const createMutation = useMutation({
    mutationFn: createInvestmentFundIssue,
    onSuccess: (newIssue) => {
      queryClient.setQueryData<InvestmentFundIssue[]>(queryKey, (issues) => [
        newIssue,
        ...(issues ?? []),
      ]);
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateInvestmentFundIssue,
    onSuccess: (updatedIssue) => {
      queryClient.setQueryData<InvestmentFundIssue[]>(queryKey, (issues) =>
        (issues ?? []).map((issue) =>
          issue.id === updatedIssue.id ? updatedIssue : issue
        )
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteInvestmentFundIssue,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<InvestmentFundIssue[]>(queryKey, (issues) =>
        (issues ?? []).filter((issue) => issue.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    issues: issuesQuery.data ?? [],
    isLoading: issuesQuery.isLoading,
    error: issuesQuery.error,
    createIssue: createMutation.mutateAsync,
    updateIssue: updateMutation.mutateAsync,
    deleteIssue: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
