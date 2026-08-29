import { lazy } from "react";
import Layout from "@/layout/applayout";
import PublicRoute from "./publicRoutes";
import ProtectedRoute from "./privateRoutes";
import { createBrowserRouter, Navigate } from "react-router-dom";


const Loans = lazy(() => import("@/pages/Loans/loans"));
const Members = lazy(() => import("@/pages/Member/member"));
const Savings = lazy(() => import("@/pages/Saving/saving"));
const SavingDetails = lazy(() => import("@/pages/Saving/savingDetails"));
const Login = lazy(() => import("@/pages/Auth/login/login"));
const Dashboard = lazy(() => import("@/pages/Dashboard/dashboard"));


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
       {
        path: "savings",
        element: <Savings />,
       },
       {
        path: "savings/:id",
        element: <SavingDetails />,
       },
       {
        path: "loans",
        element: <Loans />,
      },
    ],
  },
]);
