import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/context/authcontext";
import Loader from "@/component/Loader/loader";

type Props = {
  children: ReactNode;
};

export default function PublicRoute({ children }: Props) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
