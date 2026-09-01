import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  searchMembers,
} from "@/api/member";
import type { Member } from "@/api/member";
import { useState, useEffect } from "react";


export function useMembers() {
  const queryClient = useQueryClient();


  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });


  const createMutation = useMutation({
    mutationFn: createMember,

    onSuccess: (newMember) => {
      queryClient.setQueryData<Member[]>(["members"], (currentMembers) => [
        ...(currentMembers ?? []),
        newMember,
      ]);

      queryClient.invalidateQueries({
        queryKey: ["members"],
      });
    },

    onError: (error) => {
      console.log("Create error:", error);
    },
  });


  const updateMutation = useMutation({
    mutationFn: updateMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });
    },

    onError: (error) => {
      console.log("Update error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["savings"],
      });
    },

    onError: (error) => {
      console.log("Delete error:", error);
    },
  });


  return {
    members: membersQuery.data ?? [],

    isLoading: membersQuery.isLoading,

    createMember: createMutation.mutateAsync,

    updateMember: updateMutation.mutateAsync,

    deleteMember: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}


export function useSearchMembers(searchQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchQueryResult = useQuery({
    queryKey: ["members", "search", debouncedQuery],
    queryFn: () => searchMembers(debouncedQuery),
    enabled: true,
  });

  return {
    members: searchQueryResult.data ?? [],
    isLoading: searchQueryResult.isLoading,
  };
}
