import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "@/layout/applayout";

import ProtectedRoute from "./privateRoutes";
import PublicRoute from "./publicRoutes";

const Login = lazy(() => import("@/pages/Auth/login/login"));
const Dashboard = lazy(() => import("@/pages/Dashboard/dashboard"));
const Members = lazy(() => import("@/pages/Member/member"));


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
       {
        path: "members",
        element: <Members />,
      },
    ],
  },
]);