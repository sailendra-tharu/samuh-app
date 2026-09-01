import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retrying an INSERT after a lost response can create duplicate records.
      // Users can retry explicitly after confirming whether the first request committed.
      retry: false,
    },
  },
});
