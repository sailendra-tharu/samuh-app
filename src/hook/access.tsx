import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMemberSectionPermissions,
  saveMemberSectionPermissions,
} from "@/api/access";
import {
  defaultMemberSectionPermissions,
  noMemberSectionPermissions,
  type MemberSectionPermissions,
  type SectionKey,
} from "@/lib/access";
import { useAuth } from "@/context/authcontext";

export const sectionAccessQueryKey = ["member-section-access"];

export function useSectionAccess() {
  const { isAuthenticated, isAdmin } = useAuth();
  const permissionsQuery = useQuery({
    queryKey: sectionAccessQueryKey,
    queryFn: getMemberSectionPermissions,
    enabled: isAuthenticated,
    retry: false,
  });
  const permissions = permissionsQuery.data
    ?? (permissionsQuery.isError && !isAdmin
      ? noMemberSectionPermissions
      : defaultMemberSectionPermissions);

  return {
    permissions,
    isLoading: permissionsQuery.isLoading,
    error: permissionsQuery.error,
    isAdmin,
    canView: (section: SectionKey) => isAdmin || permissions[section].canView,
    canWrite: (section: SectionKey) => isAdmin || permissions[section].canWrite,
  };
}

export function useSaveSectionAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveMemberSectionPermissions,
    onSuccess: (permissions: MemberSectionPermissions) => {
      queryClient.setQueryData(sectionAccessQueryKey, permissions);
    },
  });
}

