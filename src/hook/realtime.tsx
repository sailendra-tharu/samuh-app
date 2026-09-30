import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";

// Which cached queries to refresh when a table changes. Keys are prefixes, so
// ["loans"] also refreshes loan searches and loan details.
const tableQueryKeys: Record<string, string[][]> = {
  saving: [["savings"]],
  // Loans read the member name through a join, so they depend on members too.
  members: [["members"], ["loans"], ["savings"]],
  loans: [["loans"]],
  loan_payments: [["loans"]],
  investments: [["investments"]],
  investment_fund_issues: [["investment-fund-issues"]],
  loss_entries: [["loss-entries"]],
  section_access: [["member-section-access"]],
  profiles: [["profile-role"]],
};

export function useRealtimeSync(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel("app-data-changes");

    Object.entries(tableQueryKeys).forEach(([table, queryKeys]) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryKeys.forEach((queryKey) => {
            void queryClient.invalidateQueries({ queryKey });
          });
        }
      );
    });

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}
