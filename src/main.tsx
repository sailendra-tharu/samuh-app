import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import "@/index.css";
import Loader from "@/component/Loader/loader";
import { queryClient } from "@/lib/queryclient";
import { router } from "@/routes/routes";
import { AuthProvider } from "@/context/authcontext";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </QueryClientProvider>
);