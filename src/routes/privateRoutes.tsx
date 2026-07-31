import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/context/authcontext";

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