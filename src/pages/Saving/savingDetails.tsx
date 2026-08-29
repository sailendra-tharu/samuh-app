import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import Loader from "@/component/Loader/loader";
import { useMembers } from "@/hook/member";
import { useMemberSavings } from "@/hook/saving";

const formatAmount = (amount: number) => amount.toLocaleString();

type MonthlySaving = {
  key: string;
  month: string;
  description: string;
  fineIn: number;
  fineOut: number;
  paymentReceived: number;
};

export default function SavingDetails() {
  const { id } = useParams<{ id: string }>();
  const memberId = id && Number.isInteger(Number(id)) ? Number(id) : undefined;
  const { members, isLoading: membersLoading } = useMembers();
  const memberName = members.find((item) => item.id === memberId)?.name;
  const { savings, isLoading: savingsLoading } = useMemberSavings(
    memberId,
    memberName
  );

  const monthlySavings = useMemo(() => {
    const grouped = new Map<string, MonthlySaving>();

    savings.forEach((saving) => {
      const nepaliDate = new NepaliDate(new Date(saving.date));
      const key = nepaliDate.format("YYYY-MM");
      const existing = grouped.get(key);

      if (existing) {
        existing.fineIn += saving.fineIn ?? 0;
        existing.fineOut += saving.fineOut ?? 0;
        existing.paymentReceived += saving.paymentReceived ?? 0;

        if (saving.description) {
          existing.description = existing.description
            ? `${existing.description}; ${saving.description}`
            : saving.description;
        }

        return;
      }

      grouped.set(key, {
        key,
        month: nepaliDate.format("MMMM YYYY"),
        description: saving.description,
        fineIn: saving.fineIn ?? 0,
        fineOut: saving.fineOut ?? 0,
        paymentReceived: saving.paymentReceived ?? 0,
      });
    });

    return Array.from(grouped.values()).sort((a, b) =>
      b.key.localeCompare(a.key)
    );
  }, [savings]);

  if (membersLoading || savingsLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <Link
        to="/savings"
        className="inline-flex items-center gap-2 text-base font-semibold text-green-700 hover:text-green-800"
      >
        <ArrowLeft size={22} strokeWidth={2.5} />
        Back to savings
      </Link>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {memberName ?? savings[0]?.name ?? "Saving"} - Monthly Savings
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-[#006b45] text-left text-sm text-white">
              <tr>
                <th className="border-r border-white/20 px-4 py-3">Month</th>
                <th className="border-r border-white/20 px-4 py-3">Fine In</th>
                <th className="border-r border-white/20 px-4 py-3">Fine Out</th>
                <th className="border-r border-white/20 px-4 py-3">
                  Payment Received
                </th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {monthlySavings.map((saving) => (
                <tr key={saving.key} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {saving.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(saving.fineIn)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(saving.fineOut)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(saving.paymentReceived)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {saving.description || "—"}
                  </td>
                </tr>
              ))}

              {monthlySavings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No savings recorded for this member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
