import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import Layout from "@/layout/applayout";


const Login = lazy(
  () => import("@/pages/auth/Login/login")
);


const Dashboard = lazy(
  () => import("@/pages/Dashboard/dashboard")
);



export const router = createBrowserRouter([

  {
    path: "/login",
    element: <Login />,
  },


  {
    path: "/",
    element: <Layout />,

    children: [

      {
        index: true,
        element: <Dashboard />,
      },


      {
        path: "dashboard",
        element: <Dashboard />,
      }

    ]
  }

]);