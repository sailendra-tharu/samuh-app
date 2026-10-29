import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import Loader from "@/component/Loader/loader";
import { queryClient } from "@/lib/queryclient";
import { router } from "@/routes/routes";
import { AuthProvider } from "@/context/authcontext";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense
          fallback={<Loader variant="screen" />}
        >
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}
