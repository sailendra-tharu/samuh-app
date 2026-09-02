import { lazy } from "react";
import Layout from "@/layout/applayout";
import PublicRoute from "./publicRoutes";
import ProtectedRoute from "./privateRoutes";
import { AdminRoute, SectionRoute } from "./privateRoutes";
import { createBrowserRouter, Navigate } from "react-router-dom";

/* eslint-disable react-refresh/only-export-components -- This module is route configuration, not a component module. */

const Loans = lazy(() => import("@/pages/Loans/loans"));
const LoanDetails = lazy(() => import("@/pages/Loans/loanDetails"));
const Members = lazy(() => import("@/pages/Member/member"));
const Savings = lazy(() => import("@/pages/Saving/saving"));
const SavingDetails = lazy(() => import("@/pages/Saving/savingDetails"));
const Login = lazy(() => import("@/pages/Auth/login/login"));
const Dashboard = lazy(() => import("@/pages/Dashboard/dashboard"));
const ProfitLoss = lazy(() => import("@/pages/ProfitLoss/profitLoss"));
const Investment = lazy(() => import("@/pages/Investment/investment"));
const AccessControl = lazy(() => import("@/pages/AccessControl/accessControl"));
const NoAccess = lazy(() => import("@/pages/AccessControl/noAccess"));


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
        element: (
          <SectionRoute section="dashboard">
            <Dashboard />
          </SectionRoute>
        ),
      },
       {
        path: "members",
        element: (
          <SectionRoute section="members">
            <Members />
          </SectionRoute>
        ),
       },
       {
        path: "savings",
        element: (
          <SectionRoute section="savings">
            <Savings />
          </SectionRoute>
        ),
       },
       {
        path: "savings/:id",
        element: (
          <SectionRoute section="savings">
            <SavingDetails />
          </SectionRoute>
        ),
       },
       {
        path: "loans",
        element: (
          <SectionRoute section="loans">
            <Loans />
          </SectionRoute>
        ),
      },
      {
        path: "loans/:id",
        element: (
          <SectionRoute section="loans">
            <LoanDetails />
          </SectionRoute>
        ),
      },
      {
        path: "profit-loss",
        element: (
          <SectionRoute section="profit-loss">
            <ProfitLoss />
          </SectionRoute>
        ),
      },
      {
        path: "investment",
        element: (
          <SectionRoute section="investment">
            <Investment />
          </SectionRoute>
        ),
      },
      {
        path: "access-control",
        element: (
          <AdminRoute>
            <AccessControl />
          </AdminRoute>
        ),
      },
      {
        path: "no-access",
        element: <NoAccess />,
      },
    ],
  },
]);
