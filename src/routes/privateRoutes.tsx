import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/context/authcontext";
import { useSectionAccess } from "@/hook/access";
import { sectionDefinitions, type SectionKey } from "@/lib/access";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

type SectionRouteProps = Props & {
  section: SectionKey;
};

export function SectionRoute({ children, section }: SectionRouteProps) {
  const { canView, permissions, isLoading } = useSectionAccess();

  if (isLoading) return <div>Loading...</div>;

  if (canView(section)) return children;

  const firstAllowedSection = sectionDefinitions.find(
    (item) => permissions[item.key].canView
  );

  return (
    <Navigate
      to={firstAllowedSection?.path ?? "/no-access"}
      replace
    />
  );
}

export function AdminRoute({ children }: Props) {
  const { isAdmin } = useAuth();

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}
